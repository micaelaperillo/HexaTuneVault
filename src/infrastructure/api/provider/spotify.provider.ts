import { SpotifyApi } from '@spotify/web-api-ts-sdk';

export const SPOTIFY_API = Symbol('SPOTIFY_API');

export const spotify = {
  provide: SPOTIFY_API,
  useFactory: () => {
    return SpotifyApi.withClientCredentials(
      process.env.SPOTIFY_CLIENT_ID!,
      process.env.SPOTIFY_CLIENT_SECRET!,
    );
  },
};
