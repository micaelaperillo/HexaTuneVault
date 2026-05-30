import {
  type IGetArtist,
  GET_ARTIST,
  type ISearchArtist,
  SEARCH_ARTIST,
} from '../port';

import { ArtistGetDto, ArtistFilterDto, ArtistResponseDto } from '../dto';

import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';

@Controller('api/artists')
export class ArtistController {
  private readonly logger = new Logger(ArtistController.name);

  constructor(
    @Inject(GET_ARTIST) private readonly getter: IGetArtist,
    @Inject(SEARCH_ARTIST) private readonly searcher: ISearchArtist,
  ) {}

  @Get()
  async search(@Query() { q: name, genre }: ArtistFilterDto) {
    this.logger.debug(
      `Search artist with q=${name} genre=${JSON.stringify(genre)}`,
    );

    const results = await this.searcher.search({ name, genre });

    return ArtistResponseDto.fromMany(results);
  }

  @Get(':name')
  async get(@Param() { name }: ArtistGetDto) {
    this.logger.debug(`Getting artist with name=${name}`);

    const artist = await this.getter.get({ name });
    if (!artist) throw new NotFoundException();

    return ArtistResponseDto.from(artist);
  }
}
