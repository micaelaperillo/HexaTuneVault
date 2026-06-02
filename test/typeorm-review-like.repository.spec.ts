import { TypeOrmReviewLikeRepository } from '../src/adapter/typeorm-review-like.repository';
import { ReviewLikeEntity } from '../src/entity/review-like.entity';
import { ReviewNotFoundException } from '../src/error/review/review-not-found.exception';
import { AlreadyLikedException } from '../src/error/review/already-liked.exception';
import { ReviewRepositoryException } from '../src/error/review/review-repository.exception';
import { QueryFailedError, type Repository } from 'typeorm';

describe('TypeOrmReviewLikeRepository', () => {
  let repository: TypeOrmReviewLikeRepository;
  let mockRepo: jest.Mocked<
    Pick<
      Repository<ReviewLikeEntity>,
      'delete' | 'count' | 'createQueryBuilder'
    >
  >;
  let mockInsertQb: Record<string, jest.Mock>;

  beforeEach(() => {
    mockInsertQb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    };

    mockRepo = {
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockInsertQb),
    };

    repository = new TypeOrmReviewLikeRepository(
      mockRepo as unknown as Repository<ReviewLikeEntity>,
    );
  });

  describe('addLike', () => {
    it('should insert the like row', async () => {
      await repository.addLike(1, '42');

      expect(mockInsertQb.insert).toHaveBeenCalled();
      expect(mockInsertQb.values).toHaveBeenCalledWith({
        reviewId: 1,
        userId: '42',
      });
      expect(mockInsertQb.execute).toHaveBeenCalled();
    });

    it('should translate a unique violation into AlreadyLikedException', async () => {
      const dupError = new QueryFailedError('insert', [], {
        code: '23505',
      } as unknown as Error);
      mockInsertQb.execute.mockRejectedValue(dupError);

      await expect(repository.addLike(1, '42')).rejects.toThrow(
        AlreadyLikedException,
      );
    });

    it('should translate a FK violation into ReviewNotFoundException', async () => {
      const fkError = new QueryFailedError('insert', [], {
        code: '23503',
      } as unknown as Error);
      mockInsertQb.execute.mockRejectedValue(fkError);

      await expect(repository.addLike(999, '42')).rejects.toThrow(
        ReviewNotFoundException,
      );
    });

    it('should translate a non-FK query error into ReviewRepositoryException', async () => {
      const otherError = new QueryFailedError('insert', [], {
        code: '08006',
      } as unknown as Error);
      mockInsertQb.execute.mockRejectedValue(otherError);

      await expect(repository.addLike(1, '42')).rejects.toThrow(
        ReviewRepositoryException,
      );
    });

    it('should rethrow non-infrastructure errors untouched', async () => {
      const bug = new TypeError('cannot read property of undefined');
      mockInsertQb.execute.mockRejectedValue(bug);

      await expect(repository.addLike(1, '42')).rejects.toBe(bug);
    });
  });

  describe('removeLike', () => {
    it('should return true when a row was removed', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await repository.removeLike(1, '42');

      expect(result).toBe(true);
      expect(mockRepo.delete).toHaveBeenCalledWith({
        reviewId: 1,
        userId: '42',
      });
    });

    it('should return false when no row was removed', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0, raw: [] });

      const result = await repository.removeLike(1, '42');

      expect(result).toBe(false);
    });

    it('should return false when affected is undefined', async () => {
      mockRepo.delete.mockResolvedValue({ raw: [] });

      const result = await repository.removeLike(1, '42');

      expect(result).toBe(false);
    });
  });

  describe('countLikes', () => {
    it('should return the row count for the review', async () => {
      mockRepo.count.mockResolvedValue(7);

      const result = await repository.countLikes(1);

      expect(result).toBe(7);
      expect(mockRepo.count).toHaveBeenCalledWith({ where: { reviewId: 1 } });
    });
  });
});
