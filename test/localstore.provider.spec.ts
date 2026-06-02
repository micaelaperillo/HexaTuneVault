import type { Request } from 'express';
import {
  localstore,
  uploadFilename,
} from '../src/infrastructure/storage/provider/localstore.provider';

describe('localstore provider', () => {
  it('registers the multer and static-serving modules', () => {
    expect(localstore).toHaveLength(2);
  });

  describe('uploadFilename', () => {
    it('names the file .png and stashes a public URL on file.location', () => {
      const req = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      } as unknown as Request;
      const file = {} as Express.Multer.File;
      const cb = jest.fn();

      uploadFilename(req, file, cb);

      expect(cb).toHaveBeenCalledTimes(1);
      const [error, name] = cb.mock.calls[0] as [Error | null, string];
      expect(error).toBeNull();
      expect(name).toMatch(/^\d+\.png$/);
      expect((file as unknown as { location: string }).location).toBe(
        `http://localhost:3000/user-content/${name}`,
      );
    });
  });
});
