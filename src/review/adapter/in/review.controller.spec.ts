import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller.js';
import type { ICreateReview } from '@review/port/in/create-review.port.js';
import type { IDeleteReview } from '@review/port/in/delete-review.port.js';
import type { ISearchReview } from '@review/port/in/search-review.port.js';
import type { IGetReview } from '@review/port/in/get-review.port.js';
import {
  CREATE_REVIEW,
  DELETE_REVIEW,
  SEARCH_REVIEW,
  GET_REVIEW,
} from '@review/port/tokens.js';
import {
  SubjectType,
  SubjectReference,
} from '@review/domain/model/subject-reference.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import { SortField, SortOrder } from '@review/port/search-criteria.js';
import type { Response, Request } from 'express';

describe('ReviewController', () => {
  let controller: ReviewController;
  let createReview: jest.Mocked<ICreateReview>;
  let deleteReview: jest.Mocked<IDeleteReview>;
  let searchReview: jest.Mocked<ISearchReview>;
  let getReview: jest.Mocked<IGetReview>;

  let mockResponse: { header: jest.Mock };
  let mockRequest: { protocol: string; get: jest.Mock };

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
        subject_id: 1,
      };

      const createdModel = ReviewModel.reconstitute({
        id: 123,
        subjectRef: new SubjectReference(SubjectType.ALBUM, 1),
        content: 'Great stuff',
        rating: 5,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        authorId: 1,
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
        authorId: 1,
      });
      expect(mockResponse.header).toHaveBeenCalledWith(
        'Location',
        'http://localhost:3000/reviews/123',
      );
      expect(result.id).toBe(123);
      expect(result.content).toBe('Great stuff');
      expect(result.rating).toBe(5);
      expect(result.subject_type).toBe('album');
      expect(result.subject_id).toBe(1);
      expect(result.author_id).toBe(1);
      expect(result.created_at).toEqual(new Date('2023-01-01T00:00:00Z'));
      expect(result.updated_at).toBeNull();
    });
  });

  describe('getById', () => {
    it('should return a specific review', async () => {
      const reviewModel = ReviewModel.reconstitute({
        id: 123,
        subjectRef: new SubjectReference(SubjectType.ALBUM, 1),
        content: 'Great stuff',
        rating: 5,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        authorId: 1,
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
        subjectRef: new SubjectReference(SubjectType.ALBUM, 1),
        content: 'Search match',
        rating: 4,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        authorId: 1,
        updatedAt: null,
      });

      searchReview.execute.mockResolvedValue({
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

      expect(searchReview.execute).toHaveBeenCalledWith(
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

      expect(deleteReview.execute).toHaveBeenCalledWith({
        reviewId: 123,
        requesterId: 1,
      });
    });
  });
});
