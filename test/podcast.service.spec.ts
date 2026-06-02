import { Test, TestingModule } from '@nestjs/testing';

import { PodcastService } from '../src/use-case/podcast.service';
import { PODCAST_PROVIDER } from '../src/repository';

import type { PodcastModel } from '../src/model';

describe('ArtistService', () => {
  let service: PodcastService;

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

  const mockProvider = {
    search: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PodcastService,
        { provide: PODCAST_PROVIDER, useValue: mockProvider },
      ],
    }).compile();

    service = module.get(PodcastService);
  });

  describe('search', () => {
    it('delegates to the provider and returns search results', async () => {
      mockProvider.search.mockResolvedValue([mockPodcast]);
      const filters = { name: 'Joe Rogan', explicit: true };

      const result = await service.search(filters);

      expect(mockProvider.search).toHaveBeenCalledWith(filters);
      expect(result).toStrictEqual([mockPodcast]);
    });
  });

  describe('get', () => {
    it('delegates to the provider and returns get result', async () => {
      mockProvider.get.mockResolvedValue(mockPodcast);
      const filters = { name: 'Joe Rogan' };

      const result = await service.get(filters);

      expect(mockProvider.get).toHaveBeenCalledWith(filters);
      expect(result).toStrictEqual(mockPodcast);
    });

    it('returns null if provider returns null', async () => {
      mockProvider.get.mockResolvedValue(null);
      const filters = { name: 'Unknown Podcast' };

      const result = await service.get(filters);

      expect(mockProvider.get).toHaveBeenCalledWith(filters);
      expect(result).toBeNull();
    });
  });
});
