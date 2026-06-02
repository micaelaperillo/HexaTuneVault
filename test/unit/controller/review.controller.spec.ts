import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from '../../../src/controller/review.controller';
import type { ICreateReview } from '../../../src/port/review/create-review.port';
import type { IDeleteReview } from '../../../src/port/review/delete-review.port';
import type { ISearchReview } from '../../../src/port/review/search-review.port';
import type { IGetReview } from '../../../src/port/review/get-review.port';
import type { ILikeReview } from '../../../src/port/review/like-review.port';
import type { IUnlikeReview } from '../../../src/port/review/unlike-review.port';
import type { ICountReviewLikes } from '../../../src/port/review/count-review-likes.port';
import type { IHasLikedReview } from '../../../src/port/review/has-liked-review.port';
import { CREATE_REVIEW } from '../../../src/port/review/create-review.port';
import { DELETE_REVIEW } from '../../../src/port/review/delete-review.port';
import { SEARCH_REVIEW } from '../../../src/port/review/search-review.port';
import { GET_REVIEW } from '../../../src/port/review/get-review.port';
import { LIKE_REVIEW } from '../../../src/port/review/like-review.port';
import { UNLIKE_REVIEW } from '../../../src/port/review/unlike-review.port';
import { COUNT_REVIEW_LIKES } from '../../../src/port/review/count-review-likes.port';
import { HAS_LIKED_REVIEW } from '../../../src/port/review/has-liked-review.port';
import { SortField, SortOrder } from '../../../src/model/review.filter';
import { SubjectType } from '../../../src/model/review-subject';
import type { ReviewModel, UserModel } from '../../../src/model';
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
  let hasLikedReview: jest.Mocked<IHasLikedReview>;

  let mockResponse: { header: jest.Mock };
  let mockRequest: { protocol: string; get: jest.Mock };
  const mockUser = { id: 1 } as unknown as UserModel;

  const reviewModel = (overrides: Partial<ReviewModel> = {}): ReviewModel => ({
    id: 123,
    subject: { album: '1' },
    content: 'Great stuff',
    rating: 5,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    author: mockUser,
    updatedAt: null,
    ...overrides,
  });

  beforeEach(async () => {
    createReview = { create: jest.fn() };
    deleteReview = { delete: jest.fn() };
    searchReview = { search: jest.fn() };
    getReview = { get: jest.fn() };
    likeReview = { like: jest.fn() };
    unlikeReview = { unlike: jest.fn() };
    countReviewLikes = { count: jest.fn() };
    hasLikedReview = { hasLiked: jest.fn() };

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
        { provide: HAS_LIKED_REVIEW, useValue: hasLikedReview },
      ],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
  });

  describe('create', () => {
    it('should return created review and set Location header', async () => {
      const dto = {
        content: 'Great stuff',
        rating: 5,
        subject: { album: '1' },
      };

      createReview.create.mockResolvedValue(reviewModel());

      const result = await controller.create(
        dto,
        mockUser,
        mockResponse as unknown as Response,
        mockRequest as unknown as Request,
      );

      expect(createReview.create).toHaveBeenCalledWith({
        content: dto.content,
        rating: dto.rating,
        subject: dto.subject,
        author: mockUser,
      });
      expect(mockResponse.header).toHaveBeenCalledWith(
        'Location',
        'http://localhost:3000/api/reviews/123',
      );
      expect(result.id).toBe(123);
      expect(result.content).toBe('Great stuff');
      expect(result.rating).toBe(5);
      expect(result.subject).toBe('/api/albums/1');
      expect(result.created_at).toEqual(new Date('2023-01-01T00:00:00Z'));
      expect(result.updated_at).toBeNull();
    });
  });

  describe('getById', () => {
    it('should return a specific review', async () => {
      getReview.get.mockResolvedValue(reviewModel());

      const result = await controller.getById(123);

      expect(getReview.get).toHaveBeenCalledWith(123);
      expect(result.id).toBe(123);
      expect(result.content).toBe('Great stuff');
      expect(result.rating).toBe(5);
    });
  });

  describe('search', () => {
    it('should return search results and set X-Total-Count header', async () => {
      searchReview.search.mockResolvedValue({
        items: [reviewModel({ content: 'Search match', rating: 4 })],
        total: 1,
        page: 1,
        pageSize: 10,
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
      expect(mockResponse.header).toHaveBeenCalledWith('X-Total-Count', '1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(123);
    });
  });

  describe('remove', () => {
    it('should delete a review', async () => {
      await controller.remove(123, mockUser);

      expect(deleteReview.delete).toHaveBeenCalledWith({
        reviewId: 123,
        requesterId: mockUser,
      });
    });
  });

  describe('like', () => {
    it('should like a review on behalf of the current user', async () => {
      await controller.like(123, mockUser);

      expect(likeReview.like).toHaveBeenCalledWith(123, 1);
    });
  });

  describe('unlike', () => {
    it('should unlike a review on behalf of the current user', async () => {
      await controller.unlike(123, mockUser);

      expect(unlikeReview.unlike).toHaveBeenCalledWith(123, 1);
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

  describe('hasLiked', () => {
    it('returns whether the current user has liked the review', async () => {
      hasLikedReview.hasLiked.mockResolvedValue(true);

      const result = await controller.hasLiked(123, mockUser);

      expect(hasLikedReview.hasLiked).toHaveBeenCalledWith(123, 1);
      expect(result.liked).toBe(true);
    });
  });

  describe('search with subject_type filter', () => {
    it('includes subjectType and subjectId when subject_type is provided', async () => {
      searchReview.search.mockResolvedValue({
        items: [reviewModel()],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      await controller.search(
        {
          page: 1,
          page_size: 10,
          sort_by: SortField.CREATED_AT,
          sort_order: SortOrder.DESC,
          subject_type: SubjectType.ALBUM,
          subject_id: '1',
        },
        mockResponse as unknown as Response,
      );

      expect(searchReview.search).toHaveBeenCalledWith(
        expect.objectContaining({ subjectType: 'album', subjectId: '1' }),
      );
    });

    it('sets subjectType and subjectId to undefined when subject_type is absent', async () => {
      searchReview.search.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      });

      await controller.search(
        {
          page: 1,
          page_size: 10,
          sort_by: SortField.CREATED_AT,
          sort_order: SortOrder.DESC,
        },
        mockResponse as unknown as Response,
      );

      expect(searchReview.search).toHaveBeenCalledWith(
        expect.objectContaining({
          subjectType: undefined,
          subjectId: undefined,
        }),
      );
    });
  });

  describe('toResponse subject variants', () => {
    it('maps an artist subject to /api/artists/:id', async () => {
      getReview.get.mockResolvedValue(
        reviewModel({ subject: { artist: 'The Beatles' } }),
      );

      const result = await controller.getById(123);

      expect(result.subject).toBe('/api/artists/The Beatles');
    });

    it('maps a podcast subject to /api/podcasts/:id', async () => {
      getReview.get.mockResolvedValue(
        reviewModel({ subject: { podcast: 'JRE' } }),
      );

      const result = await controller.getById(123);

      expect(result.subject).toBe('/api/podcasts/JRE');
    });

    it('maps a track subject to /api/tracks/:id', async () => {
      getReview.get.mockResolvedValue(
        reviewModel({ subject: { track: 'track-123' } }),
      );

      const result = await controller.getById(123);

      expect(result.subject).toBe('/api/tracks/track-123');
    });
  });
});
