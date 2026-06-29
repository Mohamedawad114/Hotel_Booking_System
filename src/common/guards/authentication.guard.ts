import {
  CanActivate,
  NotFoundException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { redis, redisKeys, TokenServices } from '../Utils';
import { UserRepository } from '../repositories/prisma repositories';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenServices,
    private readonly userRepo: UserRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType<GqlContextType>();
    switch (type) {
      case 'http': {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader) return false;
        const token = authHeader.split(' ')[1];
        if (!token) return false;
        const decoded = this.tokenService.VerifyAccessToken(token);
        const isBlacklisted = await redis.get(redisKeys.token_blackList(token));
        if (isBlacklisted) return false;
        const user = await this.userRepo.findById(decoded.id);
        if (!user) throw new NotFoundException('user not found');
        request.user = user;
        return true;
      }
    }
    return true;
  }
}
