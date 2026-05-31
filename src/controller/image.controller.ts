import type { Express, Response } from 'express';

import {
  Controller,
  Logger,
  ParseFilePipeBuilder,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/images')
export class ImageController {
  private readonly logger = new Logger(ImageController.name);

  @Post()
  @UseInterceptors(FileInterceptor('img'))
  create(
    @UploadedFile(
      new ParseFilePipeBuilder()
        // 10mb
        .addMaxSizeValidator({ maxSize: 10_000_000 })
        .addFileTypeValidator({ fileType: /^image\/(png|jpeg|gif)$/ })
        .build(),
    )
    file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`Uploaded ${file.filename} (${file.size} bytes)`);
    res.location(`/user-content/${file.filename}`);
  }
}
