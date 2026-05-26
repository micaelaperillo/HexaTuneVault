import type { ArtistResponse } from './dto';

import { ArtistService } from './artist.service';

import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';

@Controller('artists')
export class ArtistController {
  constructor(private readonly service: ArtistService) {}

  @Get()
  search(@Query('q') q: string) {
    if (!q) throw new BadRequestException();
    return this.service.search(q);
  }

  @Get(':name')
  async get(@Param('name') name: string) {
    const artist = await this.service.get(name);
    if (!artist) throw new NotFoundException();

    const params = new URLSearchParams({ artist: artist.name }).toString();

    return {
      ...artist,
      albums: `/albums?${params}`,
      reviews: `/reviews?${params}`,
    } satisfies ArtistResponse;
  }
}
