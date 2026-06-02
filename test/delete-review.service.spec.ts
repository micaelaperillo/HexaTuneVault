import { DeleteReviewService } from '../src/use-case/delete-review.service';
import { createMockReviewRepository } from './mock-review-repository';
import type { IReviewRepository } from '../src/repository/review-repository.port';
import { SubjectReference, SubjectType } from '../src/model/subject-reference';
import { ReviewModel } from '../src/model/review.model';
import { ReviewNotFoundException } from '../src/error/review/review-not-found.exception';
import { ForbiddenDeletionException } from '../src/error/review/forbidden-deletion.exception';
import { UserModel } from '../src/model';

describe('DeleteReviewService', () => {
  let service: DeleteReviewService;
  let reviewRepo: jest.Mocked<IReviewRepository>;

  const mockUser = { id: 1 } as unknown as UserModel;
  const mockUser2 = { id: 2 } as unknown as UserModel;

  beforeEach(() => {
    reviewRepo = createMockReviewRepository();

    service = new DeleteReviewService(reviewRepo);
  });

  it('should throw ReviewNotFoundException if review does not exist', async () => {
    reviewRepo.findById.mockResolvedValue(null);

    await expect(
      service.execute({ reviewId: 1, requesterId: mockUser }),
    ).rejects.toThrow(ReviewNotFoundException);
  });

  it('should throw ForbiddenDeletionException if requester is not the author', async () => {
    const review = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.TRACK, '1'),
      content: 'Nice',
      rating: 5,
      createdAt: new Date(),
      author: mockUser2, // different author
      updatedAt: null,
    });
    reviewRepo.findById.mockResolvedValue(review);

    await expect(
      service.execute({ reviewId: 1, requesterId: mockUser }),
    ).rejects.toThrow(ForbiddenDeletionException);
  });

  it('should delete the review if requester is the owner', async () => {
    const review = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.TRACK, '1'),
      content: 'Nice',
      rating: 5,
      createdAt: new Date(),
      author: mockUser,
      updatedAt: null,
    });
    reviewRepo.findById.mockResolvedValue(review);

    await service.execute({ reviewId: 1, requesterId: mockUser });

    expect(reviewRepo.findById).toHaveBeenCalledWith(1);
    expect(reviewRepo.delete).toHaveBeenCalledWith(1);
  });
});
