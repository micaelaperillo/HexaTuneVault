import { Test, TestingModule } from '@nestjs/testing';

import { SPOTIFY_API } from '../../../src/infrastructure/api/provider';
import { SpotifyAlbumProvider } from '../../../src/adapter';
import { AlbumProviderError } from '../../../src/error/album';

import type { AlbumModel } from '../../../src/model';

describe('SpotifyAlbumProvider', () => {
  let provider: SpotifyAlbumProvider;

  const mockApiResponse = {
    albums: {
      items: [
        {
          name: 'Abbey Road',
          images: [
            {
              url: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25',
              height: 640,
              width: 640,
            },
            {
              url: 'https://i.scdn.co/image/ab67616d00001e02dc30583ba717007b00cceb25',
              height: 300,
              width: 300,
            },
          ],
          release_date: '1969-09-26',
          total_tracks: 17,
          artists: [{ name: 'The Beatles' }],
          external_urls: {
            spotify: 'https://open.spotify.com/album/0ETFjACtuP2ADo6LFhL6HN',
          },
        },
        {
          name: 'Let It Be',
          images: [
            {
              url: 'https://i.scdn.co/image/ab67616d0000b2731452027f6ccccf66a1fc0757',
              height: 640,
              width: 640,
            },
          ],
          release_date: '1970-05-08',
          total_tracks: 12,
          artists: [{ name: 'The Beatles' }],
          external_urls: {
            spotify: 'https://open.spotify.com/album/7vEJAtP3KgKSpOHVgwm3Eh',
          },
        },
      ],
      total: 2,
    },
  };

  const mockMappedApiResponse = [
    {
      name: 'Abbey Road',
      cover: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25',
      releaseDate: new Date('1969-09-26'),
      totalTracks: 17,
      artists: ['The Beatles'],
      external_urls: {
        spotify: 'https://open.spotify.com/album/0ETFjACtuP2ADo6LFhL6HN',
      },
    },
    {
      name: 'Let It Be',
      cover: 'https://i.scdn.co/image/ab67616d0000b2731452027f6ccccf66a1fc0757',
      releaseDate: new Date('1970-05-08'),
      totalTracks: 12,
      artists: ['The Beatles'],
      external_urls: {
        spotify: 'https://open.spotify.com/album/7vEJAtP3KgKSpOHVgwm3Eh',
      },
    },
  ] satisfies AlbumModel[];

  const mockInfrastructure = {
    search: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyAlbumProvider,
        { provide: SPOTIFY_API, useValue: mockInfrastructure },
      ],
    }).compile();

    provider = module.get(SpotifyAlbumProvider);
  });

  describe('search', () => {
    it('searches by name using the Spotify SDK', async () => {
      mockInfrastructure.search.mockResolvedValue(mockApiResponse);
      const filters = { name: 'Abbey Road' };

      const result = await provider.search(filters);

      expect(mockInfrastructure.search).toHaveBeenCalledWith(
        'Abbey Road',
        ['album'],
        undefined,
        10,
        0,
      );
      expect(result.items).toStrictEqual(mockMappedApiResponse);
      expect(result.total).toBe(2);
    });

    it('searches by name and artist using the Spotify SDK', async () => {
      mockInfrastructure.search.mockResolvedValue(mockApiResponse);
      const filters = { name: 'Abbey Road', artist: 'The Beatles' };

      const result = await provider.search(filters);

      expect(mockInfrastructure.search).toHaveBeenCalledWith(
        'Abbey Road The Beatles',
        ['album'],
        undefined,
        10,
        0,
      );
      expect(result.items).toStrictEqual(mockMappedApiResponse);
    });

    it('includes year filter in query when provided', async () => {
      mockInfrastructure.search.mockResolvedValue(mockApiResponse);
      const filters = { name: 'Abbey Road', year: 1969 };

      await provider.search(filters);

      expect(mockInfrastructure.search).toHaveBeenCalledWith(
        'Abbey Road year:1969',
        ['album'],
        undefined,
        10,
        0,
      );
    });

    it('builds query from artist and year without name', async () => {
      mockInfrastructure.search.mockResolvedValue(mockApiResponse);
      const filters = { artist: 'The Beatles', year: 1969 };

      await provider.search(filters);

      expect(mockInfrastructure.search).toHaveBeenCalledWith(
        'The Beatles year:1969',
        ['album'],
        undefined,
        10,
        0,
      );
    });

    it('filters incomplete response (no images)', async () => {
      const res = structuredClone(mockApiResponse);
      const fake_album = { ...mockApiResponse.albums.items[0] };
      fake_album.images = [];
      res.albums.items.push(fake_album);
      mockInfrastructure.search.mockResolvedValue(res);
      const filters = { name: 'Abbey Road' };

      const result = await provider.search(filters);

      expect(result.items).toStrictEqual(mockMappedApiResponse);
    });

    it('throws AlbumProviderError if the SDK fails', async () => {
      mockInfrastructure.search.mockRejectedValue(new Error());
      const filters = { name: 'Illegal API request' };

      await expect(provider.search(filters)).rejects.toBeInstanceOf(
        AlbumProviderError,
      );
    });

    it('raises unexpected throws untouched', async () => {
      mockInfrastructure.search.mockRejectedValue('new Error()');
      const filters = { name: 'SELECT * FROM api' };

      await expect(provider.search(filters)).rejects.toBe('new Error()');
    });
  });

  describe('get', () => {
    it('returns the first mapped item from search', async () => {
      mockInfrastructure.search.mockResolvedValue(mockApiResponse);
      const filters = { name: 'Abbey Road' };

      const result = await provider.get(filters);

      expect(mockInfrastructure.search).toHaveBeenCalledWith(
        'Abbey Road',
        ['album'],
        undefined,
        10,
        0,
      );
      expect(result).toStrictEqual(mockMappedApiResponse[0]);
    });

    it('returns null when no albums are found', async () => {
      const res = structuredClone(mockApiResponse);
      res.albums.items = [];
      mockInfrastructure.search.mockResolvedValue(res);
      const filters = { name: 'Unknown Album' };

      const result = await provider.get(filters);

      expect(result).toStrictEqual(null);
    });
  });
});
