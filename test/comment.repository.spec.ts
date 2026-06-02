import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CommentRepository } from '../src/adapter/comment.repository';
import { CommentEntity } from '../src/entity/comment.entity';
import { CommentDBException } from '../src/error/comment/comment-db.exception';

describe('CommentRepository', () => {
  let repository: CommentRepository;

  // A persisted entity as returned by TypeORM, with @RelationId columns and the
  // mapped liker ids populated (length is the like count).
  const mockEntity = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdById: 1,
    parentReviewId: 10,
    parentCommentId: null,
    likedByIds: [5, 6],
  };

  // The domain model that mockEntity maps to.
  const mockModel = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdById: 1,
    parentReviewId: 10,
    parentCommentId: null,
    likes: 2,
  };

  const relationMock = {
    of: jest.fn().mockReturnThis(),
    add: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const qbMock = {
    loadRelationIdAndMap: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    getOne: jest.fn(),
    getOneOrFail: jest.fn(),
    getMany: jest.fn(),
    relation: jest.fn().mockReturnValue(relationMock),
  };

  const mockTypeOrmRepo = {
    create: jest.fn(),
    save: jest.fn(),
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
    it('persists the comment and returns the reloaded model with its like count', async () => {
      mockTypeOrmRepo.create.mockReturnValue({ id: undefined });
      mockTypeOrmRepo.save.mockResolvedValue({ id: 1 });
      qbMock.getOneOrFail.mockResolvedValue(mockEntity);

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
      expect(qbMock.where).toHaveBeenCalledWith('comment.id = :id', { id: 1 });
      expect(result).toEqual(mockModel);
    });

    it('maps a parentCommentId to a parentComment relation', async () => {
      mockTypeOrmRepo.create.mockReturnValue({});
      mockTypeOrmRepo.save.mockResolvedValue({ id: 2 });
      qbMock.getOneOrFail.mockResolvedValue({
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
      qbMock.getOne.mockResolvedValue(mockEntity);
      const result = await repository.findById(1);
      expect(qbMock.where).toHaveBeenCalledWith('comment.id = :id', { id: 1 });
      expect(qbMock.loadRelationIdAndMap).toHaveBeenCalledWith(
        'comment.likedByIds',
        'comment.likedBy',
      );
      expect(result).toEqual(mockModel);
    });

    it('returns null when not found', async () => {
      qbMock.getOne.mockResolvedValue(null);
      const result = await repository.findById(99);
      expect(result).toBeNull();
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
      qbMock.getMany.mockResolvedValue([
        { ...mockEntity, id: 2, parentCommentId: 1 },
      ]);
      const result = await repository.findReplies(1);
      expect(qbMock.where).toHaveBeenCalledWith(
        'comment.parentComment = :parentCommentId',
        { parentCommentId: 1 },
      );
      expect(result).toEqual([{ ...mockModel, id: 2, parentCommentId: 1 }]);
    });
  });

  describe('search', () => {
    it('always restricts to top-level comments and applies provided filters', async () => {
      qbMock.getMany.mockResolvedValue([mockEntity]);
      const result = await repository.search({
        createdById: 1,
        content: 'test',
        parentReviewId: 10,
      });
      expect(qbMock.where).toHaveBeenCalledWith(
        'comment.parentComment IS NULL',
      );
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        'comment.createdBy = :createdById',
        { createdById: 1 },
      );
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        'comment.content ILIKE :content',
        { content: '%test%' },
      );
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        'comment.parentReview = :parentReviewId',
        { parentReviewId: 10 },
      );
      expect(result).toEqual([mockModel]);
    });

    it('restricts to top-level comments when no filters are provided', async () => {
      qbMock.getMany.mockResolvedValue([]);
      await repository.search({});
      expect(qbMock.where).toHaveBeenCalledWith(
        'comment.parentComment IS NULL',
      );
      expect(qbMock.andWhere).not.toHaveBeenCalled();
    });
  });

  describe('hasLike', () => {
    it('returns true when the user has liked the comment', async () => {
      qbMock.getCount.mockResolvedValue(1);
      const result = await repository.hasLike(1, 2);
      expect(qbMock.innerJoin).toHaveBeenCalledWith(
        'comment.likedBy',
        'user',
        'user.id = :userId',
        { userId: 2 },
      );
      expect(result).toBe(true);
    });

    it('returns false when the user has not liked the comment', async () => {
      qbMock.getCount.mockResolvedValue(0);
      const result = await repository.hasLike(1, 2);
      expect(result).toBe(false);
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
