import { CreateReviewService } from './create-review.service.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import type { ISubjectResolver } from '@review/port/out/subject-resolver.port.js';
import {
  SubjectType,
  SubjectReference,
} from '@review/domain/model/subject-reference.js';
import { DuplicateReviewException } from '@review/domain/exception/duplicate-review.exception.js';
import { InvalidReviewException } from '@review/domain/exception/invalid-review.exception.js';
import { SubjectNotFoundException } from '@review/domain/exception/subject-not-found.exception.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import { SubjectSummary } from '@review/domain/model/subject-summary.js';

describe('CreateReviewService', () => {
  let service: CreateReviewService;
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

    service = new CreateReviewService(reviewRepo, subjectResolver);
  });

  it('should successfully create and save a review', async () => {
    reviewRepo.findByAuthorAndSubject.mockResolvedValue(null);
    const mockCreatedReview = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.ALBUM, 1),
      content: 'Great stuff',
      rating: 5,
      createdAt: new Date(),
      authorId: 1,
      updatedAt: null,
    });
    reviewRepo.save.mockResolvedValue(mockCreatedReview);
    subjectResolver.resolve.mockResolvedValue(
      new SubjectSummary(1, 'Album', SubjectType.ALBUM),
    );

    const result = await service.execute({
      subjectType: SubjectType.ALBUM,
      subjectId: 1,
      content: 'Great stuff',
      rating: 5,
      authorId: 1,
    });

    expect(reviewRepo.findByAuthorAndSubject).toHaveBeenCalledTimes(1);
    expect(subjectResolver.resolve).toHaveBeenCalledTimes(1);
    expect(reviewRepo.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCreatedReview);
  });

  it('should throw DuplicateReviewException if user already reviewed subject', async () => {
    const existingReview = ReviewModel.create({
      subjectRef: new SubjectReference(SubjectType.ALBUM, 1),
      content: 'Old',
      rating: 4,
      authorId: 1,
    });
    reviewRepo.findByAuthorAndSubject.mockResolvedValue(existingReview);

    await expect(
      service.execute({
        subjectType: SubjectType.ALBUM,
        subjectId: 1,
        content: 'New content',
        rating: 3,
        authorId: 1,
      }),
    ).rejects.toThrow(DuplicateReviewException);

    expect(reviewRepo.findByAuthorAndSubject).toHaveBeenCalledTimes(1);
    expect(subjectResolver.resolve).not.toHaveBeenCalled();
    expect(reviewRepo.save).not.toHaveBeenCalled();
  });

  it('should propagate InvalidReviewException from domain (fail-fast before I/O)', async () => {
    await expect(
      service.execute({
        subjectType: SubjectType.ALBUM,
        subjectId: 1,
        content: 'Great stuff',
        rating: 0,
        authorId: 1,
      }),
    ).rejects.toThrow(InvalidReviewException);

    expect(reviewRepo.findByAuthorAndSubject).not.toHaveBeenCalled();
    expect(subjectResolver.resolve).not.toHaveBeenCalled();
    expect(reviewRepo.save).not.toHaveBeenCalled();
  });

  it('should propagate SubjectNotFoundException from resolver', async () => {
    reviewRepo.findByAuthorAndSubject.mockResolvedValue(null);
    subjectResolver.resolve.mockRejectedValue(new SubjectNotFoundException());

    await expect(
      service.execute({
        subjectType: SubjectType.ALBUM,
        subjectId: 999,
        content: 'Great stuff',
        rating: 5,
        authorId: 1,
      }),
    ).rejects.toThrow(SubjectNotFoundException);

    expect(reviewRepo.save).not.toHaveBeenCalled();
  });
});
