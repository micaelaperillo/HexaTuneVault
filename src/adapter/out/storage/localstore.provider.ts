import { diskStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import type { Request } from 'express';

import * as path from 'node:path';
import * as crypto from 'node:crypto';

const uploads = path.join(process.cwd(), 'uploads');
const content = 'user-content';

// Names the uploaded file and stashes its public URL on `file.location` for the
// controller to read back. Exported so the naming/URL logic can be unit-tested.
export function uploadFilename(
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void,
): void {
  const location = `${Date.now()}${crypto.randomInt(10_000)}.png`;

  // @ts-expect-error Fake the location property for the controller
  file.location = // Reduce TS comment scope
    new URL(
      `${content}/${location}`,
      `${req.protocol}://${req.get('host')}`,
    ).toString();

  cb(null, location);
}

export const localstore = [
  MulterModule.register({
    storage: diskStorage({
      destination: path.join(uploads, content),
      filename: uploadFilename,
    }),
  }),
  ServeStaticModule.forRoot({
    rootPath: uploads,
    renderPath: content,
    serveStaticOptions: {
      index: false,
      redirect: false,
      cacheControl: true,
    },
  }),
];
