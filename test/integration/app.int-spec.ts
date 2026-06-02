import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { SPOTIFY_API } from '../../src/adapter/catalog/spotify.provider';
import { AllExceptionsFilter } from '../../src/infrastructure/filter/all-exceptions.filter';
import { filters } from '../../src/infrastructure/filter/http-exception.mappers';

describe('Review likes (HTTP integration)', () => {
  let app: INestApplication<App>;
  let token: string;
  let reviewId: number;

  const credentials = { username: 'http_liker', password: 'p@ssw0rd' };
  const user = {
    ...credentials,
    first_name: 'Http',
    last_name: 'Liker',
    email: 'http_liker@example.com',
    biography: 'bio',
    profile_picture_url: 'pic',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SPOTIFY_API)
      .useValue({ search: jest.fn() })
      .compile();

    app = moduleRef.createNestApplication();
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

    const server = app.getHttpServer();
    await request(server).post('/api/users').send(user).expect(201);
    const login = await request(server)
      .post('/api/sessions')
      .send(credentials)
      .expect(201);
    token = (login.body as { access_token: string }).access_token;

    const created = await request(server)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'A genuinely great record',
        subject: { album: 'album-http-1' },
        rating: 5,
      })
      .expect(201);
    reviewId = Number(created.headers.location.split('/').pop());
  });

  afterAll(async () => {
    await app.close();
  });

  it('issues a usable access token and a created review', () => {
    expect(token).toEqual(expect.any(String));
    expect(reviewId).toBeGreaterThan(0);
  });

  it('rejects liking without authentication', () =>
    request(app.getHttpServer())
      .put(`/api/reviews/${reviewId}/likes`)
      .expect(401));

  it('likes idempotently and reports the like back', async () => {
    const server = app.getHttpServer();
    await request(server)
      .put(`/api/reviews/${reviewId}/likes`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    await request(server)
      .put(`/api/reviews/${reviewId}/likes`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const me = await request(server)
      .get(`/api/reviews/${reviewId}/likes/me`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect((me.body as { liked: boolean }).liked).toBe(true);

    const count = await request(server)
      .get(`/api/reviews/${reviewId}/likes/count`)
      .expect(200);
    expect((count.body as { count: number }).count).toBe(1);
  });

  it('unlikes idempotently', async () => {
    const server = app.getHttpServer();
    await request(server)
      .delete(`/api/reviews/${reviewId}/likes`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const count = await request(server)
      .get(`/api/reviews/${reviewId}/likes/count`)
      .expect(200);
    expect((count.body as { count: number }).count).toBe(0);

    const me = await request(server)
      .get(`/api/reviews/${reviewId}/likes/me`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect((me.body as { liked: boolean }).liked).toBe(false);
  });
});
