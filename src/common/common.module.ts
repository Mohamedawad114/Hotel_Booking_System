import { Global, Module } from '@nestjs/common';
import { UserRepository } from './repositories/prisma repositories';
import { TokenModule } from './Utils';
@Global()
@Module({
  imports: [TokenModule],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class CommonModule {}
