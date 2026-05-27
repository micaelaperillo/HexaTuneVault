import { SearchReviewService } from './search-review.service.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import type { ISubjectResolver } from '@review/port/out/subject-resolver.port.js';
import { SearchCriteria } from '@review/domain/model/search-criteria.js';
import {
  SubjectReference,
  SubjectType,
} from '@review/domain/model/subject-reference.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import { SubjectSummary } from '@review/domain/model/subject-summary.js';

describe('SearchReviewService', () => {
  let service: SearchReviewService;
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

    service = new SearchReviewService(reviewRepo, subjectResolver);
  });

  it('should return search results with resolved subjects', async () => {
    const criteria = new SearchCriteria();
    criteria.page = 1;
    criteria.pageSize = 10;

    const review = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.TRACK, 1),
      content: 'Okay',
      rating: 3,
      createdAt: new Date(),
      authorId: 1,
      updatedAt: null,
    });

    reviewRepo.search.mockResolvedValue({ data: [review], total: 1 });
    const subject = new SubjectSummary(1, 'Track 1', SubjectType.TRACK);
    subjectResolver.resolve.mockResolvedValue(subject);

    const result = await service.execute(criteria);

    expect(reviewRepo.search).toHaveBeenCalledWith(criteria);
    expect(subjectResolver.resolve).toHaveBeenCalledWith(review.subjectRef);
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].review).toEqual(review);
    expect(result.data[0].subject).toEqual(subject);
  });

  it('should return empty results without calling resolver', async () => {
    const criteria = new SearchCriteria();
    reviewRepo.search.mockResolvedValue({ data: [], total: 0 });

    const result = await service.execute(criteria);

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(subjectResolver.resolve).not.toHaveBeenCalled();
  });

  it('should resolve subjects for multiple reviews in parallel', async () => {
    const criteria = new SearchCriteria();
    const review1 = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.ALBUM, 1),
      content: 'First',
      rating: 5,
      createdAt: new Date(),
      authorId: 1,
      updatedAt: null,
    });
    const review2 = ReviewModel.reconstitute({
      id: 2,
      subjectRef: new SubjectReference(SubjectType.TRACK, 2),
      content: 'Second',
      rating: 3,
      createdAt: new Date(),
      authorId: 2,
      updatedAt: null,
    });

    reviewRepo.search.mockResolvedValue({
      data: [review1, review2],
      total: 2,
    });
    subjectResolver.resolve
      .mockResolvedValueOnce(
        new SubjectSummary(1, 'Album 1', SubjectType.ALBUM),
      )
      .mockResolvedValueOnce(
        new SubjectSummary(2, 'Track 2', SubjectType.TRACK),
      );

    const result = await service.execute(criteria);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].subject.name).toBe('Album 1');
    expect(result.data[1].subject.name).toBe('Track 2');
    expect(subjectResolver.resolve).toHaveBeenCalledTimes(2);
  });

  it('should propagate resolver failure during batch resolution', async () => {
    const criteria = new SearchCriteria();
    const review = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.ALBUM, 1),
      content: 'Test',
      rating: 5,
      createdAt: new Date(),
      authorId: 1,
      updatedAt: null,
    });

    reviewRepo.search.mockResolvedValue({ data: [review], total: 1 });
    subjectResolver.resolve.mockRejectedValue(new Error('resolver down'));

    await expect(service.execute(criteria)).rejects.toThrow('resolver down');
  });
});
