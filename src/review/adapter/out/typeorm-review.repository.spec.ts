import { TypeOrmReviewRepository } from './typeorm-review.repository.js';
import { ReviewEntity } from '@review/entity/review.entity.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import {
  SubjectReference,
  SubjectType,
} from '@review/domain/model/subject-reference.js';
import {
  SearchCriteria,
  SortField,
  SortOrder,
} from '@review/domain/model/search-criteria.js';
import { DuplicateReviewException } from '@review/domain/exception/duplicate-review.exception.js';
import { ReviewNotFoundException } from '@review/domain/exception/review-not-found.exception.js';
import type { Repository } from 'typeorm';

describe('TypeOrmReviewRepository', () => {
  let repository: TypeOrmReviewRepository;
  let mockRepo: jest.Mocked<
    Pick<
      Repository<ReviewEntity>,
      'save' | 'findOne' | 'delete' | 'createQueryBuilder'
    >
  >;
  let mockQb: Record<string, jest.Mock>;

  function makeEntity(overrides?: Partial<ReviewEntity>): ReviewEntity {
    const entity = new ReviewEntity();
    entity.id = 1;
    entity.content = 'Great album';
    entity.rating = 5;
    entity.subjectType = 'album';
    entity.subjectId = 10;
    entity.authorId = 42;
    entity.createdAt = new Date();
    entity.updatedAt = null;
    return Object.assign(entity, overrides);
  }

  beforeEach(() => {
    mockQb = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    mockRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
    };

    repository = new TypeOrmReviewRepository(
      mockRepo as unknown as Repository<ReviewEntity>,
    );
  });

  describe('save', () => {
    const createModel = () =>
      ReviewModel.create({
        subjectRef: new SubjectReference(SubjectType.ALBUM, 10),
        content: 'Great album',
        rating: 5,
        authorId: 42,
      });

    it('should save and return domain model', async () => {
      mockRepo.save.mockResolvedValue(makeEntity());

      const result = await repository.save(createModel());

      expect(result.id).toBe(1);
      expect(result.content).toBe('Great album');
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should throw DuplicateReviewException on unique constraint violation', async () => {
      const error = new Error('duplicate key') as Error & { code: string };
      error.code = '23505';
      mockRepo.save.mockRejectedValue(error);

      await expect(repository.save(createModel())).rejects.toThrow(
        DuplicateReviewException,
      );
    });

    it('should rethrow Error without code property', async () => {
      mockRepo.save.mockRejectedValue(new Error('connection lost'));

      await expect(repository.save(createModel())).rejects.toThrow(
        'connection lost',
      );
    });

    it('should rethrow Error with non-duplicate code', async () => {
      const error = new Error('FK violation') as Error & { code: string };
      error.code = '23503';
      mockRepo.save.mockRejectedValue(error);

      await expect(repository.save(createModel())).rejects.toThrow(
        'FK violation',
      );
    });

    it('should rethrow non-Error thrown values', async () => {
      mockRepo.save.mockRejectedValue('string error');

      await expect(repository.save(createModel())).rejects.toBe('string error');
    });
  });

  describe('findById', () => {
    it('should return domain model when found', async () => {
      mockRepo.findOne.mockResolvedValue(makeEntity());

      const result = await repository.findById(1);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByAuthorAndSubject', () => {
    it('should return domain model when found', async () => {
      mockRepo.findOne.mockResolvedValue(makeEntity());

      const ref = new SubjectReference(SubjectType.ALBUM, 10);
      const result = await repository.findByAuthorAndSubject(42, ref);

      expect(result).not.toBeNull();
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { authorId: 42, subjectType: 'album', subjectId: 10 },
      });
    });

    it('should return null when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const ref = new SubjectReference(SubjectType.TRACK, 1);
      const result = await repository.findByAuthorAndSubject(1, ref);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should succeed when row affected', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

      await expect(repository.delete(1)).resolves.toBeUndefined();
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ReviewNotFoundException when no row affected', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(repository.delete(999)).rejects.toThrow(
        ReviewNotFoundException,
      );
    });

    it('should throw ReviewNotFoundException when affected is null', async () => {
      mockRepo.delete.mockResolvedValue({ affected: null, raw: [] });

      await expect(repository.delete(999)).rejects.toThrow(
        ReviewNotFoundException,
      );
    });
  });

  describe('search', () => {
    it('should not apply filters when criteria is empty', async () => {
      await repository.search(new SearchCriteria());

      expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('review');
      expect(mockQb.andWhere).not.toHaveBeenCalled();
      expect(mockQb.orderBy).toHaveBeenCalledWith('review.createdAt', 'DESC');
      expect(mockQb.skip).toHaveBeenCalledWith(0);
      expect(mockQb.take).toHaveBeenCalledWith(20);
    });

    it('should apply content filter with ILIKE escaping', async () => {
      const criteria = new SearchCriteria();
      criteria.content = '100% off_sale\\test';

      await repository.search(criteria);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.content ILIKE :content',
        { content: '%100\\% off\\_sale\\\\test%' },
      );
    });

    it('should apply authorId filter', async () => {
      const criteria = new SearchCriteria();
      criteria.authorId = 42;

      await repository.search(criteria);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.authorId = :authorId',
        { authorId: 42 },
      );
    });

    it('should apply minRating filter', async () => {
      const criteria = new SearchCriteria();
      criteria.minRating = 3;

      await repository.search(criteria);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.rating >= :minRating',
        { minRating: 3 },
      );
    });

    it('should apply maxRating filter', async () => {
      const criteria = new SearchCriteria();
      criteria.maxRating = 4;

      await repository.search(criteria);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.rating <= :maxRating',
        { maxRating: 4 },
      );
    });

    it('should apply dateFrom filter', async () => {
      const date = new Date('2025-01-01');
      const criteria = new SearchCriteria();
      criteria.dateFrom = date;

      await repository.search(criteria);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.createdAt >= :dateFrom',
        { dateFrom: date },
      );
    });

    it('should apply dateTo filter', async () => {
      const date = new Date('2025-06-01');
      const criteria = new SearchCriteria();
      criteria.dateTo = date;

      await repository.search(criteria);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.createdAt <= :dateTo',
        { dateTo: date },
      );
    });

    it('should apply subjectType filter', async () => {
      const criteria = new SearchCriteria();
      criteria.subjectType = SubjectType.ALBUM;

      await repository.search(criteria);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.subjectType = :subjectType',
        { subjectType: 'album' },
      );
    });

    it('should apply subjectId filter', async () => {
      const criteria = new SearchCriteria();
      criteria.subjectId = 10;

      await repository.search(criteria);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.subjectId = :subjectId',
        { subjectId: 10 },
      );
    });

    it('should sort by rating ASC', async () => {
      const criteria = new SearchCriteria();
      criteria.sortBy = SortField.RATING;
      criteria.sortOrder = SortOrder.ASC;

      await repository.search(criteria);

      expect(mockQb.orderBy).toHaveBeenCalledWith('review.rating', 'ASC');
    });

    it('should sort by createdAt DESC by default', async () => {
      await repository.search(new SearchCriteria());

      expect(mockQb.orderBy).toHaveBeenCalledWith('review.createdAt', 'DESC');
    });

    it('should apply pagination', async () => {
      const criteria = new SearchCriteria();
      criteria.page = 3;
      criteria.pageSize = 10;

      await repository.search(criteria);

      expect(mockQb.skip).toHaveBeenCalledWith(20);
      expect(mockQb.take).toHaveBeenCalledWith(10);
    });

    it('should map entities to domain models', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[makeEntity()], 1]);

      const result = await repository.search(new SearchCriteria());

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
    });
  });
});
