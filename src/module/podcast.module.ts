import { Module } from '@nestjs/common';

import { PodcastController } from '../adapter/in/http/podcast.controller';
import { ExternalApiModule } from '../infrastructure/api/api.module';

import { SpotifyPodcastProvider } from '../adapter/out';
import { PODCAST_PROVIDER } from '../port/out';

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
