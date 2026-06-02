import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';
import { SPOTIFY_API } from '../src/infrastructure/api/provider';
import { AllExceptionsFilter } from '../src/infrastructure/filter/all-exceptions.filter';
import { filters } from '../src/infrastructure/filter/http-exception.mappers';
import { ArtistResponseDto, PodcastResponseDto } from '../src/dto';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

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
    },
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
    },
  };

  const mockArtistApiResponse = [
    {
      name: 'The Beatles',
      avatar:
        'https://i.scdn.co/image/ab6761610000e5ebe9348cc01ff5d55971b22433',
      external_urls: {
        spotify: 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2',
      },
      self: '/api/artists/The%20Beatles',
      albums: '/api/albums?artist=The+Beatles',
      reviews: '/api/reviews?artist=The+Beatles',
    },
    {
      name: 'John Lennon',
      avatar:
        'https://i.scdn.co/image/ab6761610000e5ebe336079626f2a1be7456486c',
      external_urls: {
        spotify: 'https://open.spotify.com/artist/4x1nvY2FN8jxqAFA0DA02H',
      },
      self: '/api/artists/John%20Lennon',
      albums: '/api/albums?artist=John+Lennon',
      reviews: '/api/reviews?artist=John+Lennon',
    },
  ] satisfies ArtistResponseDto[];

  const mockPodcastApiResponse = [
    {
      name: 'The Joe Rogan Experience',
      description: 'The official podcast of comedian Joe Rogan.',
      total_episodes: 2700,
      avatar:
        'https://i.scdn.co/image/ab6765630000ba8a1e1acaebe06610165612f1ef',
      external_urls: {
        spotify: 'https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk',
      },
      self: '/api/podcasts/The%20Joe%20Rogan%20Experience',
      reviews: '/api/reviews?podcast=The+Joe+Rogan+Experience',
    },
    {
      name: 'The Shawn Ryan Show',
      description: `The "Shawn Ryan Show" is hosted by Shawn Ryan, former U.S. Navy SEAL, CIA Contractor, and Founder of Vigilance Elite. We tell REAL stories about REAL people from all walks of life. We discuss the ups and downs, wins and losses, successes and struggles, the good and bad in a respectful but candid way with our guest. We're better than entertainment, we're the REAL thing. Please enjoy the show.`,
      total_episodes: 367,
      avatar:
        'https://i.scdn.co/image/ab6765630000ba8ae9712ed711cfbd89cd3e3d94',
      external_urls: {
        spotify: 'https://open.spotify.com/show/5eodRZd3qR9VT1ip1wI7xQ',
      },
      self: '/api/podcasts/The%20Shawn%20Ryan%20Show',
      reviews: '/api/reviews?podcast=The+Shawn+Ryan+Show',
    },
  ] satisfies PodcastResponseDto[];

  const mockInfrastructure = {
    search: jest.fn().mockReturnValue(mockApiResponse),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SPOTIFY_API)
      .useValue(mockInfrastructure)
      .compile();

    app = moduleFixture.createNestApplication();

    // Later-registered filters run first, so the domain mappers take precedence
    // over the AllExceptionsFilter catch-all.
    app.useGlobalFilters(new AllExceptionsFilter(), ...filters);
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: () => new BadRequestException(),
      }),
    );

    await app.init();
  });

  it('/api/artists (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/artists?q=The+Beatles&genre=Rock+and+Roll')
      .expect(200)
      .expect(mockArtistApiResponse);
  });

  it('/api/artists/[:name] (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/artists/The%20Beatles')
      .expect(200)
      .expect(mockArtistApiResponse[0]);
  });

  it('/api/podcasts (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/podcasts?q=Joe+Rogan&explicit=true')
      .expect(200)
      .expect(mockPodcastApiResponse);
  });

  it('/api/podcasts/[:name] (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/podcasts/Joe%20Rogan?explicit=true')
      .expect(200)
      .expect(mockPodcastApiResponse[0]);
  });

  afterEach(async () => {
    await app.close();
  });
});
