import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, QueryFailedError } from 'typeorm';
import { CommentRepository } from '../src/adapter/comment.repository';
import { CommentEntity } from '../src/entity/comment.entity';
import { CommentDBException } from '../src/error/comment/comment-db.exception';

describe('CommentRepository', () => {
  let repository: CommentRepository;

  // A persisted entity as returned by TypeORM, with @RelationId columns populated.
  const mockEntity = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdById: 1,
    parentReviewId: 10,
    parentCommentId: null,
  };

  // The domain model that mockEntity maps to.
  const mockModel = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdById: 1,
    parentReviewId: 10,
    parentCommentId: null,
  };

  const relationMock = {
    of: jest.fn().mockReturnThis(),
    add: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    loadMany: jest.fn().mockResolvedValue([]),
  };

  const qbMock = {
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    relation: jest.fn().mockReturnValue(relationMock),
  };

  const mockTypeOrmRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    findOneByOrFail: jest.fn(),
    findBy: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => qbMock),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    qbMock.getCount.mockResolvedValue(0);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentRepository,
        {
          provide: getRepositoryToken(CommentEntity),
          useValue: mockTypeOrmRepo,
        },
      ],
    }).compile();

    repository = module.get(CommentRepository);
  });

  describe('create', () => {
    it('persists the comment and returns the reloaded model', async () => {
      mockTypeOrmRepo.create.mockReturnValue({ id: undefined });
      mockTypeOrmRepo.save.mockResolvedValue({ id: 1 });
      mockTypeOrmRepo.findOneByOrFail.mockResolvedValue(mockEntity);

      const result = await repository.create({
        content: 'Test comment',
        createdById: 1,
        parentReviewId: 10,
        parentCommentId: null,
      });

      expect(mockTypeOrmRepo.create).toHaveBeenCalledWith({
        content: 'Test comment',
        createdBy: { id: 1 },
        parentReview: { id: 10 },
        parentComment: null,
      });
      expect(mockTypeOrmRepo.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockModel);
    });

    it('maps a parentCommentId to a parentComment relation', async () => {
      mockTypeOrmRepo.create.mockReturnValue({});
      mockTypeOrmRepo.save.mockResolvedValue({ id: 2 });
      mockTypeOrmRepo.findOneByOrFail.mockResolvedValue({
        ...mockEntity,
        id: 2,
        parentCommentId: 1,
      });

      await repository.create({
        content: 'reply',
        createdById: 1,
        parentReviewId: 10,
        parentCommentId: 1,
      });

      expect(mockTypeOrmRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ parentComment: { id: 1 } }),
      );
    });

    it('throws CommentDBException on database error', async () => {
      mockTypeOrmRepo.create.mockReturnValue({});
      mockTypeOrmRepo.save.mockRejectedValue(
        new QueryFailedError('INSERT', [], new Error('DB error')),
      );
      await expect(
        repository.create({
          content: 'x',
          createdById: 1,
          parentReviewId: 10,
          parentCommentId: null,
        }),
      ).rejects.toThrow(CommentDBException);
    });
  });

  describe('findById', () => {
    it('returns the mapped model when found', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(mockEntity);
      const result = await repository.findById(1);
      expect(mockTypeOrmRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockModel);
    });

    it('returns null when not found', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(null);
      const result = await repository.findById(99);
      expect(result).toBeNull();
    });
  });

  describe('findLikesByCommentId', () => {
    it('returns the liked user ids when comment exists', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(mockEntity);
      relationMock.loadMany.mockResolvedValue([{ id: 2 }, { id: 3 }]);
      const result = await repository.findLikesByCommentId(1);
      expect(qbMock.relation).toHaveBeenCalledWith(CommentEntity, 'likedBy');
      expect(relationMock.of).toHaveBeenCalledWith(1);
      expect(result).toEqual([2, 3]);
    });

    it('returns null when comment not found', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(null);
      const result = await repository.findLikesByCommentId(99);
      expect(result).toBeNull();
      expect(relationMock.loadMany).not.toHaveBeenCalled();
    });
  });

  describe('deleteById', () => {
    it('deletes the comment by id', async () => {
      mockTypeOrmRepo.delete.mockResolvedValue(undefined);
      await repository.deleteById(1);
      expect(mockTypeOrmRepo.delete).toHaveBeenCalledWith(1);
    });

    it('throws CommentDBException on database error', async () => {
      mockTypeOrmRepo.delete.mockRejectedValue(
        new QueryFailedError('DELETE', [], new Error('DB error')),
      );
      await expect(repository.deleteById(1)).rejects.toThrow(
        CommentDBException,
      );
    });
  });

  describe('findReplies', () => {
    it('returns child comments of the given parent', async () => {
      mockTypeOrmRepo.findBy.mockResolvedValue([
        { ...mockEntity, id: 2, parentCommentId: 1 },
      ]);
      const result = await repository.findReplies(1);
      expect(mockTypeOrmRepo.findBy).toHaveBeenCalledWith({
        parentComment: { id: 1 },
      });
      expect(result).toEqual([{ ...mockModel, id: 2, parentCommentId: 1 }]);
    });
  });

  describe('search', () => {
    it('always restricts to top-level comments and applies provided filters', async () => {
      mockTypeOrmRepo.findBy.mockResolvedValue([mockEntity]);
      const result = await repository.search({
        createdById: 1,
        content: 'test',
        parentReviewId: 10,
      });
      expect(mockTypeOrmRepo.findBy).toHaveBeenCalledWith(
        expect.objectContaining({
          parentComment: IsNull(),
          createdBy: { id: 1 },
          parentReview: { id: 10 },
        }),
      );
      expect(result).toEqual([mockModel]);
    });

    it('restricts to top-level comments when no filters are provided', async () => {
      mockTypeOrmRepo.findBy.mockResolvedValue([]);
      await repository.search({});
      expect(mockTypeOrmRepo.findBy).toHaveBeenCalledWith({
        parentComment: IsNull(),
      });
    });
  });

  describe('addLike', () => {
    it('adds the user to likedBy when not already liked', async () => {
      qbMock.getCount.mockResolvedValue(0);
      await repository.addLike(1, 3);
      expect(qbMock.relation).toHaveBeenCalledWith(CommentEntity, 'likedBy');
      expect(relationMock.of).toHaveBeenCalledWith(1);
      expect(relationMock.add).toHaveBeenCalledWith(3);
    });

    it('does nothing when the user already liked the comment', async () => {
      qbMock.getCount.mockResolvedValue(1);
      await repository.addLike(1, 2);
      expect(relationMock.add).not.toHaveBeenCalled();
    });
  });

  describe('removeLike', () => {
    it('removes the user from likedBy', async () => {
      await repository.removeLike(1, 2);
      expect(qbMock.relation).toHaveBeenCalledWith(CommentEntity, 'likedBy');
      expect(relationMock.of).toHaveBeenCalledWith(1);
      expect(relationMock.remove).toHaveBeenCalledWith(2);
    });
  });
});
