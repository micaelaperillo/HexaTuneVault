import { diskStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';

import * as path from 'node:path';
import * as crypto from 'node:crypto';

const uploads = path.join(process.cwd(), 'uploads');

export const localstore = [
  MulterModule.register({
    storage: diskStorage({
      destination: path.join(uploads, 'user-content'),
      filename: (_req, _file, cb) =>
        cb(null, `${Date.now()}${crypto.randomInt(10_000)}.png`),
    }),
  }),
  ServeStaticModule.forRoot({
    rootPath: uploads,
  }),
];
