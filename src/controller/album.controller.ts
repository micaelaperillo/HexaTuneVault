import type { AlbumModel } from '../model';

import {
  type IGetAlbum,
  GET_ALBUM,
  type ISearchAlbum,
  SEARCH_ALBUM,
} from '../port';

import { AlbumResponseDto } from '../dto';

import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  Logger,
  Inject,
  ParseIntPipe,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Controller('api/albums')
export class AlbumController {
  private readonly logger = new Logger(AlbumController.name);

  constructor(
    @Inject(GET_ALBUM) private readonly getter: IGetAlbum,
    @Inject(SEARCH_ALBUM) private readonly searcher: ISearchAlbum,
  ) {}

  @Get()
  async search(
    @Query('q') name?: string,
    @Query('artist') artist?: string,
    @Query('year', ParseIntPipe) year?: number,
  ) {
    this.logger.debug(`Search album with q=${name}, artist=${artist}`);

    if (!name && !artist && (!year || year < 1))
      throw new BadRequestException();

    const results = await this.searcher.search({
      name,
      artist,
      year,
    });

    return results.map(AlbumController.toResponse);
  }

  @Get(':name')
  async get(@Param('name') name: string) {
    this.logger.debug(`Getting album with name=${name}`);

    const album = await this.getter.get({ name });
    if (!album) throw new NotFoundException();

    return AlbumController.toResponse(album);
  }

  private static toResponse(this: void, album: AlbumModel): AlbumResponseDto {
    const params = new URLSearchParams({ album: album.name }).toString();

    return plainToInstance(
      AlbumResponseDto,
      {
        ...album,
        self: `/api/albums/${encodeURIComponent(album.name)}`,
        reviews: `/api/reviews?${params}`,
      },
      { excludeExtraneousValues: true },
    );
  }
}
