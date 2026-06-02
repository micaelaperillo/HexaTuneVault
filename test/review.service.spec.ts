import { ReviewService } from '../src/use-case/review.service';
import { createMockReviewRepository } from './mock-review-repository';
import { createMockReviewLikeRepository } from './mock-review-like-repository';
import type { IReviewRepository } from '../src/repository/review-repository.port';
import type { IReviewLikeRepository } from '../src/repository/review-like-repository.port';
import type { IReviewConfig } from '../src/port/review/review-config.port';
import type { ReviewSearchCriteria } from '../src/model/review-search-criteria';
import { SortField, SortOrder } from '../src/model/review-search-criteria';
import { SubjectReference, SubjectType } from '../src/model/subject-reference';
import { ReviewModel } from '../src/model/review.model';
import { ReviewCooldownException } from '../src/error/review/review-cooldown.exception';
import { InvalidReviewException } from '../src/error/review/invalid-review.exception';
import { ReviewNotFoundException } from '../src/error/review/review-not-found.exception';
import { ForbiddenDeletionException } from '../src/error/review/forbidden-deletion.exception';
import { NotLikedException } from '../src/error/review/not-liked.exception';

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepo: jest.Mocked<IReviewRepository>;
  let likeRepo: jest.Mocked<IReviewLikeRepository>;
  const config: IReviewConfig = { cooldownSeconds: 60 };

  const reviewBy = (authorId: string) =>
    ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.ALBUM, '1'),
      content: 'Okay',
      rating: 3,
      createdAt: new Date(),
      authorId,
      updatedAt: null,
    });

  beforeEach(() => {
    reviewRepo = createMockReviewRepository();
    likeRepo = createMockReviewLikeRepository();
    service = new ReviewService(reviewRepo, likeRepo, config);
  });

  describe('create', () => {
    const cmd = {
      subjectType: SubjectType.ALBUM,
      subjectId: '1',
      content: 'Great stuff',
      rating: 5,
      authorId: '1',
    };

    it('creates and saves a review', async () => {
      reviewRepo.findRecentByAuthorAndSubject.mockResolvedValue(null);
      const saved = reviewBy('1');
      reviewRepo.save.mockResolvedValue(saved);

      const result = await service.create(cmd);

      expect(reviewRepo.findRecentByAuthorAndSubject).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ type: SubjectType.ALBUM, id: '1' }),
        expect.any(Date),
      );
      expect(reviewRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Great stuff', rating: 5 }),
      );
      expect(result).toEqual(saved);
    });

    it('throws ReviewCooldownException when reviewed recently', async () => {
      reviewRepo.findRecentByAuthorAndSubject.mockResolvedValue(reviewBy('1'));

      await expect(service.create(cmd)).rejects.toThrow(
        ReviewCooldownException,
      );
      expect(reviewRepo.save).not.toHaveBeenCalled();
    });

    it('propagates InvalidReviewException before any I/O', async () => {
      await expect(service.create({ ...cmd, rating: 0 })).rejects.toThrow(
        InvalidReviewException,
      );
      expect(reviewRepo.findRecentByAuthorAndSubject).not.toHaveBeenCalled();
      expect(reviewRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('throws ReviewNotFoundException when the review does not exist', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(
        service.delete({ reviewId: 1, requesterId: '1' }),
      ).rejects.toThrow(ReviewNotFoundException);
    });

    it('throws ForbiddenDeletionException when requester is not the author', async () => {
      reviewRepo.findById.mockResolvedValue(reviewBy('2'));

      await expect(
        service.delete({ reviewId: 1, requesterId: '1' }),
      ).rejects.toThrow(ForbiddenDeletionException);
    });

    it('deletes when requester is the owner', async () => {
      reviewRepo.findById.mockResolvedValue(reviewBy('1'));

      await service.delete({ reviewId: 1, requesterId: '1' });

      expect(reviewRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('get', () => {
    it('throws ReviewNotFoundException when not found', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(service.get(1)).rejects.toThrow(ReviewNotFoundException);
    });

    it('returns the review when found', async () => {
      const review = reviewBy('1');
      reviewRepo.findById.mockResolvedValue(review);

      const result = await service.get(1);

      expect(result).toEqual(review);
      expect(reviewRepo.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('search', () => {
    const criteria: ReviewSearchCriteria = {
      page: 1,
      pageSize: 10,
      sortBy: SortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    };

    it('returns results from the repository', async () => {
      const review = reviewBy('1');
      reviewRepo.search.mockResolvedValue({ data: [review], total: 1 });

      const result = await service.search(criteria);

      expect(reviewRepo.search).toHaveBeenCalledWith(criteria);
      expect(result.total).toBe(1);
      expect(result.data[0]).toEqual(review);
    });

    it('passes criteria filters through unchanged', async () => {
      const filtered = {
        ...criteria,
        content: 'x',
        authorId: '5',
        minRating: 3,
      };
      reviewRepo.search.mockResolvedValue({ data: [], total: 0 });

      await service.search(filtered);

      expect(reviewRepo.search).toHaveBeenCalledWith(filtered);
    });
  });

  describe('like', () => {
    it('adds a like when the review exists', async () => {
      reviewRepo.findById.mockResolvedValue(reviewBy('1'));

      await service.like(1, '7');

      expect(likeRepo.addLike).toHaveBeenCalledWith(1, '7');
    });

    it('throws ReviewNotFoundException when the review is missing', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(service.like(999, '7')).rejects.toThrow(
        ReviewNotFoundException,
      );
      expect(likeRepo.addLike).not.toHaveBeenCalled();
    });
  });

  describe('unlike', () => {
    it('removes the like when one exists', async () => {
      reviewRepo.findById.mockResolvedValue(reviewBy('1'));
      likeRepo.removeLike.mockResolvedValue(true);

      await service.unlike(1, '7');

      expect(likeRepo.removeLike).toHaveBeenCalledWith(1, '7');
    });

    it('throws NotLikedException when there is no like to remove', async () => {
      reviewRepo.findById.mockResolvedValue(reviewBy('1'));
      likeRepo.removeLike.mockResolvedValue(false);

      await expect(service.unlike(1, '7')).rejects.toThrow(NotLikedException);
    });

    it('throws ReviewNotFoundException when the review is missing', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(service.unlike(999, '7')).rejects.toThrow(
        ReviewNotFoundException,
      );
      expect(likeRepo.removeLike).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('returns the like count when the review exists', async () => {
      reviewRepo.findById.mockResolvedValue(reviewBy('1'));
      likeRepo.countLikes.mockResolvedValue(12);

      const result = await service.count(1);

      expect(result).toBe(12);
      expect(likeRepo.countLikes).toHaveBeenCalledWith(1);
    });

    it('throws ReviewNotFoundException when the review is missing', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(service.count(999)).rejects.toThrow(ReviewNotFoundException);
      expect(likeRepo.countLikes).not.toHaveBeenCalled();
    });
  });
});
