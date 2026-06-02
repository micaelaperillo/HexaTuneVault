import { ReviewLikeRepository } from '../../../src/adapter/review-like.repository';
import { ReviewLikeEntity } from '../../../src/entity/review-like.entity';
import { ReviewNotFoundException } from '../../../src/error/review/review-not-found.exception';
import { ReviewRepositoryException } from '../../../src/error/review/review-repository.exception';
import { QueryFailedError, type Repository } from 'typeorm';

describe('ReviewLikeRepository', () => {
  let repository: ReviewLikeRepository;
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
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    };

    mockRepo = {
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockInsertQb),
    };

    repository = new ReviewLikeRepository(
      mockRepo as unknown as Repository<ReviewLikeEntity>,
    );
  });

  describe('addLike', () => {
    it('should insert the like row, ignoring duplicates', async () => {
      await repository.addLike(1, 42);

      expect(mockInsertQb.insert).toHaveBeenCalled();
      expect(mockInsertQb.values).toHaveBeenCalledWith({
        reviewId: 1,
        userId: 42,
      });
      expect(mockInsertQb.orIgnore).toHaveBeenCalled();
      expect(mockInsertQb.execute).toHaveBeenCalled();
    });

    it('should translate a FK violation into ReviewNotFoundException', async () => {
      const fkError = new QueryFailedError('insert', [], {
        code: '23503',
      } as unknown as Error);
      mockInsertQb.execute.mockRejectedValue(fkError);

      await expect(repository.addLike(999, 42)).rejects.toThrow(
        ReviewNotFoundException,
      );
    });

    it('should translate a non-FK query error into ReviewRepositoryException', async () => {
      const otherError = new QueryFailedError('insert', [], {
        code: '08006',
      } as unknown as Error);
      mockInsertQb.execute.mockRejectedValue(otherError);

      await expect(repository.addLike(1, 42)).rejects.toThrow(
        ReviewRepositoryException,
      );
    });

    it('should rethrow non-infrastructure errors untouched', async () => {
      const bug = new TypeError('cannot read property of undefined');
      mockInsertQb.execute.mockRejectedValue(bug);

      await expect(repository.addLike(1, 42)).rejects.toBe(bug);
    });

    it('falls through to ReviewRepositoryException when driverError is null', async () => {
      const errorWithNullDriver = new QueryFailedError('insert', [], {
        toString: () => 'sentinel',
      } as unknown as Error);
      (errorWithNullDriver as unknown as { driverError: null }).driverError =
        null;
      mockInsertQb.execute.mockRejectedValue(errorWithNullDriver);

      await expect(repository.addLike(1, 42)).rejects.toThrow(
        ReviewRepositoryException,
      );
    });

    it('falls through to ReviewRepositoryException when driverError is a non-object primitive', async () => {
      const errorWithPrimitiveDriver = new QueryFailedError('insert', [], {
        toString: () => 'sentinel',
      } as unknown as Error);
      (
        errorWithPrimitiveDriver as unknown as { driverError: number }
      ).driverError = 42;
      mockInsertQb.execute.mockRejectedValue(errorWithPrimitiveDriver);

      await expect(repository.addLike(1, 42)).rejects.toThrow(
        ReviewRepositoryException,
      );
    });

    it('falls through to ReviewRepositoryException when driverError has no code property', async () => {
      const errorWithNoCode = new QueryFailedError(
        'insert',
        [],
        {} as unknown as Error,
      );
      mockInsertQb.execute.mockRejectedValue(errorWithNoCode);

      await expect(repository.addLike(1, 42)).rejects.toThrow(
        ReviewRepositoryException,
      );
    });

    it('falls through to ReviewRepositoryException when driverError code is not a string', async () => {
      const errorWithNumericCode = new QueryFailedError('insert', [], {
        code: 23503,
      } as unknown as Error);
      mockInsertQb.execute.mockRejectedValue(errorWithNumericCode);

      await expect(repository.addLike(1, 42)).rejects.toThrow(
        ReviewRepositoryException,
      );
    });
  });

  describe('removeLike', () => {
    it('should delete the like row (idempotent)', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

      await repository.removeLike(1, 42);

      expect(mockRepo.delete).toHaveBeenCalledWith({
        reviewId: 1,
        userId: 42,
      });
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

  describe('hasLike', () => {
    it('should return true when a like row exists', async () => {
      mockRepo.count.mockResolvedValue(1);

      const result = await repository.hasLike(1, 42);

      expect(result).toBe(true);
      expect(mockRepo.count).toHaveBeenCalledWith({
        where: { reviewId: 1, userId: 42 },
      });
    });

    it('should return false when no like row exists', async () => {
      mockRepo.count.mockResolvedValue(0);

      const result = await repository.hasLike(1, 42);

      expect(result).toBe(false);
    });
  });
});
