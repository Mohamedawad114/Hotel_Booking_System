import { Global, Module } from '@nestjs/common';
import { UserRepository } from './repositories/prisma repositories';
import { ProviderModule, TokenModule } from './Utils';
@Global()
@Module({
  imports: [TokenModule,ProviderModule],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class CommonModule {}
