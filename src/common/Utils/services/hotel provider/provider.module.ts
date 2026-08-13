import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HotelbedsProvider } from './provider.service';
@Global()
@Module({
  imports: [HttpModule],
  providers: [HotelbedsProvider],
  exports: [HotelbedsProvider],
})
export class ProviderModule {}
