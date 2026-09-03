import { Injectable, NotFoundException } from '@nestjs/common';
import { emailType } from 'src/common/enums';
import { CryptoService, EmailProducer, redis, redisKeys, UserRepository } from 'src/common';

@Injectable()
export class DashboardUserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailQueue: EmailProducer,
    private readonly cryptoService: CryptoService,
  ) {}
  async getAllUsers(search?: string, city?: string, page = 1, pageSize = 20) {
    const value = search?.trim();
    const filter = {
      ...(city?.trim()
        ? { city: { contains: city.trim(), mode: 'insensitive' } }
        : {}),
      ...(value
        ? {
            OR: [
              { email: { contains: value, mode: 'insensitive' } },
              { name: { contains: value, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [users, total] = await Promise.all([
      this.userRepo.findMany(filter, {
        select: { id: true, name: true, email: true, photoUrl: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.userRepo.count(filter),
    ]);
    return {
      message: 'users',
      data: users.map(({ photoUrl, ...user }) => ({
        ...user,
        photo: photoUrl,
      })),
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }
  async getUserDetails(id: number) {
    const user = await this.userRepo.findById(id, {
      omit: { password: true, secret: true, BackupCodes: true },
    });
    if (!user) throw new NotFoundException('user not found');
    const userData = { ...user, phone: this.cryptoService.decryption(user.phone) };
    return { message: 'user details', data: userData };
  }

  async banUser(id: number, isBanned: boolean) {
    const user = await this.userRepo.findById(id, {
      select: { id: true, email: true },
    });
    if (!user) throw new NotFoundException('user not found');
    if (isBanned) {
      const keys = await redis.keys(redisKeys.refreshToken(id, '*'));
      if (keys.length) await redis.del(...keys);
      await this.emailQueue.sendEmailJob(emailType.BanedUser, user.email);
    }
    const updatedUser = await this.userRepo.updateOne({ id }, { isBanned });
    return {
      message: isBanned
        ? 'user banned successfully'
        : 'user unbanned successfully',
      data: { id: updatedUser.id, isBanned: updatedUser.isBanned },
    };
  }
}
