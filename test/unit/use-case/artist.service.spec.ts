import { Test, TestingModule } from '@nestjs/testing';

import { ArtistService } from '../../../src/use-case/artist.service';
import { ARTIST_PROVIDER } from '../../../src/port/out';

import type { ArtistModel } from '../../../src/model';

describe('ArtistService', () => {
  let service: ArtistService;

  const mockArtist: ArtistModel = {
    name: 'The Beatles',
    avatar: 'avatar-url',
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
        ArtistService,
        { provide: ARTIST_PROVIDER, useValue: mockProvider },
      ],
    }).compile();

    service = module.get(ArtistService);
  });

  describe('search', () => {
    it('delegates to the provider and returns search results', async () => {
      mockProvider.search.mockResolvedValue([mockArtist]);
      const filters = { name: 'The Beatles', genre: ['Rock'] };

      const result = await service.search(filters);

      expect(mockProvider.search).toHaveBeenCalledWith(filters);
      expect(result).toStrictEqual([mockArtist]);
    });
  });

  describe('get', () => {
    it('delegates to the provider and returns get result', async () => {
      mockProvider.get.mockResolvedValue(mockArtist);
      const filters = { name: 'The Beatles' };

      const result = await service.get(filters);

      expect(mockProvider.get).toHaveBeenCalledWith(filters);
      expect(result).toStrictEqual(mockArtist);
    });

    it('returns null if provider returns null', async () => {
      mockProvider.get.mockResolvedValue(null);
      const filters = { name: 'Unknown Artist' };

      const result = await service.get(filters);

      expect(mockProvider.get).toHaveBeenCalledWith(filters);
      expect(result).toBeNull();
    });
  });
});
