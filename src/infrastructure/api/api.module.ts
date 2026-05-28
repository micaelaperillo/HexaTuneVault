import { Module } from '@nestjs/common';
import { spotify } from './provider';

@Module({
  providers: [spotify],
  exports: [spotify],
})
export class ExternalApiModule {}
