import type { PodcastModel } from '../model';

import {
  type IGetPodcast,
  GET_PODCAST,
  type ISearchPodcast,
  SEARCH_PODCAST,
} from '../port';

import { PodcastGetDto, PodcastFilterDto, PodcastResponseDto } from '../dto';
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

import { Public } from '../infrastructure/auth/public.decorator';

@Public()
@Controller('api/podcasts')
export class PodcastController {
  private readonly logger = new Logger(PodcastController.name);

  constructor(
    @Inject(GET_PODCAST) private readonly getter: IGetPodcast,
    @Inject(SEARCH_PODCAST) private readonly searcher: ISearchPodcast,
  ) {}

  @Get()
  async search(
    @Query()
    {
      q: name,
      explicit,
      media_type,
      market,
      page,
      page_size,
    }: PodcastFilterDto,
  ): Promise<PageDto<PodcastResponseDto>> {
    this.logger.debug(
      `Search podcast with q=${name} explicit=${explicit} media_type=${media_type} market=${market}`,
    );

    const { items, total, ...pageReq } = await this.searcher.search({
      name,
      explicit: explicit === undefined ? undefined : explicit === 'true',
      mediaType: media_type,
      market,
      page,
      pageSize: page_size,
    });

    return PageDto.of(items.map(PodcastController.toResponse), pageReq, total);
  }

  @Get(':name')
  async get(@Param() { name }: PodcastGetDto) {
    this.logger.debug(`Getting podcast with name=${name}`);

    const podcast = await this.getter.get({ name });
    if (!podcast) throw new NotFoundException();

    return PodcastController.toResponse(podcast);
  }

  private static toResponse(this: void, podcast: PodcastModel) {
    const params = new URLSearchParams({ podcast: podcast.name }).toString();

    return plainToInstance(
      PodcastResponseDto,
      {
        ...podcast,
        self: `/api/podcasts/${encodeURIComponent(podcast.name)}`,
        reviews: `/api/reviews?${params}`,
      },
      { excludeExtraneousValues: true },
    );
  }
}
