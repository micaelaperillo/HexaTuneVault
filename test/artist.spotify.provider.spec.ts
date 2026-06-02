import { Test, TestingModule } from '@nestjs/testing';

import { SPOTIFY_API } from '../src/infrastructure/api/provider';
import { SpotifyArtistProvider } from '../src/adapter';
import { ArtistProviderError } from '../src/error';

import type { ArtistModel } from '../src/model';

describe('SpotifyArtistProvider', () => {
  let provider: SpotifyArtistProvider;

  const mockApiResponse = {
    artists: {
      items: [
        {
          external_urls: {
            spotify: 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2',
          },
          href: 'https://api.spotify.com/v1/artists/3WrFJ7ztbogyGnTHbHJFl2',
          id: '3WrFJ7ztbogyGnTHbHJFl2',
          images: [
            {
              url: 'https://i.scdn.co/image/ab6761610000e5ebe9348cc01ff5d55971b22433',
              height: 640,
              width: 640,
            },
            {
              url: 'https://i.scdn.co/image/ab67616100005174e9348cc01ff5d55971b22433',
              height: 320,
              width: 320,
            },
            {
              url: 'https://i.scdn.co/image/ab6761610000f178e9348cc01ff5d55971b22433',
              height: 160,
              width: 160,
            },
          ],
          name: 'The Beatles',
          type: 'artist',
          uri: 'spotify:artist:3WrFJ7ztbogyGnTHbHJFl2',
        },
        {
          external_urls: {
            spotify: 'https://open.spotify.com/artist/4x1nvY2FN8jxqAFA0DA02H',
          },
          href: 'https://api.spotify.com/v1/artists/4x1nvY2FN8jxqAFA0DA02H',
          id: '4x1nvY2FN8jxqAFA0DA02H',
          images: [
            {
              url: 'https://i.scdn.co/image/ab6761610000e5ebe336079626f2a1be7456486c',
              height: 640,
              width: 640,
            },
            {
              url: 'https://i.scdn.co/image/ab67616100005174e336079626f2a1be7456486c',
              height: 320,
              width: 320,
            },
            {
              url: 'https://i.scdn.co/image/ab6761610000f178e336079626f2a1be7456486c',
              height: 160,
              width: 160,
            },
          ],
          name: 'John Lennon',
          type: 'artist',
          uri: 'spotify:artist:4x1nvY2FN8jxqAFA0DA02H',
        },
      ],
      total: 2,
    },
  };

  const mockMappedApiResponse = [
    {
      name: 'The Beatles',
      avatar:
        'https://i.scdn.co/image/ab6761610000e5ebe9348cc01ff5d55971b22433',
      external_urls: {
        spotify: 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2',
      },
    },
    {
      name: 'John Lennon',
      avatar:
        'https://i.scdn.co/image/ab6761610000e5ebe336079626f2a1be7456486c',
      external_urls: {
        spotify: 'https://open.spotify.com/artist/4x1nvY2FN8jxqAFA0DA02H',
      },
    },
  ] satisfies ArtistModel[];

  const mockInfrastructure = {
    search: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyArtistProvider,
        { provide: SPOTIFY_API, useValue: mockInfrastructure },
      ],
    }).compile();

    provider = module.get(SpotifyArtistProvider);
  });

  describe('search', () => {
    it('searchs by name using the Spotify SDK', async () => {
      mockInfrastructure.search.mockResolvedValue(mockApiResponse);
      const filters = { name: 'The Beatles' };

      const result = await provider.search(filters);

      expect(mockInfrastructure.search).toHaveBeenCalledWith(
        'The Beatles',
        ['artist'],
        undefined,
        10,
        0,
      );
      expect(result.items).toStrictEqual(mockMappedApiResponse);
      expect(result.total).toBe(2);
    });

    it('searchs by name and genre using the Spotify SDK', async () => {
      mockInfrastructure.search.mockResolvedValue(mockApiResponse);
      const filters = { name: 'The Beatles', genre: ['Rock', 'Roll'] };

      const result = await provider.search(filters);

      expect(mockInfrastructure.search).toHaveBeenCalledWith(
        'The Beatles genre:Rock genre:Roll',
        ['artist'],
        undefined,
        10,
        0,
      );
      expect(result.items).toStrictEqual(mockMappedApiResponse);
    });

    it('filters incomplete response', async () => {
      const res = { ...mockApiResponse };
      const fake_beatles = { ...mockApiResponse.artists.items[0] };
      fake_beatles.images = [];
      res.artists.items.push(fake_beatles);
      mockInfrastructure.search.mockResolvedValue(res);
      const filters = { name: 'The Beatles' };

      const result = await provider.search(filters);

      expect(result.items).toStrictEqual(mockMappedApiResponse);
    });

    it('throws if the SDK fails', async () => {
      mockInfrastructure.search.mockRejectedValue(new Error());
      const filters = { name: 'Illegal API request' };

      await expect(provider.search(filters)).rejects.toBeInstanceOf(
        ArtistProviderError,
      );
    });

    it('raises unexpected throws', async () => {
      mockInfrastructure.search.mockRejectedValue('new Error()');
      const filters = { name: 'SELECT * FROM api' };

      await expect(provider.search(filters)).rejects.toBe('new Error()');
    });
  });

  describe('get', () => {
    it('searchs by name using the Spotify SDK', async () => {
      mockInfrastructure.search.mockResolvedValue(mockApiResponse);
      const filters = { name: 'The Beatles' };

      const result = await provider.get(filters);

      expect(mockInfrastructure.search).toHaveBeenCalledWith(
        'The Beatles',
        ['artist'],
        undefined,
        10,
        0,
      );
      expect(result).toStrictEqual(mockMappedApiResponse[0]);
    });

    it('returns null when not found', async () => {
      const res = { ...mockApiResponse };
      res.artists.items = [];
      mockInfrastructure.search.mockResolvedValue(res);
      const filters = { name: 'Unknown Artist' };

      const result = await provider.get(filters);

      expect(result).toStrictEqual(null);
    });
  });
});
