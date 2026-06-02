import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { ImageController } from '../src/controller/image.controller';

describe('ImageController', () => {
  let controller: ImageController;

  const mockResponse = {
    location: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageController],
    }).compile();

    controller = module.get(ImageController);
  });

  describe('create', () => {
    it('sets the Location header to the uploaded file location and returns void', () => {
      const mockFile = {
        filename: 'photo.jpg',
        size: 1024,
        location: 'https://s3.example.com/photo.jpg',
      } as Express.Multer.File & { location: string };

      const result = controller.create(mockFile, mockResponse);

      expect(mockResponse.location).toHaveBeenCalledWith(
        'https://s3.example.com/photo.jpg',
      );
      expect(result).toBeUndefined();
    });
  });
});
