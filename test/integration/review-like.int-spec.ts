import { DataSource, Repository } from 'typeorm';
import { createTestDataSource } from './datasource';
import { ReviewLikeRepository } from '../../src/adapter/review-like.repository';
import { ReviewLikeEntity } from '../../src/entity/review-like.entity';
import { UserEntity } from '../../src/entity/user.entity';
import { ReviewEntity } from '../../src/entity/review.entity';
import { ReviewNotFoundException } from '../../src/error/review/review-not-found.exception';

describe('ReviewLikeRepository (integration)', () => {
  let ds: DataSource;
  let repo: ReviewLikeRepository;
  let users: Repository<UserEntity>;
  let reviews: Repository<ReviewEntity>;
  let reviewId: number;
  let userA: number;
  let userB: number;

  const seedUser = async (username: string): Promise<number> => {
    const u = await users.save(
      users.create({
        username,
        password: 'hash',
        firstName: 'F',
        lastName: 'L',
        email: `${username}@example.com`,
        biography: 'bio',
        profilePictureUrl: 'pic',
      }),
    );
    return u.id;
  };

  beforeAll(async () => {
    ds = await createTestDataSource().initialize();
    repo = new ReviewLikeRepository(ds.getRepository(ReviewLikeEntity));
    users = ds.getRepository(UserEntity);
    reviews = ds.getRepository(ReviewEntity);

    userA = await seedUser('reviewliker_a');
    userB = await seedUser('reviewliker_b');
    const review = await reviews.save(
      reviews.create({
        content: 'great album',
        rating: 5,
        subjectType: 'album',
        subjectId: 'album-1',
        author: { id: userA },
      }),
    );
    reviewId = review.id;
  });

  afterAll(async () => {
    await ds.destroy();
  });

  beforeEach(async () => {
    await ds.getRepository(ReviewLikeEntity).clear();
  });

  it('adds a like and reflects it in count and hasLike', async () => {
    await repo.addLike(reviewId, userA);

    expect(await repo.countLikes(reviewId)).toBe(1);
    expect(await repo.hasLike(reviewId, userA)).toBe(true);
    expect(await repo.hasLike(reviewId, userB)).toBe(false);
  });

  it('is idempotent: a duplicate like does not raise or double-count', async () => {
    await repo.addLike(reviewId, userA);
    await repo.addLike(reviewId, userA);

    expect(await repo.countLikes(reviewId)).toBe(1);
  });

  it('removes a like idempotently', async () => {
    await repo.addLike(reviewId, userA);
    await repo.removeLike(reviewId, userA);
    await repo.removeLike(reviewId, userA);

    expect(await repo.countLikes(reviewId)).toBe(0);
  });

  it('counts likes from multiple users', async () => {
    await repo.addLike(reviewId, userA);
    await repo.addLike(reviewId, userB);

    expect(await repo.countLikes(reviewId)).toBe(2);
  });

  it('maps a missing-review foreign-key violation to ReviewNotFoundException', async () => {
    await expect(repo.addLike(987654, userA)).rejects.toBeInstanceOf(
      ReviewNotFoundException,
    );
  });
});
