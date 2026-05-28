import { CreateReviewService } from './create-review.service.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import type { ISubjectResolver } from '@review/port/out/subject-resolver.port.js';
import type { IReviewConfig } from '@review/port/out/review-config.port.js';
import {
  SubjectType,
  SubjectReference,
} from '@review/domain/model/subject-reference.js';
import { ReviewCooldownException } from '@review/domain/exception/review-cooldown.exception.js';
import { InvalidReviewException } from '@review/domain/exception/invalid-review.exception.js';
import { SubjectNotFoundException } from '@review/domain/exception/subject-not-found.exception.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import { SubjectSummary } from '@review/domain/model/subject-summary.js';

describe('CreateReviewService', () => {
  let service: CreateReviewService;
  let reviewRepo: jest.Mocked<IReviewRepository>;
  let subjectResolver: jest.Mocked<ISubjectResolver>;
  let mockConfig: IReviewConfig;

  beforeEach(() => {
    reviewRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findRecentByAuthorAndSubject: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    };

    subjectResolver = {
      resolve: jest.fn(),
    };

    mockConfig = { cooldownSeconds: 60 };

    service = new CreateReviewService(reviewRepo, subjectResolver, mockConfig);
  });

  it('should successfully create and save a review', async () => {
    reviewRepo.findRecentByAuthorAndSubject.mockResolvedValue(null);
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
    const mockSubject = new SubjectSummary(1, 'Album', SubjectType.ALBUM);
    subjectResolver.resolve.mockResolvedValue(mockSubject);

    const result = await service.execute({
      subjectType: SubjectType.ALBUM,
      subjectId: 1,
      content: 'Great stuff',
      rating: 5,
      authorId: 1,
    });

    expect(reviewRepo.findRecentByAuthorAndSubject).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ type: SubjectType.ALBUM, id: 1 }),
      expect.any(Date),
    );
    expect(subjectResolver.resolve).toHaveBeenCalledWith(
      expect.objectContaining({ type: SubjectType.ALBUM, id: 1 }),
    );
    expect(reviewRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Great stuff',
        rating: 5,
        authorId: 1,
      }),
    );
    expect(result.review).toEqual(mockCreatedReview);
    expect(result.subject).toEqual(mockSubject);
  });

  it('should throw ReviewCooldownException if user reviewed this subject recently', async () => {
    const existingReview = ReviewModel.create({
      subjectRef: new SubjectReference(SubjectType.ALBUM, 1),
      content: 'Old',
      rating: 4,
      authorId: 1,
    });
    reviewRepo.findRecentByAuthorAndSubject.mockResolvedValue(existingReview);

    await expect(
      service.execute({
        subjectType: SubjectType.ALBUM,
        subjectId: 1,
        content: 'New content',
        rating: 3,
        authorId: 1,
      }),
    ).rejects.toThrow(ReviewCooldownException);

    expect(reviewRepo.findRecentByAuthorAndSubject).toHaveBeenCalledTimes(1);
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

    expect(reviewRepo.findRecentByAuthorAndSubject).not.toHaveBeenCalled();
    expect(subjectResolver.resolve).not.toHaveBeenCalled();
    expect(reviewRepo.save).not.toHaveBeenCalled();
  });

  it('should propagate SubjectNotFoundException from resolver', async () => {
    reviewRepo.findRecentByAuthorAndSubject.mockResolvedValue(null);
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
