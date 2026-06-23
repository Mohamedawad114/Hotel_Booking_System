import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
@Injectable()
export class HashingService {
  generateHash = async (data: string): Promise<string> => {
    const saltRounds = parseInt(process.env.SALT as string);
    return await bcrypt.hash(data, saltRounds);
  };

  compare_hash = async (data: string, hashed: string): Promise<boolean> => {
    return await bcrypt.compare(data, hashed);
  };
}
