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
    releaseDate: new Date('1969'),
    totalTracks: 17,
    artists: ['The Beatles'],
    external_urls: {
      spotify: 'spotify-url',
    },
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
    it('throws BadRequestException if no query params are provided', async () => {
      await expect(controller.search({})).rejects.toThrow(BadRequestException);
      expect(mockSearch.search).not.toHaveBeenCalled();
    });

    it('calls searcher port with name filter and returns mapped responses', async () => {
      mockSearch.search.mockResolvedValue([mockAlbum]);
      const result = await controller.search({ q: 'Abbey Road' });

      expect(mockSearch.search).toHaveBeenCalledWith({
        name: 'Abbey Road',
        artist: undefined,
        year: undefined,
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Abbey Road',
        cover: 'cover-url',
        releaseDate: new Date('1969'),
        totalTracks: 17,
        artists: ['The Beatles'],
        self: '/api/albums/Abbey%20Road?artist=The+Beatles&year=1969',
        reviews: '/api/reviews?album=Abbey+Road',
        external_urls: {
          spotify: 'spotify-url',
        },
      });
    });

    it('calls searcher port with artist filter and returns mapped responses', async () => {
      mockSearch.search.mockResolvedValue([mockAlbum]);
      const result = await controller.search({ artist: 'The Beatles' });

      expect(mockSearch.search).toHaveBeenCalledWith({ artist: 'The Beatles' });
      expect(result).toHaveLength(1);
      expect(result[0].self).toBe(
        '/api/albums/Abbey%20Road?artist=The+Beatles&year=1969',
      );
    });

    it('calls searcher port with year filter and returns mapped responses', async () => {
      mockSearch.search.mockResolvedValue([mockAlbum]);
      const result = await controller.search({ year: 1969 });

      expect(mockSearch.search).toHaveBeenCalledWith({
        name: undefined,
        artist: undefined,
        year: 1969,
      });
      expect(result).toHaveLength(1);
      expect(result[0].self).toBe(
        '/api/albums/Abbey%20Road?artist=The+Beatles&year=1969',
      );
    });
  });

  describe('get', () => {
    it('calls getter port with name filter and returns mapped response when found', async () => {
      mockGet.get.mockResolvedValue(mockAlbum);
      const result = await controller.get({ name: 'Abbey Road' });

      expect(mockGet.get).toHaveBeenCalledWith({ name: 'Abbey Road' });
      expect(result).toEqual({
        name: 'Abbey Road',
        cover: 'cover-url',
        releaseDate: new Date('1969'),
        totalTracks: 17,
        artists: ['The Beatles'],
        self: '/api/albums/Abbey%20Road?artist=The+Beatles&year=1969',
        reviews: '/api/reviews?album=Abbey+Road',
        external_urls: {
          spotify: 'spotify-url',
        },
      });
    });

    it('throws NotFoundException when getter port returns null', async () => {
      mockGet.get.mockResolvedValue(null);

      await expect(controller.get({ name: 'Unknown Album' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockGet.get).toHaveBeenCalledWith({ name: 'Unknown Album' });
    });
  });
});
