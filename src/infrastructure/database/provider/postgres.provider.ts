import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ReviewEntity } from '../../../entity/review.entity';
import { CommentEntity } from '../../../entity/comment.entity';
import { UserEntity } from '../../../entity/user.entity';

export function postgresConfig(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: parseInt(config.get<string>('DB_PORT', '5432'), 10) || 5432,
    username: config.get<string>('DB_USER', 'postgres'),
    password: config.get<string>('DB_PASSWORD', 'postgres'),
    database: config.get<string>('DB_NAME', 'hexatunevault'),
    entities: [ReviewEntity, CommentEntity, UserEntity],
    synchronize: config.get<string>('NODE_ENV') !== 'production',
  };
}
