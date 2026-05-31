import { diskStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';

import * as path from 'node:path';
import * as crypto from 'node:crypto';

const uploads = path.join(process.cwd(), 'uploads');
const content = 'user-content';

export const localstore = [
  MulterModule.register({
    storage: diskStorage({
      destination: path.join(uploads, content),
      filename: (req, file, cb) => {
        const location = `${Date.now()}${crypto.randomInt(10_000)}.png`;

        // @ts-expect-error Fake the location property for the controller
        file.location = // Reduce TS comment scope
          new URL(
            `${content}/${location}`,
            `${req.protocol}://${req.get('host')}`,
          ).toString();

        cb(null, location);
      },
    }),
  }),
  ServeStaticModule.forRoot({
    rootPath: uploads,
  }),
];
