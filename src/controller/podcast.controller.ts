import {
  type IGetPodcast,
  GET_PODCAST,
  type ISearchPodcast,
  SEARCH_PODCAST,
} from '../port';

import { PodcastGetDto, PodcastFilterDto, PodcastResponseDto } from '../dto';

import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';

@Controller('api/podcasts')
export class PodcastController {
  private readonly logger = new Logger(PodcastController.name);

  constructor(
    @Inject(GET_PODCAST) private readonly getter: IGetPodcast,
    @Inject(SEARCH_PODCAST) private readonly searcher: ISearchPodcast,
  ) {}

  @Get()
  async search(
    @Query() { q: name, explicit, media_type, market }: PodcastFilterDto,
  ) {
    this.logger.debug(
      `Search podcast with q=${name} explicit=${explicit} media_type=${media_type} market=${market}`,
    );

    const results = await this.searcher.search({
      name,
      explicit: explicit === undefined ? undefined : explicit === 'true',
      mediaType: media_type,
      market,
    });

    return PodcastResponseDto.fromMany(results);
  }

  @Get(':name')
  async get(@Param() { name }: PodcastGetDto) {
    this.logger.debug(`Getting podcast with name=${name}`);

    const podcast = await this.getter.get({ name });
    if (!podcast) throw new NotFoundException();

    return PodcastResponseDto.from(podcast);
  }
}
