import { UnlikeReviewService } from '../src/use-case/unlike-review.service';
import { createMockReviewRepository } from './mock-review-repository';
import { createMockReviewLikeRepository } from './mock-review-like-repository';
import type { IReviewRepository } from '../src/repository/review-repository.port';
import type { IReviewLikeRepository } from '../src/repository/review-like-repository.port';
import { SubjectReference, SubjectType } from '../src/model/subject-reference';
import { ReviewModel } from '../src/model/review.model';
import { ReviewNotFoundException } from '../src/error/review/review-not-found.exception';
import { NotLikedException } from '../src/error/review/not-liked.exception';

describe('UnlikeReviewService', () => {
  let service: UnlikeReviewService;
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
    service = new UnlikeReviewService(reviewRepo, likeRepo);
  });

  it('should remove the like when one exists', async () => {
    reviewRepo.findById.mockResolvedValue(existingReview);
    likeRepo.removeLike.mockResolvedValue(true);

    await service.execute(1, '7');

    expect(likeRepo.removeLike).toHaveBeenCalledWith(1, '7');
  });

  it('should throw NotLikedException when there is no like to remove', async () => {
    reviewRepo.findById.mockResolvedValue(existingReview);
    likeRepo.removeLike.mockResolvedValue(false);

    await expect(service.execute(1, '7')).rejects.toThrow(NotLikedException);
  });

  it('should throw ReviewNotFoundException when the review is missing', async () => {
    reviewRepo.findById.mockResolvedValue(null);

    await expect(service.execute(999, '7')).rejects.toThrow(
      ReviewNotFoundException,
    );
    expect(likeRepo.removeLike).not.toHaveBeenCalled();
  });
});
