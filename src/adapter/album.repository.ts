import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { POSTGRES_DB } from '../infrastructure/database/provider/postgres.provider';
import { AlbumEntity } from '../entity/album.entity';
import type { IAlbumRepository } from '../repository/album.repository';
import type { AlbumModel, AlbumFilters } from '../model';

export { ALBUM_REPOSITORY } from '../repository/album.repository';

@Injectable()
export class PostgresAlbumRepository implements IAlbumRepository {
  private readonly repository: Repository<AlbumEntity>;

  constructor(@Inject(POSTGRES_DB) private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(AlbumEntity);
  }

  async save(album: AlbumModel): Promise<AlbumModel> {
    const entity = this.repository.create(album);
    await this.repository.save(entity);
    return entity;
  }

  async get(filters: AlbumFilters): Promise<AlbumModel | null> {
    if (!filters.name) return null;
    const entity = await this.repository.findOneBy({ name: filters.name });
    return entity ?? null;
  }

  async search(filters: AlbumFilters): Promise<AlbumModel[]> {
    const query = this.repository.createQueryBuilder('album');
    if (filters.name) {
      query.andWhere('album.name ILIKE :name', { name: `%${filters.name}%` });
    }
    if (filters.artist) {
      query.andWhere('album.artists LIKE :artist', {
        artist: `%${filters.artist}%`,
      });
    }
    const entities = await query.getMany();
    return entities;
  }
}
