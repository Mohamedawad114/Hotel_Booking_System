import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenServices } from './token.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: `${process.env.SECRET_KEY}`,
    }),
  ],
  providers: [TokenServices],
  exports: [TokenServices],
})
export class TokenModule {}
