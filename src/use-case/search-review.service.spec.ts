import { SearchReviewService } from './search-review.service';
import { createMockReviewRepository } from '../__test__/mock-review-repository';
import type { IReviewRepository } from '../repository/review-repository.port';
import type { SearchCriteria } from '../model/search-criteria';
import { SortField, SortOrder } from '../model/search-criteria';
import { SubjectReference, SubjectType } from '../model/subject-reference';
import { ReviewModel } from '../model/review.model';

describe('SearchReviewService', () => {
  let service: SearchReviewService;
  let reviewRepo: jest.Mocked<IReviewRepository>;

  const defaultCriteria: SearchCriteria = {
    page: 1,
    pageSize: 10,
    sortBy: SortField.CREATED_AT,
    sortOrder: SortOrder.DESC,
  };

  beforeEach(() => {
    reviewRepo = createMockReviewRepository();

    service = new SearchReviewService(reviewRepo);
  });

  it('should return search results from repository', async () => {
    const review = ReviewModel.reconstitute({
      id: 1,
      subjectRef: new SubjectReference(SubjectType.TRACK, '1'),
      content: 'Okay',
      rating: 3,
      createdAt: new Date(),
      authorId: '1',
      updatedAt: null,
    });

    reviewRepo.search.mockResolvedValue({ data: [review], total: 1 });

    const result = await service.execute(defaultCriteria);

    expect(reviewRepo.search).toHaveBeenCalledWith(defaultCriteria);
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual(review);
  });

  it('should return empty results', async () => {
    reviewRepo.search.mockResolvedValue({ data: [], total: 0 });

    const result = await service.execute(defaultCriteria);

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('should pass criteria filters to repository', async () => {
    const criteria: SearchCriteria = {
      ...defaultCriteria,
      content: 'search term',
      authorId: '5',
      minRating: 3,
    };
    reviewRepo.search.mockResolvedValue({ data: [], total: 0 });

    await service.execute(criteria);

    expect(reviewRepo.search).toHaveBeenCalledWith(criteria);
  });
});
