import { Module } from '@nestjs/common';
import { spotify } from '../../adapter/out/catalog/spotify.provider';

@Module({
  providers: [spotify],
  exports: [spotify],
})
export class ExternalApiModule {}
