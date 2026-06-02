import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { ArtistController } from '../../../src/controller/artist.controller';
import { GET_ARTIST, SEARCH_ARTIST } from '../../../src/port';
import { ArtistResponseDto } from '../../../src/dto';

import type { ArtistModel } from '../../../src/model';

describe('ArtistController', () => {
  let controller: ArtistController;

  const mockArtist: ArtistModel = {
    name: 'The Beatles',
    avatar: 'avatar-url',
    external_urls: {
      spotify: 'spotify-url',
    },
  };

  const mockResponse: ArtistResponseDto = {
    name: 'The Beatles',
    avatar: 'avatar-url',
    external_urls: {
      spotify: 'spotify-url',
    },
    self: '/api/artists/The%20Beatles',
    albums: '/api/albums?artist=The+Beatles',
    reviews: '/api/reviews?artist=The+Beatles',
  };

  const mockGet = { get: jest.fn() };
  const mockSearch = { search: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistController],
      providers: [
        { provide: GET_ARTIST, useValue: mockGet },
        { provide: SEARCH_ARTIST, useValue: mockSearch },
      ],
    }).compile();

    controller = module.get(ArtistController);
  });

  describe('search', () => {
    const pageOf = (artist: ArtistModel) => ({
      items: [artist],
      total: 1,
      page: 1,
      pageSize: 10,
    });

    it('calls searcher port with name filter and returns a page of responses', async () => {
      mockSearch.search.mockResolvedValue(pageOf(mockArtist));

      const result = await controller.search({
        q: mockArtist.name,
        page: 1,
        page_size: 10,
      });

      expect(mockSearch.search).toHaveBeenCalledWith({
        name: 'The Beatles',
        genre: undefined,
        page: 1,
        pageSize: 10,
      });
      expect(result.total).toBe(1);
      expect(result.items[0]).toEqual(mockResponse);
    });

    it('calls searcher port with genre filter and returns a page of responses', async () => {
      mockSearch.search.mockResolvedValue(pageOf(mockArtist));

      const result = await controller.search({
        q: mockArtist.name,
        genre: ['Rock'],
        page: 1,
        page_size: 10,
      });

      expect(mockSearch.search).toHaveBeenCalledWith({
        name: 'The Beatles',
        genre: ['Rock'],
        page: 1,
        pageSize: 10,
      });
      expect(result.items[0]).toEqual(mockResponse);
    });
  });

  describe('get', () => {
    it('calls getter port with name filter and returns mapped response when found', async () => {
      mockGet.get.mockResolvedValue(mockArtist);

      const result = await controller.get({ name: mockArtist.name });

      expect(mockGet.get).toHaveBeenCalledWith({ name: 'The Beatles' });
      expect(result).toEqual(mockResponse);
    });

    it('throws NotFoundException when getter port returns null', async () => {
      mockGet.get.mockResolvedValue(null);

      await expect(controller.get({ name: 'Unknown Artist' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockGet.get).toHaveBeenCalledWith({ name: 'Unknown Artist' });
    });
  });

  describe('search with multiple genres', () => {
    it('forwards multiple genre values to the searcher port', async () => {
      mockSearch.search.mockResolvedValue({
        items: [mockArtist],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      const result = await controller.search({
        q: mockArtist.name,
        genre: ['Rock', 'Pop'],
        page: 1,
        page_size: 10,
      });

      expect(mockSearch.search).toHaveBeenCalledWith({
        name: 'The Beatles',
        genre: ['Rock', 'Pop'],
        page: 1,
        pageSize: 10,
      });
      expect(result.items[0]).toEqual(mockResponse);
    });
  });
});
