import { GetReviewService } from './get-review.service';
import { createMockReviewRepository } from '../__test__/mock-review-repository';
import type { IReviewRepository } from '../repository/review-repository.port';
import { SubjectReference, SubjectType } from '../model/subject-reference';
import { ReviewModel } from '../model/review.model';
import { ReviewNotFoundException } from '../error/review/review-not-found.exception';

describe('GetReviewService', () => {
  let service: GetReviewService;
  let reviewRepo: jest.Mocked<IReviewRepository>;

  beforeEach(() => {
    reviewRepo = createMockReviewRepository();

    service = new GetReviewService(reviewRepo);
  });

  it('should throw ReviewNotFoundException if not found', async () => {
    reviewRepo.findById.mockResolvedValue(null);

    await expect(service.execute(1)).rejects.toThrow(ReviewNotFoundException);
  });

  it('should return the review when found', async () => {
    const review = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.ALBUM, '1'),
      content: 'Okay',
      rating: 3,
      createdAt: new Date(),
      authorId: '1',
      updatedAt: null,
    });

    reviewRepo.findById.mockResolvedValue(review);

    const result = await service.execute(1);

    expect(result).toEqual(review);
    expect(reviewRepo.findById).toHaveBeenCalledWith(1);
  });
});
