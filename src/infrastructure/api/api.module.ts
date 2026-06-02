import { Module } from '@nestjs/common';
import { spotify } from '../../adapter/catalog/spotify.provider';

@Module({
  providers: [spotify],
  exports: [spotify],
})
export class ExternalApiModule {}
