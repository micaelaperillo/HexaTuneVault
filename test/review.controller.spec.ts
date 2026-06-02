import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from '../src/controller/review.controller';
import type { ICreateReview } from '../src/port/review/create-review.port';
import type { IDeleteReview } from '../src/port/review/delete-review.port';
import type { ISearchReview } from '../src/port/review/search-review.port';
import type { IGetReview } from '../src/port/review/get-review.port';
import type { ILikeReview } from '../src/port/review/like-review.port';
import type { IUnlikeReview } from '../src/port/review/unlike-review.port';
import type { ICountReviewLikes } from '../src/port/review/count-review-likes.port';
import { CREATE_REVIEW } from '../src/port/review/create-review.port';
import { DELETE_REVIEW } from '../src/port/review/delete-review.port';
import { SEARCH_REVIEW } from '../src/port/review/search-review.port';
import { GET_REVIEW } from '../src/port/review/get-review.port';
import { LIKE_REVIEW } from '../src/port/review/like-review.port';
import { UNLIKE_REVIEW } from '../src/port/review/unlike-review.port';
import { COUNT_REVIEW_LIKES } from '../src/port/review/count-review-likes.port';
import { SubjectType, SubjectReference } from '../src/model/subject-reference';
import { ReviewModel } from '../src/model/review.model';
import { SortField, SortOrder } from '../src/model/review-search-criteria';
import type { Response, Request } from 'express';

describe('ReviewController', () => {
  let controller: ReviewController;
  let createReview: jest.Mocked<ICreateReview>;
  let deleteReview: jest.Mocked<IDeleteReview>;
  let searchReview: jest.Mocked<ISearchReview>;
  let getReview: jest.Mocked<IGetReview>;
  let likeReview: jest.Mocked<ILikeReview>;
  let unlikeReview: jest.Mocked<IUnlikeReview>;
  let countReviewLikes: jest.Mocked<ICountReviewLikes>;

  let mockResponse: { header: jest.Mock };
  let mockRequest: { protocol: string; get: jest.Mock };

  beforeEach(async () => {
    createReview = { create: jest.fn() };
    deleteReview = { delete: jest.fn() };
    searchReview = { search: jest.fn() };
    getReview = { get: jest.fn() };
    likeReview = { like: jest.fn() };
    unlikeReview = { unlike: jest.fn() };
    countReviewLikes = { count: jest.fn() };

    mockResponse = {
      header: jest.fn(),
    };
    mockRequest = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        { provide: CREATE_REVIEW, useValue: createReview },
        { provide: DELETE_REVIEW, useValue: deleteReview },
        { provide: SEARCH_REVIEW, useValue: searchReview },
        { provide: GET_REVIEW, useValue: getReview },
        { provide: LIKE_REVIEW, useValue: likeReview },
        { provide: UNLIKE_REVIEW, useValue: unlikeReview },
        { provide: COUNT_REVIEW_LIKES, useValue: countReviewLikes },
      ],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
  });

  describe('create', () => {
    it('should return created review and set Location header', async () => {
      const dto = {
        content: 'Great stuff',
        rating: 5,
        subject_type: SubjectType.ALBUM,
        subject_id: '1',
      };

      const createdModel = ReviewModel.reconstitute({
        id: 123,
        subjectRef: new SubjectReference(SubjectType.ALBUM, '1'),
        content: 'Great stuff',
        rating: 5,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        authorId: '1',
        updatedAt: null,
      });

      createReview.create.mockResolvedValue(createdModel);

      const result = await controller.create(
        dto,
        mockResponse as unknown as Response,
        mockRequest as unknown as Request,
      );

      expect(createReview.create).toHaveBeenCalledWith({
        content: dto.content,
        rating: dto.rating,
        subjectType: dto.subject_type,
        subjectId: dto.subject_id,
        authorId: '1',
      });
      expect(mockResponse.header).toHaveBeenCalledWith(
        'Location',
        'http://localhost:3000/api/reviews/123',
      );
      expect(result.id).toBe(123);
      expect(result.content).toBe('Great stuff');
      expect(result.rating).toBe(5);
      expect(result.subject_type).toBe('album');
      expect(result.subject_id).toBe('1');
      expect(result.author_id).toBe('1');
      expect(result.created_at).toEqual(new Date('2023-01-01T00:00:00Z'));
      expect(result.updated_at).toBeNull();
    });
  });

  describe('getById', () => {
    it('should return a specific review', async () => {
      const reviewModel = ReviewModel.reconstitute({
        id: 123,
        subjectRef: new SubjectReference(SubjectType.ALBUM, '1'),
        content: 'Great stuff',
        rating: 5,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        authorId: '1',
        updatedAt: null,
      });

      getReview.get.mockResolvedValue(reviewModel);

      const result = await controller.getById(123);

      expect(getReview.get).toHaveBeenCalledWith(123);
      expect(result.id).toBe(123);
      expect(result.content).toBe('Great stuff');
      expect(result.rating).toBe(5);
    });
  });

  describe('search', () => {
    it('should return search results and set X-Total-Count header', async () => {
      const reviewModel = ReviewModel.reconstitute({
        id: 123,
        subjectRef: new SubjectReference(SubjectType.ALBUM, '1'),
        content: 'Search match',
        rating: 4,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        authorId: '1',
        updatedAt: null,
      });

      searchReview.search.mockResolvedValue({
        data: [reviewModel],
        total: 10,
      });

      const result = await controller.search(
        {
          page: 1,
          page_size: 10,
          sort_by: SortField.CREATED_AT,
          sort_order: SortOrder.DESC,
        },
        mockResponse as unknown as Response,
      );

      expect(searchReview.search).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 10 }),
      );
      expect(mockResponse.header).toHaveBeenCalledWith('X-Total-Count', '10');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(123);
    });
  });

  describe('remove', () => {
    it('should delete a review', async () => {
      await controller.remove(123);

      expect(deleteReview.delete).toHaveBeenCalledWith({
        reviewId: 123,
        requesterId: '1',
      });
    });
  });

  describe('like', () => {
    it('should like a review on behalf of the current user', async () => {
      await controller.like(123);

      expect(likeReview.like).toHaveBeenCalledWith(123, '1');
    });
  });

  describe('unlike', () => {
    it('should unlike a review on behalf of the current user', async () => {
      await controller.unlike(123);

      expect(unlikeReview.unlike).toHaveBeenCalledWith(123, '1');
    });
  });

  describe('likeCount', () => {
    it('should return the like count for a review', async () => {
      countReviewLikes.count.mockResolvedValue(12);

      const result = await controller.likeCount(123);

      expect(countReviewLikes.count).toHaveBeenCalledWith(123);
      expect(result.review_id).toBe(123);
      expect(result.count).toBe(12);
    });
  });
});
