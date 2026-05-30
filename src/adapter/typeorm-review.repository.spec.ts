import { TypeOrmReviewRepository } from './typeorm-review.repository.js';
import { ReviewEntity } from '@entity/review.entity.js';
import { ReviewModel } from '@model/review.model.js';
import { SubjectReference, SubjectType } from '@model/subject-reference.js';
import type { SearchCriteria } from '@model/search-criteria.js';
import { SortField, SortOrder } from '@model/search-criteria.js';
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
    entity.subjectId = '10';
    entity.authorId = '42';
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
        subjectRef: new SubjectReference(SubjectType.ALBUM, '10'),
        content: 'Great album',
        rating: 5,
        authorId: '42',
      });

    it('should save and return domain model', async () => {
      mockRepo.save.mockResolvedValue(makeEntity());

      const result = await repository.save(createModel());

      expect(result.id).toBe(1);
      expect(result.content).toBe('Great album');
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should rethrow Error without code property', async () => {
      mockRepo.save.mockRejectedValue(new Error('connection lost'));

      await expect(repository.save(createModel())).rejects.toThrow(
        'connection lost',
      );
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

  describe('findRecentByAuthorAndSubject', () => {
    it('should return domain model when a recent review is found', async () => {
      const since = new Date(Date.now() - 60 * 1000);
      mockRepo.findOne.mockResolvedValue(makeEntity());

      const ref = new SubjectReference(SubjectType.ALBUM, '10');
      const result = await repository.findRecentByAuthorAndSubject(
        '42',
        ref,
        since,
      );

      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(mockRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            authorId: '42',
            subjectType: 'album',
            subjectId: '10',
          }),
        }),
      );
    });

    it('should return null when no recent review exists', async () => {
      const since = new Date(Date.now() - 60 * 1000);
      mockRepo.findOne.mockResolvedValue(null);

      const ref = new SubjectReference(SubjectType.TRACK, '1');
      const result = await repository.findRecentByAuthorAndSubject(
        '1',
        ref,
        since,
      );

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should call repo.delete with id', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

      await expect(repository.delete(1)).resolves.toBeUndefined();
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should be idempotent when no row affected', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(repository.delete(999)).resolves.toBeUndefined();
      expect(mockRepo.delete).toHaveBeenCalledWith(999);
    });
  });

  describe('search', () => {
    const baseCriteria: SearchCriteria = {
      page: 1,
      pageSize: 20,
      sortBy: SortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    };

    it('should not apply filters when criteria is empty', async () => {
      await repository.search(baseCriteria);

      expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('review');
      expect(mockQb.andWhere).not.toHaveBeenCalled();
      expect(mockQb.orderBy).toHaveBeenCalledWith('review.createdAt', 'DESC');
      expect(mockQb.skip).toHaveBeenCalledWith(0);
      expect(mockQb.take).toHaveBeenCalledWith(20);
      expect(mockQb.getManyAndCount).toHaveBeenCalledTimes(1);
    });

    it('should apply content filter with ILIKE escaping', async () => {
      await repository.search({
        ...baseCriteria,
        content: '100% off_sale\\test',
      });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.content ILIKE :content',
        { content: '%100\\% off\\_sale\\\\test%' },
      );
    });

    it('should apply authorId filter', async () => {
      await repository.search({ ...baseCriteria, authorId: '42' });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.authorId = :authorId',
        { authorId: '42' },
      );
    });

    it('should apply minRating filter', async () => {
      await repository.search({ ...baseCriteria, minRating: 3 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.rating >= :minRating',
        { minRating: 3 },
      );
    });

    it('should apply maxRating filter', async () => {
      await repository.search({ ...baseCriteria, maxRating: 4 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.rating <= :maxRating',
        { maxRating: 4 },
      );
    });

    it('should apply dateFrom filter', async () => {
      const date = new Date('2025-01-01');
      await repository.search({ ...baseCriteria, dateFrom: date });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.createdAt >= :dateFrom',
        { dateFrom: date },
      );
    });

    it('should apply dateTo filter', async () => {
      const date = new Date('2025-06-01');
      await repository.search({ ...baseCriteria, dateTo: date });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.createdAt <= :dateTo',
        { dateTo: date },
      );
    });

    it('should apply subjectType filter', async () => {
      await repository.search({
        ...baseCriteria,
        subjectType: SubjectType.ALBUM,
      });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.subjectType = :subjectType',
        { subjectType: 'album' },
      );
    });

    it('should apply subjectId filter', async () => {
      await repository.search({
        ...baseCriteria,
        subjectType: SubjectType.ALBUM,
        subjectId: '10',
      });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.subjectType = :subjectType',
        { subjectType: 'album' },
      );
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.subjectId = :subjectId',
        { subjectId: '10' },
      );
    });

    it('should sort by rating ASC', async () => {
      await repository.search({
        ...baseCriteria,
        sortBy: SortField.RATING,
        sortOrder: SortOrder.ASC,
      });

      expect(mockQb.orderBy).toHaveBeenCalledWith('review.rating', 'ASC');
    });

    it('should sort by createdAt DESC by default', async () => {
      await repository.search(baseCriteria);

      expect(mockQb.orderBy).toHaveBeenCalledWith('review.createdAt', 'DESC');
    });

    it('should apply pagination', async () => {
      await repository.search({ ...baseCriteria, page: 3, pageSize: 10 });

      expect(mockQb.skip).toHaveBeenCalledWith(20);
      expect(mockQb.take).toHaveBeenCalledWith(10);
    });

    it('should map entities to domain models', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[makeEntity()], 1]);

      const result = await repository.search(baseCriteria);

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
    });
  });
});
