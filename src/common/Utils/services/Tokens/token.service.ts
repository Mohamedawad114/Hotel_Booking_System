import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidV4 } from 'uuid';
import { redis } from '../redis';
import { Sys_Role } from 'src/common/enums';
import { TTL } from '../redis';
import { IDecodedToken, IToken } from 'src/common/interfaces';

@Injectable()
export class TokenServices {
  constructor(private readonly Jwt: JwtService) {}

  generateTokens = async (
    { id, username, role = Sys_Role.User }: IToken,
    Res: any,
  ) => {
    const jti = uuidV4();
    const accessToken = this.Jwt.sign(
      { id, username, role },
      { expiresIn: '30m' },
    );
    const refreshToken = this.Jwt.sign(
      { id, username, role, jti },
      { expiresIn: '7d' },
    );
    await redis.setex(`refreshToken_${id}:${jti}`, TTL.refreshToken, '1');
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
    { id, username, role = Sys_Role.User }: IToken,
    Res: any,
  ) => {
    const newJti = uuidV4();
    const refreshToken = this.Jwt.sign(
      { id, username, role, jti: newJti },
      { expiresIn: '7d' },
    );
    await redis.setex(`refreshToken_${id}:${newJti}`, TTL.refreshToken, '1');
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
