import { Test, TestingModule } from '@nestjs/testing';

import { SPOTIFY_API } from '../src/infrastructure/api/provider';
import { SpotifyPodcastProvider } from '../src/adapter';
import { PodcastProviderError } from '../src/error';

import type { PodcastModel } from '../src/model';

describe('SpotifyArtistProvider', () => {
  let provider: SpotifyPodcastProvider;

  const mockApiResponse = {
    shows: {
      items: [
        {
          copyrights: [],
          description: 'The official podcast of comedian Joe Rogan.',
          html_description:
            '<p>The official podcast of comedian Joe Rogan.</p>',
          explicit: true,
          external_urls: {
            spotify: 'https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk',
          },
          href: 'https://api.spotify.com/v1/shows/4rOoJ6Egrf8K2IrywzwOMk',
          id: '4rOoJ6Egrf8K2IrywzwOMk',
          images: [
            {
              height: 640,
              url: 'https://i.scdn.co/image/ab6765630000ba8a1e1acaebe06610165612f1ef',
              width: 640,
            },
            {
              height: 300,
              url: 'https://i.scdn.co/image/ab67656300005f1f1e1acaebe06610165612f1ef',
              width: 300,
            },
            {
              height: 64,
              url: 'https://i.scdn.co/image/ab6765630000f68d1e1acaebe06610165612f1ef',
              width: 64,
            },
          ],
          is_externally_hosted: false,
          languages: ['en'],
          media_type: 'mixed',
          name: 'The Joe Rogan Experience',
          type: 'show',
          uri: 'spotify:show:4rOoJ6Egrf8K2IrywzwOMk',
          total_episodes: 2700,
        },
        {
          copyrights: [],
          description: `The "Shawn Ryan Show" is hosted by Shawn Ryan, former U.S. Navy SEAL, CIA Contractor, and Founder of Vigilance Elite. We tell REAL stories about REAL people from all walks of life. We discuss the ups and downs, wins and losses, successes and struggles, the good and bad in a respectful but candid way with our guest. We're better than entertainment, we're the REAL thing. Please enjoy the show.`,
          html_description:
            '<p>The &#34;Shawn Ryan Show&#34; is hosted by Shawn Ryan, former U.S. Navy SEAL, CIA Contractor, and Founder of Vigilance Elite. We tell REAL stories about REAL people from all walks of life. We discuss the ups and downs, wins and losses, successes and struggles, the good and bad in a respectful but candid way with our guest. We&#39;re better than entertainment, we&#39;re the REAL thing. Please enjoy the show.</p>',
          explicit: true,
          external_urls: {
            spotify: 'https://open.spotify.com/show/5eodRZd3qR9VT1ip1wI7xQ',
          },
          href: 'https://api.spotify.com/v1/shows/5eodRZd3qR9VT1ip1wI7xQ',
          id: '5eodRZd3qR9VT1ip1wI7xQ',
          images: [
            {
              height: 640,
              url: 'https://i.scdn.co/image/ab6765630000ba8ae9712ed711cfbd89cd3e3d94',
              width: 640,
            },
            {
              height: 300,
              url: 'https://i.scdn.co/image/ab67656300005f1fe9712ed711cfbd89cd3e3d94',
              width: 300,
            },
            {
              height: 64,
              url: 'https://i.scdn.co/image/ab6765630000f68de9712ed711cfbd89cd3e3d94',
              width: 64,
            },
          ],
          is_externally_hosted: false,
          languages: ['en-US'],
          media_type: 'mixed',
          name: 'The Shawn Ryan Show',
          type: 'show',
          uri: 'spotify:show:5eodRZd3qR9VT1ip1wI7xQ',
          total_episodes: 367,
        },
      ],
      total: 2,
    },
  };

  const mockMappedApiResponse = [
    {
      name: 'The Joe Rogan Experience',
      description: 'The official podcast of comedian Joe Rogan.',
      publisher: undefined,
      total_episodes: 2700,
      avatar:
        'https://i.scdn.co/image/ab6765630000ba8a1e1acaebe06610165612f1ef',
      external_urls: {
        spotify: 'https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk',
      },
    },
    {
      name: 'The Shawn Ryan Show',
      description: `The "Shawn Ryan Show" is hosted by Shawn Ryan, former U.S. Navy SEAL, CIA Contractor, and Founder of Vigilance Elite. We tell REAL stories about REAL people from all walks of life. We discuss the ups and downs, wins and losses, successes and struggles, the good and bad in a respectful but candid way with our guest. We're better than entertainment, we're the REAL thing. Please enjoy the show.`,
      publisher: undefined,
      total_episodes: 367,
      avatar:
        'https://i.scdn.co/image/ab6765630000ba8ae9712ed711cfbd89cd3e3d94',
      external_urls: {
        spotify: 'https://open.spotify.com/show/5eodRZd3qR9VT1ip1wI7xQ',
      },
    },
  ] satisfies PodcastModel[];

  const mockInfrastructure = {
    search: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyPodcastProvider,
        { provide: SPOTIFY_API, useValue: mockInfrastructure },
      ],
    }).compile();

    provider = module.get(SpotifyPodcastProvider);
  });

  describe('search', () => {
    it('searchs by name using the Spotify SDK', async () => {
      mockInfrastructure.search.mockResolvedValue(mockApiResponse);
      const filters = { name: 'Joe Rogan' };

      const result = await provider.search(filters);

      expect(mockInfrastructure.search).toHaveBeenCalledWith(
        'Joe Rogan',
        ['show'],
        'US',
        10,
        0,
      );
      expect(result.items).toStrictEqual(mockMappedApiResponse);
      expect(result.total).toBe(2);
    });

    it('searchs with API filters using the Spotify SDK', async () => {
      mockInfrastructure.search.mockResolvedValue(mockApiResponse);
      const filters = { name: 'Joe Rogan', market: 'AR' };

      const result = await provider.search(filters);

      expect(mockInfrastructure.search).toHaveBeenCalledWith(
        'Joe Rogan',
        ['show'],
        'AR',
        10,
        0,
      );
      expect(result.items).toStrictEqual(mockMappedApiResponse);
      expect(result.total).toBe(2);
    });

    it('applies custom filters', async () => {
      const res = structuredClone(mockApiResponse);
      const chill_joe = { ...mockApiResponse.shows.items[0] };
      chill_joe.explicit = false;
      const asmr_joe = { ...mockApiResponse.shows.items[0] };
      asmr_joe.media_type = 'audio';
      res.shows.items.push(chill_joe, asmr_joe);
      mockInfrastructure.search.mockResolvedValue(res);
      const filters = {
        name: 'Joe Rogan',
        explicit: true,
        mediaType: 'mixed',
      };

      const result = await provider.search(filters);

      expect(result.items).toStrictEqual(mockMappedApiResponse);
    });

    it('filters incomplete response', async () => {
      const res = structuredClone(mockApiResponse);
      const fake_joe = { ...mockApiResponse.shows.items[0] };
      fake_joe.images = [];
      res.shows.items.push(fake_joe);
      mockInfrastructure.search.mockResolvedValue(res);
      const filters = { name: 'Joe Rogan' };

      const result = await provider.search(filters);

      expect(result.items).toStrictEqual(mockMappedApiResponse);
    });

    it('throws if the SDK fails', async () => {
      mockInfrastructure.search.mockRejectedValue(new Error());
      const filters = { name: 'Illegal API request' };

      await expect(provider.search(filters)).rejects.toBeInstanceOf(
        PodcastProviderError,
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
      const filters = { name: 'Joe Rogan' };

      const result = await provider.get(filters);

      expect(mockInfrastructure.search).toHaveBeenCalledWith(
        'Joe Rogan',
        ['show'],
        'US',
        10,
        0,
      );
      expect(result).toStrictEqual(mockMappedApiResponse[0]);
    });

    it('returns null when not found', async () => {
      const res = { ...mockApiResponse };
      res.shows.items = [];
      mockInfrastructure.search.mockResolvedValue(res);
      const filters = { name: 'Unknown Podcast' };

      const result = await provider.get(filters);

      expect(result).toStrictEqual(null);
    });
  });
});
