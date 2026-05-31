import { Module } from '@nestjs/common';

import { StorageModule } from '../infrastructure/storage/storage.module';
import { ImageController } from '../controller/image.controller';

@Module({
  imports: [StorageModule],
  controllers: [ImageController],
})
export class ImageModule {}
