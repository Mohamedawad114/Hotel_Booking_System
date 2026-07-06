import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CryptoService,
  EmailProducer,
  HashingService,
  redis,
  redisKeys,
  TokenServices,
  TTL,
  TwoFAService,
  UserRepository,
} from 'src/common';
import { IUser } from 'src/common/interfaces';
import { UpdateProfileDto, UpdatePasswordDto, ResetPasswordDto } from './Dto';
import { Request, Response } from 'express';
import { UserMapper } from './entities/userProfile.mapper';
import { emailType } from 'src/common/enums';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly crypto: CryptoService,
    private readonly emailQueue: EmailProducer,
    private readonly hashService: HashingService,
    private readonly tokenServices: TokenServices,
    private readonly twoFA: TwoFAService,
  ) {}

  getProfile = async (user: IUser) => {
    const profile = await this.userRepo.findById(user.id, {
      omit: {
        password: true,
        secret: true,
        BackupCodes: true,
      },
    });
    profile.phone = this.crypto.decryption(profile.phone);
    return {
      data: {
        profile: UserMapper.toCreateEntity(profile),
      },
      message: 'user profile',
    };
  };
  updateProfile = async (user: IUser, data: UpdateProfileDto) => {
    const userData = await this.userRepo.findById(user.id);
    if (!userData) throw new NotFoundException('user not found');
    const updatedData: any = { ...data };
    if (data.email && data.email !== user.email) {
      const emailExists = await this.userRepo.findByEmail(data.email, {
        omit: {
          password: true,
          secret: true,
          BackupCodes: true,
        },
      });
      if (emailExists) {
        throw new ConflictException(`email already existed`);
      }
      updatedData.isConfirmed = false;
      await this.emailQueue.sendEmailJob('confirmation', data.email);
    }
    if (updatedData.phone)
      updatedData.phone = this.crypto.encryption(updatedData.phone);
    const updatedUser = await this.userRepo.updateOne(
      { id: user.id },
      {
        ...updatedData,
      },
    );
    if (!updatedUser) throw new BadRequestException(`something wrong`);
    return {
      message: 'user updated successfully',
      data: { profile: UserMapper.toCreateEntity(updatedUser) },
    };
  };
  updatePassword = async (
    Dto: UpdatePasswordDto,
    user: IUser,
    res: Response,
  ) => {
    const userData = await this.userRepo.findById(user.id, {
      select: {
        password: true,
        id: true,
        email: true,
      },
    });
    if (!userData) throw new NotFoundException('user not found');
    const isMatch = await this.hashService.compare_hash(
      Dto.oldPassword,
      userData.password as string,
    );
    if (!isMatch) throw new BadRequestException('invalid password');
    if (Dto.newPassword !== Dto.confirmNewPassword)
      throw new BadRequestException('confirmPassword must match new Password');
    await this.userRepo.updateOne(
      { id: user.id },
      { password: Dto.confirmNewPassword },
    );
    const keys = await redis.keys(redisKeys.refreshToken(user.id, '*'));
    if (keys.length) await redis.del(...keys);
    res.clearCookie('refreshToken');
    return { message: 'password is changed successfully' };
  };
  resetPasswordReq = async (user: IUser) => {
    this.emailQueue.sendEmailJob(emailType.resetPassword, user.email);
    return { message: `OTP is sent` };
  };
  async resendOTP_reset(user: IUser) {
    this.emailQueue.sendEmailJob(emailType.resetPassword, user.email);
    return { message: `OTP is sent` };
  }
  resetPasswordConfirm = async (
    user: IUser,
    Dto: ResetPasswordDto,
    res: Response,
  ) => {
    if (!user) throw new BadRequestException('user not found');
    const savedOTP = await redis.getdel(redisKeys.resetPassword(user.email));
    if (!savedOTP) throw new BadRequestException(`expire OTP.`);
    const isMatch = await this.hashService.compare_hash(Dto.OTP, savedOTP);
    if (!isMatch) throw new BadRequestException(`Invalid OTP`);
    await this.userRepo.updateOne(
      { id: user.id },
      { password: Dto.newPassword },
    );
    const keys = await redis.keys(redisKeys.refreshToken(user.id, '*'));
    if (keys.length) await redis.del(...keys);
    res.clearCookie('refreshToken');
    return { message: 'password reset successfully' };
  };
  setup2FA = async (user: IUser) => {
    const email = user.email;
    const { url } = await this.twoFA.generateSecret(email);
    return { data: { qr: url } };
  };

  verifySetup2FA = async (user: IUser, code: string) => {
    const secretHashed = await redis.getdel(redisKeys.secret(user.email));
    if (!secretHashed) throw new UnauthorizedException();
    const secret = this.crypto.decryption(secretHashed);
    const isValid = await this.twoFA.verifyCode(code, secret);
    if (isValid) {
      const { hashedCodes, backupCodes } =
        await this.twoFA.generateBackupCodes();
      await this.userRepo.updateOne(
        { id: user.id, isTwoFA: false },
        {
          isTwoFA: true,
          secret: this.crypto.encryption(secret),
          BackupCodes: hashedCodes,
        },
      );
      return {
        message: '2FA is enabled ,please save this codes',
        data: { backupCodes },
      };
    } else return { message: 'code is incorrect' };
  };

  logout = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    const accessToken = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new BadRequestException('no refresh token found');
    const decoded = this.tokenServices.VerifyRefreshToken(token);
    await redis.del(redisKeys.refreshToken(decoded.id, decoded.jti));
    await redis.set(
      redisKeys.token_blackList(accessToken as string),
      '0',
      'EX',
    TTL.token_blackList
    );
    res.clearCookie('refreshToken');
    return;
  };

  logoutAllDevices = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    const accessToken = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new BadRequestException('no refresh token found');
    const decoded = this.tokenServices.VerifyRefreshToken(token);
    const stream = redis.scanStream({
      match: redisKeys.refreshToken(decoded.id, '*'),
      count: 100,
    });
    for await (const keys of stream) {
      if (keys.length) {
        await redis.del(...keys);
      }
    }
    await redis.set(
      redisKeys.token_blackList(accessToken as string),
      '0',
      'EX',
      TTL.token_blackList
    );
    res.clearCookie('refreshToken');
    return;
  };
}
