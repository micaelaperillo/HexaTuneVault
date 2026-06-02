import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { ConfigService } from '@nestjs/config';

export const SPOTIFY_API = Symbol('SPOTIFY_API');

export const spotify = {
  provide: SPOTIFY_API,
  useFactory: (config: ConfigService) =>
    SpotifyApi.withClientCredentials(
      config.getOrThrow<string>('SPOTIFY_CLIENT_ID'),
      config.getOrThrow<string>('SPOTIFY_CLIENT_SECRET'),
    ),
  inject: [ConfigService],
};
