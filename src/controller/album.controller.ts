import type { AlbumModel } from '../model';

import {
  type IGetAlbum,
  GET_ALBUM,
  type ISearchAlbum,
  SEARCH_ALBUM,
} from '../port/in';

import { AlbumResponseDto } from '../dto';
import { PageDto } from '../dto/page.dto';

import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AlbumFilterDto } from '../dto/album-filter.dto';
import { AlbumSearchDto } from '../dto/album-search.dto';
import { AlbumGetDto } from '../dto/album-get.dto';

import { Public } from '../infrastructure/auth/public.decorator';

@Public()
@Controller('api/albums')
export class AlbumController {
  private readonly logger = new Logger(AlbumController.name);

  constructor(
    @Inject(GET_ALBUM) private readonly getter: IGetAlbum,
    @Inject(SEARCH_ALBUM) private readonly searcher: ISearchAlbum,
  ) {}

  @Get()
  async search(
    @Query() filters: AlbumSearchDto,
  ): Promise<PageDto<AlbumResponseDto>> {
    this.logger.debug(
      `Search album with q=${filters.q}, artist=${filters.artist}, year=${filters.year}`,
    );

    const { items, total, ...page } = await this.searcher.search({
      name: filters.q,
      artist: filters.artist,
      year: filters.year,
      page: filters.page,
      pageSize: filters.page_size,
    });

    return PageDto.of(items.map(AlbumController.toResponse), page, total);
  }

  @Get(':name')
  async get(
    @Param() { name }: AlbumGetDto,
    @Query() { artist, year }: AlbumFilterDto,
  ) {
    this.logger.debug(
      `Getting album with name=${name}, artist=${artist}, year=${year}`,
    );

    const album = await this.getter.get({ name, artist, year });
    if (!album) throw new NotFoundException();

    return AlbumController.toResponse(album);
  }

  private static toResponse(this: void, album: AlbumModel): AlbumResponseDto {
    const yearFormatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      // Crucial, otherwise new Date('2000').getFullYear() === 1999
      timeZone: 'UTC',
    });

    const params = new URLSearchParams({
      artist: album.artists[0],
      year: yearFormatter.format(album.releaseDate),
    });

    return plainToInstance(
      AlbumResponseDto,
      {
        ...album,
        release_date: album.releaseDate,
        total_tracks: album.totalTracks,
        self: `/api/albums/${encodeURIComponent(album.name)}?${params}`,
        reviews: `/api/reviews?${new URLSearchParams({ album: album.name })}`,
      },
      { excludeExtraneousValues: true },
    );
  }
}
