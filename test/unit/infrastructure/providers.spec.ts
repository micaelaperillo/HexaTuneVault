import type { ConfigService } from '@nestjs/config';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { postgresConfig } from '../../../src/infrastructure/database/provider/postgres.provider';
import {
  spotify,
  SPOTIFY_API,
} from '../../../src/infrastructure/api/provider/spotify.provider';

function fakeConfig(map: Record<string, string>): ConfigService {
  return {
    get: <T>(key: string, fallback?: T): T | undefined =>
      key in map ? (map[key] as unknown as T) : fallback,
    getOrThrow: <T>(key: string): T => {
      if (!(key in map)) {
        throw new Error(`missing ${key}`);
      }
      return map[key] as unknown as T;
    },
  } as unknown as ConfigService;
}

describe('postgresConfig', () => {
  it('builds development options (synchronize/logging enabled)', () => {
    const options = postgresConfig(
      fakeConfig({
        DB_HOST: 'db',
        DB_PORT: '6000',
        DB_USER: 'u',
        DB_PASSWORD: 'p',
        DB_NAME: 'n',
        NODE_ENV: 'development',
      }),
    );

    expect(options).toMatchObject({
      type: 'postgres',
      host: 'db',
      port: 6000,
      username: 'u',
      password: 'p',
      database: 'n',
      synchronize: true,
      logging: true,
    });
  });

  it('falls back to defaults and disables sync/logging in production', () => {
    const options = postgresConfig(
      fakeConfig({ DB_PORT: 'not-a-number', NODE_ENV: 'production' }),
    );

    expect(options).toMatchObject({
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      database: 'hexatunevault',
      synchronize: false,
      logging: false,
    });
  });
});

describe('spotify provider factory', () => {
  it('builds a SpotifyApi from the configured credentials', () => {
    const config = fakeConfig({
      SPOTIFY_CLIENT_ID: 'id',
      SPOTIFY_CLIENT_SECRET: 'secret',
    });

    const api = spotify.useFactory(config);

    expect(api).toBeInstanceOf(SpotifyApi);
  });

  it('throws when a credential is missing', () => {
    const config = fakeConfig({ SPOTIFY_CLIENT_ID: 'id' });

    expect(() => spotify.useFactory(config)).toThrow(
      'missing SPOTIFY_CLIENT_SECRET',
    );
  });

  it('exposes its DI token', () => {
    expect(SPOTIFY_API.toString()).toContain('SPOTIFY_API');
  });
});
