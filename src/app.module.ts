import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/infrastructure/database/database.module';
import { ReviewModule } from '@review/review.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, ReviewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
