import { CreateReviewService } from '../src/use-case/create-review.service';
import { createMockReviewRepository } from './mock-review-repository';
import type { IReviewConfig } from '../src/port/review/review-config.port';
import type { IReviewRepository } from '../src/repository/review-repository.port';
import { SubjectType, SubjectReference } from '../src/model/subject-reference';
import { ReviewCooldownException } from '../src/error/review/review-cooldown.exception';
import { InvalidReviewException } from '../src/error/review/invalid-review.exception';
import { ReviewModel } from '../src/model/review.model';

describe('CreateReviewService', () => {
  let service: CreateReviewService;
  let reviewRepo: jest.Mocked<IReviewRepository>;
  let mockConfig: IReviewConfig;

  beforeEach(() => {
    reviewRepo = createMockReviewRepository();

    mockConfig = { cooldownSeconds: 60 };

    service = new CreateReviewService(reviewRepo, mockConfig);
  });

  it('should successfully create and save a review', async () => {
    reviewRepo.findRecentByAuthorAndSubject.mockResolvedValue(null);
    const mockCreatedReview = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.ALBUM, '1'),
      content: 'Great stuff',
      rating: 5,
      createdAt: new Date(),
      authorId: '1',
      updatedAt: null,
    });
    reviewRepo.save.mockResolvedValue(mockCreatedReview);

    const result = await service.execute({
      subjectType: SubjectType.ALBUM,
      subjectId: '1',
      content: 'Great stuff',
      rating: 5,
      authorId: '1',
    });

    expect(reviewRepo.findRecentByAuthorAndSubject).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ type: SubjectType.ALBUM, id: '1' }),
      expect.any(Date),
    );
    expect(reviewRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Great stuff',
        rating: 5,
        authorId: '1',
      }),
    );
    expect(result).toEqual(mockCreatedReview);
  });

  it('should throw ReviewCooldownException if user reviewed this subject recently', async () => {
    const existingReview = ReviewModel.create({
      subjectRef: new SubjectReference(SubjectType.ALBUM, '1'),
      content: 'Old',
      rating: 4,
      authorId: '1',
    });
    reviewRepo.findRecentByAuthorAndSubject.mockResolvedValue(existingReview);

    await expect(
      service.execute({
        subjectType: SubjectType.ALBUM,
        subjectId: '1',
        content: 'New content',
        rating: 3,
        authorId: '1',
      }),
    ).rejects.toThrow(ReviewCooldownException);

    expect(reviewRepo.findRecentByAuthorAndSubject).toHaveBeenCalledTimes(1);
    expect(reviewRepo.save).not.toHaveBeenCalled();
  });

  it('should propagate InvalidReviewException from domain (fail-fast before I/O)', async () => {
    await expect(
      service.execute({
        subjectType: SubjectType.ALBUM,
        subjectId: '1',
        content: 'Great stuff',
        rating: 0,
        authorId: '1',
      }),
    ).rejects.toThrow(InvalidReviewException);

    expect(reviewRepo.findRecentByAuthorAndSubject).not.toHaveBeenCalled();
    expect(reviewRepo.save).not.toHaveBeenCalled();
  });
});
