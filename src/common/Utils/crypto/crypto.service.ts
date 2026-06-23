import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private key: Buffer;

  constructor() {
    if (!process.env.CRYPTO_KEY) throw new Error('CRYPTO_KEY is missing');
    this.key = Buffer.from(process.env.CRYPTO_KEY as string, 'hex');
  }

  encryption(text: string): string {
    if (!text) throw new BadRequestException('Encryption text is required');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const authTag = cipher.getAuthTag();
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  }

  decryption(payload: string): string {
    const [ivHex, encryptedHex, authTagHex] = payload.split(':');
    if (!ivHex || !encryptedHex || !authTagHex)
      throw new Error('Invalid encrypted payload');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
    return decrypted;
  }
}
