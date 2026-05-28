import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ReviewModule } from '@review/review.module.js';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: requireEnv('DB_HOST'),
      port: Number(process.env.DB_PORT) || 5432,
      username: requireEnv('DB_USER'),
      password: requireEnv('DB_PASS'),
      database: requireEnv('DB_NAME'),
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
