import { Module } from '@nestjs/common';

import { localstore } from '../../adapter/storage/localstore.provider';

@Module({
  imports: [...localstore],
  exports: [...localstore],
})
export class StorageModule {}
