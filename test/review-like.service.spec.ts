import { ReviewLikeService } from '../src/use-case/review-like.service';
import { createMockReviewRepository } from './mock-review-repository';
import { createMockReviewLikeRepository } from './mock-review-like-repository';
import type { IReviewRepository } from '../src/repository/review-repository.port';
import type { IReviewLikeRepository } from '../src/repository/review-like-repository.port';
import { SubjectReference, SubjectType } from '../src/model/subject-reference';
import { ReviewModel } from '../src/model/review.model';
import { ReviewNotFoundException } from '../src/error/review/review-not-found.exception';
import { NotLikedException } from '../src/error/review/not-liked.exception';

describe('ReviewLikeService', () => {
  let service: ReviewLikeService;
  let reviewRepo: jest.Mocked<IReviewRepository>;
  let likeRepo: jest.Mocked<IReviewLikeRepository>;

  const existingReview = ReviewModel.reconstitute({
    id: 1,
    subjectRef: new SubjectReference(SubjectType.ALBUM, '10'),
    content: 'Great album',
    rating: 5,
    createdAt: new Date(),
    authorId: '42',
    updatedAt: null,
  });

  beforeEach(() => {
    reviewRepo = createMockReviewRepository();
    likeRepo = createMockReviewLikeRepository();
    service = new ReviewLikeService(reviewRepo, likeRepo);
  });

  describe('like', () => {
    it('adds a like when the review exists', async () => {
      reviewRepo.findById.mockResolvedValue(existingReview);

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

    it('propagates an already-liked rejection from the repository', async () => {
      reviewRepo.findById.mockResolvedValue(existingReview);
      const conflict = new Error('already liked');
      likeRepo.addLike.mockRejectedValue(conflict);

      await expect(service.like(1, '7')).rejects.toBe(conflict);
    });
  });

  describe('unlike', () => {
    it('removes the like when one exists', async () => {
      reviewRepo.findById.mockResolvedValue(existingReview);
      likeRepo.removeLike.mockResolvedValue(true);

      await service.unlike(1, '7');

      expect(likeRepo.removeLike).toHaveBeenCalledWith(1, '7');
    });

    it('throws NotLikedException when there is no like to remove', async () => {
      reviewRepo.findById.mockResolvedValue(existingReview);
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
      reviewRepo.findById.mockResolvedValue(existingReview);
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
