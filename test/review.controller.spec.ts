import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from '../src/controller/review.controller';
import type { ICreateReview } from '../src/port/review/create-review.port';
import type { IDeleteReview } from '../src/port/review/delete-review.port';
import type { ISearchReview } from '../src/port/review/search-review.port';
import type { IGetReview } from '../src/port/review/get-review.port';
import {
  CREATE_REVIEW,
  DELETE_REVIEW,
  SEARCH_REVIEW,
  GET_REVIEW,
} from '../src/port/review/tokens';
import { SubjectType, SubjectReference } from '../src/model/subject-reference';
import { ReviewModel } from '../src/model/review.model';
import { SortField, SortOrder } from '../src/model/review-search-criteria';
import type { Response, Request } from 'express';
import { UserModel } from '../src/model';

describe('ReviewController', () => {
  let controller: ReviewController;
  let createReview: jest.Mocked<ICreateReview>;
  let deleteReview: jest.Mocked<IDeleteReview>;
  let searchReview: jest.Mocked<ISearchReview>;
  let getReview: jest.Mocked<IGetReview>;

  let mockResponse: { header: jest.Mock };
  let mockRequest: { protocol: string; get: jest.Mock };
  const mockUser = { id: 1 } as unknown as UserModel;

  beforeEach(async () => {
    createReview = { execute: jest.fn() };
    deleteReview = { execute: jest.fn() };
    searchReview = { execute: jest.fn() };
    getReview = { execute: jest.fn() };

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
        author: mockUser,
        updatedAt: null,
      });

      createReview.execute.mockResolvedValue(createdModel);

      const result = await controller.create(
        dto,
        mockResponse as unknown as Response,
        mockRequest as unknown as Request,
      );

      expect(createReview.execute).toHaveBeenCalledWith({
        content: dto.content,
        rating: dto.rating,
        subjectType: dto.subject_type,
        subjectId: dto.subject_id,
        author: mockUser,
      });
      expect(mockResponse.header).toHaveBeenCalledWith(
        'Location',
        'http://localhost:3000/api/reviews/123',
      );
      expect(result.id).toBe(123);
      expect(result.content).toBe('Great stuff');
      expect(result.rating).toBe(5);
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
        author: mockUser,
        updatedAt: null,
      });

      getReview.execute.mockResolvedValue(reviewModel);

      const result = await controller.getById(123);

      expect(getReview.execute).toHaveBeenCalledWith(123);
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
        author: mockUser,
        updatedAt: null,
      });

      searchReview.execute.mockResolvedValue({
        items: [reviewModel],
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

      expect(searchReview.execute).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 10 }),
      );
      expect(mockResponse.header).toHaveBeenCalledWith('X-Total-Count', '1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(123);
    });
  });

  describe('remove', () => {
    it('should delete a review', async () => {
      await controller.remove(123);

      expect(deleteReview.execute).toHaveBeenCalledWith({
        reviewId: 123,
        requesterId: mockUser,
      });
    });
  });
});
