import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidV4 } from 'uuid';
import { redis, redisKeys } from '../redis';
import { Sys_Role } from 'src/common/enums';
import { TTL } from '../redis';
import { IDecodedToken, IToken } from 'src/common/interfaces';
import { Response } from 'express';

@Injectable()
export class TokenServices {
  constructor(private readonly Jwt: JwtService) {}

  generateTokens = async (
    { id, name, role = Sys_Role.User }: IToken,
    Res: Response,
  ) => {
    const jti = uuidV4();
    const accessToken = this.Jwt.sign({ id, name, role }, { expiresIn: '30m' });
    const refreshToken = this.Jwt.sign(
      { id, name, role, jti },
      { expiresIn: '7d' },
    );
    await redis.setex(redisKeys.refreshToken(id,jti), TTL.refreshToken, '1');
    Res?.cookie('refreshToken', refreshToken, {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      maxAge: TTL.refreshToken * 1000,
    });
    return { accessToken };
  };

  generateAccessToken = (payload: IToken) => {
    return this.Jwt.sign(payload, { expiresIn: '30m' });
  };
  generateRefreshTokens = async (
    { id, name, role = Sys_Role.User }: IToken,
    Res: any,
  ) => {
    const newJti = uuidV4();
    const refreshToken = this.Jwt.sign(
      { id, name, role, jti: newJti },
      { expiresIn: '7d' },
    );
    await redis.setex(redisKeys.refreshToken(id,newJti), TTL.refreshToken, '1');
    Res?.cookie('refreshToken', refreshToken, {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      maxAge: TTL.refreshToken * 1000,
    });
  };
  VerifyAccessToken = (Token: string): IDecodedToken => {
    try {
      return this.Jwt.verify(Token);
    } catch (error) {
      throw new UnauthorizedException('Invalid access token or token expired');
    }
  };
  VerifyRefreshToken = (Token: string): IDecodedToken => {
    if (!Token) {
      throw new UnauthorizedException('token is required');
    }
    try {
      return this.Jwt.verify(Token);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token or token expired');
    }
  };
}
