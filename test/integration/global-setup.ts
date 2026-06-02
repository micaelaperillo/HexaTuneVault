import { PostgreSqlContainer } from '@testcontainers/postgresql';

// Boots a throwaway Postgres for the whole integration run and exposes its
// connection details through the environment the app/DataSource read.
export default async function globalSetup(): Promise<void> {
  const container = await new PostgreSqlContainer('postgres:16-alpine').start();

  (globalThis as { __PG_CONTAINER__?: unknown }).__PG_CONTAINER__ = container;

  process.env.DB_HOST = container.getHost();
  process.env.DB_PORT = String(container.getPort());
  process.env.DB_USER = container.getUsername();
  process.env.DB_PASSWORD = container.getPassword();
  process.env.DB_NAME = container.getDatabase();
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'integration-test-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
  process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret';
}
