import { Test, TestingModule } from '@nestjs/testing';
import { AlbumController } from '../src/controller/album.controller';
import { GET_ALBUM, SEARCH_ALBUM } from '../src/use-case/album.service';
import { AlbumModel } from '../src/model/album.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AlbumController', () => {
  let controller: AlbumController;

  const mockAlbum: AlbumModel = {
    name: 'Abbey Road',
    cover: 'cover-url',
    releaseDate: '1969',
    totalTracks: 17,
    artists: ['The Beatles'],
  };

  const mockGet = { get: jest.fn() };
  const mockSearch = { search: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumController],
      providers: [
        { provide: GET_ALBUM, useValue: mockGet },
        { provide: SEARCH_ALBUM, useValue: mockSearch },
      ],
    }).compile();

    controller = module.get(AlbumController);
  });

  describe('search', () => {
    it('throws BadRequestException if neither name nor artist query params are provided', async () => {
      await expect(controller.search(undefined, undefined)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockSearch.search).not.toHaveBeenCalled();
    });

    it('throws BadRequestException if query params are empty strings', async () => {
      await expect(controller.search('', '')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockSearch.search).not.toHaveBeenCalled();
    });

    it('calls searcher port with name filter and returns mapped responses', async () => {
      mockSearch.search.mockResolvedValue([mockAlbum]);
      const result = await controller.search('Abbey Road', undefined);

      expect(mockSearch.search).toHaveBeenCalledWith({
        name: 'Abbey Road',
        artist: undefined,
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Abbey Road',
        cover: 'cover-url',
        releaseDate: '1969',
        totalTracks: 17,
        artists: ['The Beatles'],
        self: '/api/albums/Abbey%20Road',
        reviews: '/api/reviews?album=Abbey+Road',
      });
    });

    it('calls searcher port with artist filter and returns mapped responses', async () => {
      mockSearch.search.mockResolvedValue([mockAlbum]);
      const result = await controller.search(undefined, 'The Beatles');

      expect(mockSearch.search).toHaveBeenCalledWith({
        name: undefined,
        artist: 'The Beatles',
      });
      expect(result).toHaveLength(1);
      expect(result[0].self).toBe('/api/albums/Abbey%20Road');
    });
  });

  describe('get', () => {
    it('calls getter port with name filter and returns mapped response when found', async () => {
      mockGet.get.mockResolvedValue(mockAlbum);
      const result = await controller.get('Abbey Road');

      expect(mockGet.get).toHaveBeenCalledWith({ name: 'Abbey Road' });
      expect(result).toEqual({
        name: 'Abbey Road',
        cover: 'cover-url',
        releaseDate: '1969',
        totalTracks: 17,
        artists: ['The Beatles'],
        self: '/api/albums/Abbey%20Road',
        reviews: '/api/reviews?album=Abbey+Road',
      });
    });

    it('throws NotFoundException when getter port returns null', async () => {
      mockGet.get.mockResolvedValue(null);

      await expect(controller.get('Unknown Album')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockGet.get).toHaveBeenCalledWith({ name: 'Unknown Album' });
    });
  });
});
