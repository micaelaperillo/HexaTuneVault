import { LikeReviewService } from '../src/use-case/like-review.service';
import { createMockReviewRepository } from './mock-review-repository';
import { createMockReviewLikeRepository } from './mock-review-like-repository';
import type { IReviewRepository } from '../src/repository/review-repository.port';
import type { IReviewLikeRepository } from '../src/repository/review-like-repository.port';
import { SubjectReference, SubjectType } from '../src/model/subject-reference';
import { ReviewModel } from '../src/model/review.model';
import { ReviewNotFoundException } from '../src/error/review/review-not-found.exception';

describe('LikeReviewService', () => {
  let service: LikeReviewService;
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
    service = new LikeReviewService(reviewRepo, likeRepo);
  });

  it('should add a like when the review exists', async () => {
    reviewRepo.findById.mockResolvedValue(existingReview);

    await service.execute(1, '7');

    expect(likeRepo.addLike).toHaveBeenCalledWith(1, '7');
  });

  it('should be idempotent (repository absorbs an existing like)', async () => {
    reviewRepo.findById.mockResolvedValue(existingReview);
    likeRepo.addLike.mockResolvedValue(undefined);

    await expect(service.execute(1, '7')).resolves.toBeUndefined();
  });

  it('should throw ReviewNotFoundException when the review is missing', async () => {
    reviewRepo.findById.mockResolvedValue(null);

    await expect(service.execute(999, '7')).rejects.toThrow(
      ReviewNotFoundException,
    );
    expect(likeRepo.addLike).not.toHaveBeenCalled();
  });
});
