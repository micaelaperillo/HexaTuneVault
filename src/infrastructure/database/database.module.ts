import { Module } from '@nestjs/common';
import { postgres } from './provider/index.js';

@Module({
  providers: [postgres],
  exports: [postgres],
})
export class DatabaseModule {}
