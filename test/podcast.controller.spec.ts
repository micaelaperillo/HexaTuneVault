import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { PodcastController } from '../src/controller/podcast.controller';
import { GET_PODCAST, SEARCH_PODCAST } from '../src/port';
import { PodcastResponseDto } from '../src/dto';

import type { PodcastModel } from '../src/model';

describe('PodcastController', () => {
  let controller: PodcastController;

  const mockPodcast: PodcastModel = {
    name: 'Joe Rogan',
    avatar: 'avatar-url',
    description: 'desc',
    publisher: 'pub',
    total_episodes: 1,
    external_urls: {
      spotify: 'spotify-url',
    },
  };

  const mockResponse: PodcastResponseDto = {
    name: 'Joe Rogan',
    avatar: 'avatar-url',
    description: 'desc',
    publisher: 'pub',
    total_episodes: 1,
    external_urls: {
      spotify: 'spotify-url',
    },
    self: '/api/podcasts/Joe%20Rogan',
    reviews: '/api/reviews?podcast=Joe+Rogan',
  };

  const mockGet = { get: jest.fn() };
  const mockSearch = { search: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PodcastController],
      providers: [
        { provide: GET_PODCAST, useValue: mockGet },
        { provide: SEARCH_PODCAST, useValue: mockSearch },
      ],
    }).compile();

    controller = module.get(PodcastController);
  });

  describe('search', () => {
    it('calls searcher port with name filter and returns mapped responses', async () => {
      mockSearch.search.mockResolvedValue([mockPodcast]);

      const result = await controller.search({ q: mockPodcast.name });

      expect(mockSearch.search).toHaveBeenCalledWith({ name: 'Joe Rogan' });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockResponse);
    });

    it('calls searcher port with filters and returns mapped responses', async () => {
      mockSearch.search.mockResolvedValue([mockPodcast]);

      const result = await controller.search({
        q: mockPodcast.name,
        market: 'US',
        explicit: 'true',
        media_type: 'video',
      });

      expect(mockSearch.search).toHaveBeenCalledWith({
        name: 'Joe Rogan',
        market: 'US',
        explicit: true,
        mediaType: 'video',
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockResponse);
    });
  });

  describe('get', () => {
    it('calls getter port with name filter and returns mapped response when found', async () => {
      mockGet.get.mockResolvedValue(mockPodcast);

      const result = await controller.get({ name: mockPodcast.name });

      expect(mockGet.get).toHaveBeenCalledWith({ name: 'Joe Rogan' });
      expect(result).toEqual(mockResponse);
    });

    it('throws NotFoundException when getter port returns null', async () => {
      mockGet.get.mockResolvedValue(null);

      await expect(controller.get({ name: 'Unknown Podcast' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockGet.get).toHaveBeenCalledWith({ name: 'Unknown Podcast' });
    });
  });
});
