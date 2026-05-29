import { Module } from '@nestjs/common';
import { postgres } from './providers';

@Module({
  providers: [postgres],
  exports: [postgres],
})
export class DatabaseModule {}
