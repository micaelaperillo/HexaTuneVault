import { DataSource, Repository } from 'typeorm';
import { createTestDataSource } from './datasource';
import { CommentRepository } from '../../src/adapter/out/persistence/comment.repository';
import { CommentEntity } from '../../src/adapter/out/persistence/entity/comment.entity';
import { CommentLikeEntity } from '../../src/adapter/out/persistence/entity/comment-like.entity';
import { UserEntity } from '../../src/adapter/out/persistence/entity/user.entity';
import { ReviewEntity } from '../../src/adapter/out/persistence/entity/review.entity';

describe('CommentRepository (integration)', () => {
  let ds: DataSource;
  let repo: CommentRepository;
  let authorId: number;
  let likerId: number;
  let reviewId: number;

  const seedUser = async (username: string): Promise<number> => {
    const users = ds.getRepository(UserEntity);
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
    repo = new CommentRepository(
      ds.getRepository(CommentEntity),
      ds.getRepository(CommentLikeEntity),
    );
    authorId = await seedUser('commenter');
    likerId = await seedUser('comment_liker');
    const reviews: Repository<ReviewEntity> = ds.getRepository(ReviewEntity);
    const review = await reviews.save(
      reviews.create({
        content: 'review body',
        rating: 4,
        subjectType: 'artist',
        subjectId: 'artist-1',
        author: { id: authorId },
      }),
    );
    reviewId = review.id;
  });

  afterAll(async () => {
    await ds.destroy();
  });

  beforeEach(async () => {
    // CASCADE handles the self-referential parent_comment FK and the
    // comment_likes dependency that block a plain TRUNCATE.
    await ds.query('TRUNCATE comments, comment_likes RESTART IDENTITY CASCADE');
  });

  const newComment = () =>
    repo.create({
      content: 'The Beatles ROCK',
      createdBy: { id: authorId },
      parentReview: { id: reviewId },
      parentCommentId: null,
    });

  it('persists a comment and reloads it with a zero like count', async () => {
    const created = await newComment();

    expect(created.id).toBeGreaterThan(0);
    expect(created.likes).toBe(0);
    expect(created.parentReview.id).toBe(reviewId);

    const found = await repo.findById(created.id);
    expect(found?.content).toBe('The Beatles ROCK');
  });

  it('matches content case-insensitively via ILIKE', async () => {
    await newComment();

    const hit = await repo.search({ content: 'beatles' });
    const miss = await repo.search({ content: 'zeppelin' });

    expect(hit.total).toBe(1);
    expect(miss.total).toBe(0);
  });

  it('counts likes with the grouped query and is idempotent', async () => {
    const comment = await newComment();

    await repo.addLike(comment.id, likerId);
    await repo.addLike(comment.id, likerId);

    expect(await repo.hasLike(comment.id, likerId)).toBe(true);
    const reloaded = await repo.findById(comment.id);
    expect(reloaded?.likes).toBe(1);
  });

  it('removes a like idempotently', async () => {
    const comment = await newComment();
    await repo.addLike(comment.id, likerId);

    await repo.removeLike(comment.id, likerId);
    await repo.removeLike(comment.id, likerId);

    expect(await repo.hasLike(comment.id, likerId)).toBe(false);
    const reloaded = await repo.findById(comment.id);
    expect(reloaded?.likes).toBe(0);
  });

  it('returns replies of a parent comment', async () => {
    const parent = await newComment();
    await repo.create({
      content: 'a reply',
      createdBy: { id: likerId },
      parentReview: { id: reviewId },
      parentCommentId: parent.id,
    });

    const replies = await repo.findReplies(parent.id);
    expect(replies).toHaveLength(1);
    expect(replies[0].parentCommentId).toBe(parent.id);
  });
});
