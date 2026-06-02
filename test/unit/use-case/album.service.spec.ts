import { Test, TestingModule } from '@nestjs/testing';
import { AlbumService } from '../../../src/use-case/album.service';
import { ALBUM_PROVIDER } from '../../../src/port/out/album-provider.port';
import type { AlbumModel } from '../../../src/model/album.model';

describe('AlbumService', () => {
  let service: AlbumService;

  const mockAlbum: AlbumModel = {
    name: 'Abbey Road',
    cover: 'cover-url',
    releaseDate: new Date('1969'),
    totalTracks: 17,
    artists: ['The Beatles'],
    external_urls: {
      spotify: 'spotify-url',
    },
  };

  const mockProvider = {
    search: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlbumService,
        { provide: ALBUM_PROVIDER, useValue: mockProvider },
      ],
    }).compile();

    service = module.get(AlbumService);
  });

  describe('search', () => {
    it('delegates to the provider and returns search results', async () => {
      mockProvider.search.mockResolvedValue([mockAlbum]);
      const filters = { name: 'Abbey Road', artist: 'The Beatles' };
      const result = await service.search(filters);

      expect(mockProvider.search).toHaveBeenCalledWith(filters);
      expect(result).toStrictEqual([mockAlbum]);
    });
  });

  describe('get', () => {
    it('delegates to the provider and returns get result', async () => {
      mockProvider.get.mockResolvedValue(mockAlbum);
      const filters = { name: 'Abbey Road' };
      const result = await service.get(filters);

      expect(mockProvider.get).toHaveBeenCalledWith(filters);
      expect(result).toStrictEqual(mockAlbum);
    });

    it('returns null if provider returns null', async () => {
      mockProvider.get.mockResolvedValue(null);
      const filters = { name: 'Nonexistent Album' };
      const result = await service.get(filters);

      expect(mockProvider.get).toHaveBeenCalledWith(filters);
      expect(result).toBeNull();
    });
  });
});
