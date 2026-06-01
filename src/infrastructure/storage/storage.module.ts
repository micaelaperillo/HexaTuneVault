import { Module } from '@nestjs/common';

import { localstore } from './provider';

@Module({
  imports: [...localstore],
  exports: [...localstore],
})
export class StorageModule {}
