import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { AlbumResponseDto } from '../src/dto/album.response';
import { ArtistResponseDto } from '../src/dto/artist.response';
import { PodcastResponseDto } from '../src/dto/podcast.response';

describe('AlbumResponseDto', () => {
  const raw = {
    name: 'Abbey Road',
    cover: 'https://example.com/cover.jpg',
    release_date: new Date('1969-09-26'),
    total_tracks: 17,
    artists: ['The Beatles'],
    external_urls: { spotify: 'https://open.spotify.com/album/abc' },
    self: '/albums/abc',
    reviews: '/albums/abc/reviews',
    extra_field: 'should be excluded',
  };

  it('maps all exposed fields', () => {
    const dto = plainToInstance(AlbumResponseDto, raw, {
      excludeExtraneousValues: true,
    });
    expect(dto.name).toBe('Abbey Road');
    expect(dto.cover).toBe('https://example.com/cover.jpg');
    expect(dto.total_tracks).toBe(17);
    expect(dto.artists).toEqual(['The Beatles']);
    expect(dto.external_urls).toEqual({
      spotify: 'https://open.spotify.com/album/abc',
    });
    expect(dto.self).toBe('/albums/abc');
    expect(dto.reviews).toBe('/albums/abc/reviews');
  });

  it('excludes extra fields when excludeExtraneousValues is true', () => {
    const dto = plainToInstance(AlbumResponseDto, raw, {
      excludeExtraneousValues: true,
    });
    expect(
      (dto as unknown as Record<string, unknown>)['extra_field'],
    ).toBeUndefined();
  });

  it('maps all fields without excludeExtraneousValues', () => {
    const dto = plainToInstance(AlbumResponseDto, raw);
    expect(dto.name).toBe('Abbey Road');
    expect(dto.total_tracks).toBe(17);
    expect(dto.artists).toEqual(['The Beatles']);
    expect(dto.external_urls).toEqual({
      spotify: 'https://open.spotify.com/album/abc',
    });
  });

  it('handles an empty artists array', () => {
    const dto = plainToInstance(
      AlbumResponseDto,
      { ...raw, artists: [] },
      { excludeExtraneousValues: true },
    );
    expect(dto.artists).toEqual([]);
  });

  it('handles multiple artists', () => {
    const dto = plainToInstance(
      AlbumResponseDto,
      { ...raw, artists: ['Artist A', 'Artist B'] },
      { excludeExtraneousValues: true },
    );
    expect(dto.artists).toEqual(['Artist A', 'Artist B']);
  });
});

describe('ArtistResponseDto', () => {
  const raw = {
    name: 'The Beatles',
    avatar: 'https://example.com/avatar.jpg',
    external_urls: { spotify: 'https://open.spotify.com/artist/abc' },
    self: '/artists/abc',
    albums: '/artists/abc/albums',
    reviews: '/artists/abc/reviews',
    extra_field: 'should be excluded',
  };

  it('maps all exposed fields', () => {
    const dto = plainToInstance(ArtistResponseDto, raw, {
      excludeExtraneousValues: true,
    });
    expect(dto.name).toBe('The Beatles');
    expect(dto.avatar).toBe('https://example.com/avatar.jpg');
    expect(dto.external_urls).toEqual({
      spotify: 'https://open.spotify.com/artist/abc',
    });
    expect(dto.self).toBe('/artists/abc');
    expect(dto.albums).toBe('/artists/abc/albums');
    expect(dto.reviews).toBe('/artists/abc/reviews');
  });

  it('excludes extra fields when excludeExtraneousValues is true', () => {
    const dto = plainToInstance(ArtistResponseDto, raw, {
      excludeExtraneousValues: true,
    });
    expect(
      (dto as unknown as Record<string, unknown>)['extra_field'],
    ).toBeUndefined();
  });

  it('maps all fields without excludeExtraneousValues', () => {
    const dto = plainToInstance(ArtistResponseDto, raw);
    expect(dto.name).toBe('The Beatles');
    expect(dto.external_urls).toEqual({
      spotify: 'https://open.spotify.com/artist/abc',
    });
  });
});

describe('PodcastResponseDto', () => {
  const rawFull = {
    name: 'Serial',
    avatar: 'https://example.com/avatar.jpg',
    publisher: 'This American Life',
    description: 'A podcast about true crime',
    total_episodes: 100,
    external_urls: { spotify: 'https://open.spotify.com/show/abc' },
    self: '/podcasts/abc',
    reviews: '/podcasts/abc/reviews',
    extra_field: 'should be excluded',
  };

  it('maps all exposed fields when publisher is present', () => {
    const dto = plainToInstance(PodcastResponseDto, rawFull, {
      excludeExtraneousValues: true,
    });
    expect(dto.name).toBe('Serial');
    expect(dto.avatar).toBe('https://example.com/avatar.jpg');
    expect(dto.publisher).toBe('This American Life');
    expect(dto.description).toBe('A podcast about true crime');
    expect(dto.total_episodes).toBe(100);
    expect(dto.external_urls).toEqual({
      spotify: 'https://open.spotify.com/show/abc',
    });
    expect(dto.self).toBe('/podcasts/abc');
    expect(dto.reviews).toBe('/podcasts/abc/reviews');
  });

  it('maps fields when publisher is absent', () => {
    const rawNoPublisher: Record<string, unknown> = {
      name: rawFull.name,
      avatar: rawFull.avatar,
      description: rawFull.description,
      total_episodes: rawFull.total_episodes,
      external_urls: rawFull.external_urls,
      self: rawFull.self,
      reviews: rawFull.reviews,
    };
    const dto = plainToInstance(PodcastResponseDto, rawNoPublisher, {
      excludeExtraneousValues: true,
    });
    expect(dto.name).toBe('Serial');
    expect(dto.publisher).toBeUndefined();
    expect(dto.total_episodes).toBe(100);
  });

  it('excludes extra fields when excludeExtraneousValues is true', () => {
    const dto = plainToInstance(PodcastResponseDto, rawFull, {
      excludeExtraneousValues: true,
    });
    expect(
      (dto as unknown as Record<string, unknown>)['extra_field'],
    ).toBeUndefined();
  });

  it('maps all fields without excludeExtraneousValues', () => {
    const dto = plainToInstance(PodcastResponseDto, rawFull);
    expect(dto.name).toBe('Serial');
    expect(dto.external_urls).toEqual({
      spotify: 'https://open.spotify.com/show/abc',
    });
  });
});
