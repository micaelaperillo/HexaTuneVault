import { Module } from '@nestjs/common';
import { postgres } from './provider';

@Module({
  providers: [postgres],
  exports: [postgres],
})
export class DatabaseModule {}
