import type { ArtistModel } from '../../../model';

import {
  type IGetArtist,
  GET_ARTIST,
  type ISearchArtist,
  SEARCH_ARTIST,
} from '../../../port/in';

import { ArtistGetDto, ArtistFilterDto } from './dto/in/artist';
import { ArtistResponseDto } from './dto/out/artist';
import { PageDto } from './dto/out';

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

import { Public } from './decorator/public.decorator';

@Public()
@Controller('api/artists')
export class ArtistController {
  private readonly logger = new Logger(ArtistController.name);

  constructor(
    @Inject(GET_ARTIST) private readonly getter: IGetArtist,
    @Inject(SEARCH_ARTIST) private readonly searcher: ISearchArtist,
  ) {}

  @Get()
  async search(
    @Query() { q: name, genre, page, page_size }: ArtistFilterDto,
  ): Promise<PageDto<ArtistResponseDto>> {
    this.logger.debug(
      `Search artist with q=${name} genre=${JSON.stringify(genre)}`,
    );

    const { items, total, ...pageReq } = await this.searcher.search({
      name,
      genre,
      page,
      pageSize: page_size,
    });

    return PageDto.of(items.map(ArtistController.toResponse), pageReq, total);
  }

  @Get(':name')
  async get(@Param() { name }: ArtistGetDto) {
    this.logger.debug(`Getting artist with name=${name}`);

    const artist = await this.getter.get({ name });
    if (!artist) throw new NotFoundException();

    return ArtistController.toResponse(artist);
  }

  static toResponse(this: void, artist: ArtistModel): ArtistResponseDto {
    const params = new URLSearchParams({ artist: artist.name }).toString();

    return plainToInstance(
      ArtistResponseDto,
      {
        ...artist,
        self: `/api/artists/${encodeURIComponent(artist.name)}`,
        albums: `/api/albums?${params}`,
        reviews: `/api/reviews?${params}`,
      },
      { excludeExtraneousValues: true },
    );
  }
}
