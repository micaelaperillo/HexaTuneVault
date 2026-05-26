import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ArtistProvider, ArtistRepository } from './adapter';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ArtistController],
  providers: [ArtistRepository, ArtistProvider, ArtistService],
})
export class ArtistModule {}
