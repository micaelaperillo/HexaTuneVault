import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UserEntity } from '../../src/adapter/out/persistence/entity/user.entity';
import { ReviewEntity } from '../../src/adapter/out/persistence/entity/review.entity';
import { ReviewLikeEntity } from '../../src/adapter/out/persistence/entity/review-like.entity';
import { CommentEntity } from '../../src/adapter/out/persistence/entity/comment.entity';
import { CommentLikeEntity } from '../../src/adapter/out/persistence/entity/comment-like.entity';

// A DataSource pointed at the Testcontainers Postgres (env set in global-setup),
// with `synchronize` so the schema is derived from the entities — mirroring dev.
export function createTestDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
      UserEntity,
      ReviewEntity,
      ReviewLikeEntity,
      CommentEntity,
      CommentLikeEntity,
    ],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: true,
  });
}
