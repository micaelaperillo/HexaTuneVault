import { Module } from '@nestjs/common';

import { PodcastController } from '../controller/podcast.controller';
import { ExternalApiModule } from '../infrastructure/api/api.module';

import { SpotifyPodcastProvider, PODCAST_PROVIDER } from '../adapter';

import {
  PodcastService,
  GET_PODCAST,
  SEARCH_PODCAST,
} from '../use-case/podcast.service';

@Module({
  imports: [ExternalApiModule],
  controllers: [PodcastController],
  providers: [
    { provide: PODCAST_PROVIDER, useClass: SpotifyPodcastProvider },
    { provide: GET_PODCAST, useClass: PodcastService },
    { provide: SEARCH_PODCAST, useClass: PodcastService },
  ],
})
export class PodcastModule {}
