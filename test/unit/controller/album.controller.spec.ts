import { Test, TestingModule } from '@nestjs/testing';
import { AlbumController } from '../../../src/controller/album.controller';
import { GET_ALBUM, SEARCH_ALBUM } from '../../../src/use-case/album.service';
import { AlbumModel } from '../../../src/model/album.model';
import { NotFoundException } from '@nestjs/common';

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

  const pageOf = (album: AlbumModel) => ({
    items: [album],
    total: 1,
    page: 1,
    pageSize: 10,
  });

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
    it('calls searcher port with name filter and returns a page of responses', async () => {
      mockSearch.search.mockResolvedValue(pageOf(mockAlbum));
      const result = await controller.search({
        q: 'Abbey Road',
        page: 1,
        page_size: 10,
      });

      expect(mockSearch.search).toHaveBeenCalledWith({
        name: 'Abbey Road',
        artist: undefined,
        year: undefined,
        page: 1,
        pageSize: 10,
      });
      expect(result.total).toBe(1);
      expect(result.items[0]).toEqual({
        name: 'Abbey Road',
        cover: 'cover-url',
        release_date: new Date('1969'),
        total_tracks: 17,
        artists: ['The Beatles'],
        self: '/api/albums/Abbey%20Road?artist=The+Beatles&year=1969',
        reviews: '/api/reviews?album=Abbey+Road',
        external_urls: {
          spotify: 'spotify-url',
        },
      });
    });

    it('calls searcher port with artist filter and returns a page of responses', async () => {
      mockSearch.search.mockResolvedValue(pageOf(mockAlbum));
      const result = await controller.search({
        artist: 'The Beatles',
        page: 1,
        page_size: 10,
      });

      expect(mockSearch.search).toHaveBeenCalledWith({
        name: undefined,
        artist: 'The Beatles',
        year: undefined,
        page: 1,
        pageSize: 10,
      });
      expect(result.items[0].self).toBe(
        '/api/albums/Abbey%20Road?artist=The+Beatles&year=1969',
      );
    });

    it('calls searcher port with year filter and returns a page of responses', async () => {
      mockSearch.search.mockResolvedValue(pageOf(mockAlbum));
      const result = await controller.search({
        year: 1969,
        page: 1,
        page_size: 10,
      });

      expect(mockSearch.search).toHaveBeenCalledWith({
        name: undefined,
        artist: undefined,
        year: 1969,
        page: 1,
        pageSize: 10,
      });
      expect(result.items[0].self).toBe(
        '/api/albums/Abbey%20Road?artist=The+Beatles&year=1969',
      );
    });
  });

  describe('get', () => {
    it('calls getter port with name filter and returns mapped response when found', async () => {
      mockGet.get.mockResolvedValue(mockAlbum);
      const result = await controller.get(
        { name: 'Abbey Road' },
        { page: 1, page_size: 10 },
      );

      expect(mockGet.get).toHaveBeenCalledWith({ name: 'Abbey Road' });
      expect(result).toEqual({
        name: 'Abbey Road',
        cover: 'cover-url',
        release_date: new Date('1969'),
        total_tracks: 17,
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

      await expect(
        controller.get({ name: 'Unknown Album' }, { page: 1, page_size: 10 }),
      ).rejects.toThrow(NotFoundException);
      expect(mockGet.get).toHaveBeenCalledWith({ name: 'Unknown Album' });
    });

    it('passes artist and year filters to getter port when provided', async () => {
      mockGet.get.mockResolvedValue(mockAlbum);

      const result = await controller.get(
        { name: 'Abbey Road' },
        { artist: 'The Beatles', year: 1969, page: 1, page_size: 10 },
      );

      expect(mockGet.get).toHaveBeenCalledWith({
        name: 'Abbey Road',
        artist: 'The Beatles',
        year: 1969,
      });
      expect(result.name).toBe('Abbey Road');
    });
  });
});
