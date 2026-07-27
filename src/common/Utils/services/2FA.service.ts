import { CryptoService } from '../crypto/crypto.service';
import { generateSecret, generateURI, verify } from 'otplib';
import { redis, redisKeys, TTL } from './redis';
import * as qr from 'qrcode';
import { HashingService } from '../Hashing/hash.service';
import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
@Injectable()
export class TwoFAService {
  constructor(
    private readonly crypto: CryptoService,
    private readonly hashService: HashingService,
  ) {}

  async generateSecret(email: string) {
    const secret = generateSecret();
    const secretEncrypted = this.crypto.encryption(secret);
    await redis.setex(redisKeys.secret(email), TTL.secret, secretEncrypted);
    const otpauth = generateURI({
      label: email,
      issuer: 'Travalo',
      secret: secret,
    });
    const url = await qr.toDataURL(otpauth);
    return {
      url,
    };
  }
  verifyCode = async (code: string, secret: string) => {
    const result = await verify({ token: code, secret });
    return result.valid;
  };
  generateBackupCodes = async () => {
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = randomBytes(8).toString('hex').toUpperCase(); 
      backupCodes.push(code);
    }
    const hashedCodes = await Promise.all(
      backupCodes.map(async (c) => this.hashService.generateHash(c)),
    );
    return {
      backupCodes,
      hashedCodes,
    };
  };
  validateBackupCodes = async (code: string, hashedCodes: string[]) => {
    if (!hashedCodes?.length) return { auth: false };
    for (const HashedCode of hashedCodes) {
      if (await this.hashService.compare_hash(code, HashedCode)) {
        const newHashedCodes = hashedCodes.filter((val) => val !== HashedCode);
        return { auth: true, newHashedCodes };
      }
    }
    return { auth: false };
  };
}
