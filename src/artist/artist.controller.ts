import type { ArtistResponse } from './dto';
import type { ArtistModel } from './model';

import { ArtistService } from './artist.service';

import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  Logger,
} from '@nestjs/common';

@Controller(['api', 'artists'])
export class ArtistController {
  private readonly logger = new Logger(ArtistController.name);

  constructor(private readonly service: ArtistService) {}

  @Get()
  async search(@Query('q') name: string) {
    this.logger.debug(`Search artist with q=${name}`);

    if (!name) throw new BadRequestException();

    const results = await this.service.search({ name });

    return results.map(ArtistController.toResponse);
  }

  @Get(':name')
  async get(@Param('name') name: string) {
    this.logger.debug(`Getting artist with name=${name}`);

    const artist = await this.service.get({ name });
    if (!artist) throw new NotFoundException();

    return ArtistController.toResponse(artist);
  }

  private static toResponse(this: void, artist: ArtistModel) {
    const params = new URLSearchParams({ artist: artist.name }).toString();

    return {
      ...artist,
      self: `/api/artists/${encodeURIComponent(artist.name)}`,
      albums: `/api/albums?${params}`,
      reviews: `/api/reviews?${params}`,
    } satisfies ArtistResponse;
  }
}
