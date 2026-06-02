import { ReviewRepository } from '../src/adapter/review.repository';
import { ReviewEntity } from '../src/entity/review.entity';
import { ReviewRepositoryException } from '../src/error/review/review-repository.exception';
import { QueryFailedError } from 'typeorm';
import { SubjectType } from '../src/model/review-subject';
import type { ReviewFilters } from '../src/model/review.filter';
import { SortField, SortOrder } from '../src/model/review.filter';
import type { Repository } from 'typeorm';
import { UserEntity } from '../src/entity';

describe('ReviewRepository', () => {
  let repository: ReviewRepository;
  let mockRepo: jest.Mocked<
    Pick<
      Repository<ReviewEntity>,
      'create' | 'save' | 'findOne' | 'delete' | 'createQueryBuilder'
    >
  >;
  let mockQb: Record<string, jest.Mock>;
  const mockUser = { id: 1 } as unknown as UserEntity;

  function makeEntity(overrides?: Partial<ReviewEntity>): ReviewEntity {
    const entity = new ReviewEntity();
    entity.id = 1;
    entity.content = 'Great album';
    entity.rating = 5;
    entity.subjectType = 'album';
    entity.subjectId = '10';
    entity.author = mockUser;
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
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
    };

    repository = new ReviewRepository(
      mockRepo as unknown as Repository<ReviewEntity>,
    );
  });

  describe('create', () => {
    const newReview = () => ({
      subject: { album: '10' } as const,
      content: 'Great album',
      rating: 5,
      author: { id: 1 },
    });

    it('should persist and return the domain model', async () => {
      mockRepo.save.mockResolvedValue(makeEntity());

      const result = await repository.create(newReview());

      expect(result.id).toBe(1);
      expect(result.content).toBe('Great album');
      expect(result.subject).toEqual({ album: '10' });
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should rethrow a non-infrastructure Error untouched', async () => {
      mockRepo.save.mockRejectedValue(new Error('connection lost'));

      await expect(repository.create(newReview())).rejects.toThrow(
        'connection lost',
      );
    });

    it('should translate a TypeORM error into ReviewRepositoryException', async () => {
      mockRepo.save.mockRejectedValue(
        new QueryFailedError('insert', [], {
          code: '23505',
        } as unknown as Error),
      );

      await expect(repository.create(newReview())).rejects.toThrow(
        ReviewRepositoryException,
      );
    });
  });

  describe('findById', () => {
    it('should return domain model when found', async () => {
      mockRepo.findOne.mockResolvedValue(makeEntity());

      const result = await repository.findById(1);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { author: true },
      });
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

      const result = await repository.findRecentByAuthorAndSubject(
        mockUser,
        { album: '10' },
        since,
      );

      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(mockRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            author: mockUser,
            subjectType: 'album',
            subjectId: '10',
          }),
        }),
      );
    });

    it('should return null when no recent review exists', async () => {
      const since = new Date(Date.now() - 60 * 1000);
      mockRepo.findOne.mockResolvedValue(null);

      const result = await repository.findRecentByAuthorAndSubject(
        mockUser,
        { track: '1' },
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
    const baseFilters: ReviewFilters = {
      page: 1,
      pageSize: 20,
      sortBy: SortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    };

    it('should not apply filters when none are set', async () => {
      await repository.search(baseFilters);

      expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('review');
      expect(mockQb.andWhere).not.toHaveBeenCalled();
      expect(mockQb.orderBy).toHaveBeenCalledWith('review.createdAt', 'DESC');
      expect(mockQb.skip).toHaveBeenCalledWith(0);
      expect(mockQb.take).toHaveBeenCalledWith(20);
      expect(mockQb.getManyAndCount).toHaveBeenCalledTimes(1);
    });

    it('should apply content filter with ILIKE escaping', async () => {
      await repository.search({
        ...baseFilters,
        content: '100% off_sale\\test',
      });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.content ILIKE :content',
        { content: '%100\\% off\\_sale\\\\test%' },
      );
    });

    it('should apply authorId filter', async () => {
      await repository.search({ ...baseFilters, authorId: 42 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.author.id = :authorId',
        { authorId: 42 },
      );
    });

    it('should apply minRating filter', async () => {
      await repository.search({ ...baseFilters, minRating: 3 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.rating >= :minRating',
        { minRating: 3 },
      );
    });

    it('should apply maxRating filter', async () => {
      await repository.search({ ...baseFilters, maxRating: 4 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.rating <= :maxRating',
        { maxRating: 4 },
      );
    });

    it('should apply dateFrom filter', async () => {
      const date = new Date('2025-01-01');
      await repository.search({ ...baseFilters, dateFrom: date });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.createdAt >= :dateFrom',
        { dateFrom: date },
      );
    });

    it('should apply dateTo filter', async () => {
      const date = new Date('2025-06-01');
      await repository.search({ ...baseFilters, dateTo: date });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.createdAt <= :dateTo',
        { dateTo: date },
      );
    });

    it('should apply subjectType filter', async () => {
      await repository.search({
        ...baseFilters,
        subjectType: SubjectType.ALBUM,
      });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'review.subjectType = :subjectType',
        { subjectType: 'album' },
      );
    });

    it('should apply subjectId filter', async () => {
      await repository.search({
        ...baseFilters,
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
        ...baseFilters,
        sortBy: SortField.RATING,
        sortOrder: SortOrder.ASC,
      });

      expect(mockQb.orderBy).toHaveBeenCalledWith('review.rating', 'ASC');
    });

    it('should sort by createdAt DESC by default', async () => {
      await repository.search(baseFilters);

      expect(mockQb.orderBy).toHaveBeenCalledWith('review.createdAt', 'DESC');
    });

    it('should apply pagination', async () => {
      await repository.search({ ...baseFilters, page: 3, pageSize: 10 });

      expect(mockQb.skip).toHaveBeenCalledWith(20);
      expect(mockQb.take).toHaveBeenCalledWith(10);
    });

    it('defaults to page 1 when page is 0', async () => {
      await repository.search({ ...baseFilters, page: 0 });

      expect(mockQb.skip).toHaveBeenCalledWith(0);
    });

    it('defaults to pageSize 20 when pageSize is 0', async () => {
      await repository.search({ ...baseFilters, pageSize: 0 });

      expect(mockQb.take).toHaveBeenCalledWith(20);
    });

    it('should map entities to domain models', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[makeEntity()], 1]);

      const result = await repository.search(baseFilters);

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(1);
    });
  });
});
