import { diskStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';

import * as path from 'node:path';

const uploads = path.join(__dirname, '..', '..', '..', '..', 'uploads');

export const localstore = [
  MulterModule.register({
    storage: diskStorage({
      destination: path.join(uploads, 'user-content'),
    }),
  }),
  ServeStaticModule.forRoot({
    rootPath: uploads,
  }),
];
