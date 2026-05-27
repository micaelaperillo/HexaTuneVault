import { GetReviewService } from './get-review.service.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import type { ISubjectResolver } from '@review/port/out/subject-resolver.port.js';
import {
  SubjectReference,
  SubjectType,
} from '@review/domain/model/subject-reference.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import { ReviewNotFoundException } from '@review/domain/exception/review-not-found.exception.js';
import { SubjectNotFoundException } from '@review/domain/exception/subject-not-found.exception.js';
import { SubjectSummary } from '@review/domain/model/subject-summary.js';

describe('GetReviewService', () => {
  let service: GetReviewService;
  let reviewRepo: jest.Mocked<IReviewRepository>;
  let subjectResolver: jest.Mocked<ISubjectResolver>;

  beforeEach(() => {
    reviewRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByAuthorAndSubject: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    };

    subjectResolver = {
      resolve: jest.fn(),
    };

    service = new GetReviewService(reviewRepo, subjectResolver);
  });

  it('should throw ReviewNotFoundException if not found', async () => {
    reviewRepo.findById.mockResolvedValue(null);

    await expect(service.execute(1)).rejects.toThrow(ReviewNotFoundException);
  });

  it('should retrieve a review with its resolved subject', async () => {
    const review = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.ALBUM, 1),
      content: 'Okay',
      rating: 3,
      createdAt: new Date(),
      authorId: 1,
      updatedAt: null,
    });
    const subject = new SubjectSummary(1, 'Album 1', SubjectType.ALBUM);

    reviewRepo.findById.mockResolvedValue(review);
    subjectResolver.resolve.mockResolvedValue(subject);

    const result = await service.execute(1);

    expect(result.review).toEqual(review);
    expect(result.subject).toEqual(subject);
    expect(subjectResolver.resolve).toHaveBeenCalledWith(review.subjectRef);
  });

  it('should propagate SubjectNotFoundException from resolver', async () => {
    const review = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.ALBUM, 999),
      content: 'Test',
      rating: 3,
      createdAt: new Date(),
      authorId: 1,
      updatedAt: null,
    });
    reviewRepo.findById.mockResolvedValue(review);
    subjectResolver.resolve.mockRejectedValue(new SubjectNotFoundException());

    await expect(service.execute(1)).rejects.toThrow(SubjectNotFoundException);
  });
});
