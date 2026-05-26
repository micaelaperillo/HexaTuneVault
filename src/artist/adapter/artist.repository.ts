import type { IArtistRepository } from '../repository';

import type { Repository } from 'typeorm';

import { ArtistEntity } from '../entity';
import { ArtistRepositoryError } from '../exceptions/repository.error';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ArtistRepository implements IArtistRepository {
  constructor(
    @InjectRepository(ArtistEntity)
    private local: Repository<ArtistEntity>,
  ) {}

  /**
   * @override
   */
  create(artist: Omit<ArtistEntity, 'createdAt'>) {
    try {
      return this.local.save(artist);
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      throw new ArtistRepositoryError(e);
    }
  }

  /**
   * @override
   */
  get(name: ArtistEntity['name']) {
    try {
      return this.local.findOneBy({ name });
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      throw new ArtistRepositoryError(e);
    }
  }
}
