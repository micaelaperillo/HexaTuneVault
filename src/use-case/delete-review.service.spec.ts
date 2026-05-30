import { DeleteReviewService } from './delete-review.service.js';
import { createMockReviewRepository } from '../__test__/mock-review-repository.js';
import type { IReviewRepository } from '@repository/review-repository.port.js';
import { SubjectReference, SubjectType } from '@model/subject-reference.js';
import { ReviewModel } from '@model/review.model.js';
import { ReviewNotFoundException } from '@error/review/review-not-found.exception.js';
import { ForbiddenDeletionException } from '@error/review/forbidden-deletion.exception.js';

describe('DeleteReviewService', () => {
  let service: DeleteReviewService;
  let reviewRepo: jest.Mocked<IReviewRepository>;

  beforeEach(() => {
    reviewRepo = createMockReviewRepository();

    service = new DeleteReviewService(reviewRepo);
  });

  it('should throw ReviewNotFoundException if review does not exist', async () => {
    reviewRepo.findById.mockResolvedValue(null);

    await expect(
      service.execute({ reviewId: 1, requesterId: '1' }),
    ).rejects.toThrow(ReviewNotFoundException);
  });

  it('should throw ForbiddenDeletionException if requester is not the author', async () => {
    const review = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.TRACK, '1'),
      content: 'Nice',
      rating: 5,
      createdAt: new Date(),
      authorId: '2', // different author
      updatedAt: null,
    });
    reviewRepo.findById.mockResolvedValue(review);

    await expect(
      service.execute({ reviewId: 1, requesterId: '1' }),
    ).rejects.toThrow(ForbiddenDeletionException);
  });

  it('should delete the review if requester is the owner', async () => {
    const review = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.TRACK, '1'),
      content: 'Nice',
      rating: 5,
      createdAt: new Date(),
      authorId: '1',
      updatedAt: null,
    });
    reviewRepo.findById.mockResolvedValue(review);

    await service.execute({ reviewId: 1, requesterId: '1' });

    expect(reviewRepo.findById).toHaveBeenCalledWith(1);
    expect(reviewRepo.delete).toHaveBeenCalledWith(1);
  });
});
