import type { ArtistResponse } from './dto';

import type { Request, Response } from 'express';

import { ArtistService } from './artist.service';

import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';

@Controller('artists')
export class ArtistController {
  constructor(private readonly service: ArtistService) {}

  @Get()
  async search(@Query('q') q: string) {
    return this.service.search(q);
  }

  @Get(':name')
  async get(
    @Param('name') name: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const artist = await this.service.get(name);
    if (!artist) return res.sendStatus(HttpStatus.NOT_FOUND);

    const params = new URLSearchParams({ artist: artist.name }).toString();

    return {
      ...artist,
      albums: new URL(`/albums?${params}`, req.url),
      reviews: new URL(`/reviews?${params}`, req.url),
    } satisfies ArtistResponse;
  }
}
