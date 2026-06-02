import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CommentRepository } from '../src/adapter/comment.repository';
import { CommentEntity } from '../src/entity/comment.entity';
import { CommentLikeEntity } from '../src/entity/comment-like.entity';
import { CommentDBException } from '../src/error/comment/comment-db.exception';
import { ReviewModel, UserModel } from '../src/model';
import { UserEntity } from '../src/entity';
import { ReviewEntity } from '../src/entity/review.entity';

describe('CommentRepository', () => {
  let repository: CommentRepository;

  const mockUser = { id: 1 } as unknown as UserModel;

  const mockReview = {
    id: 10,
    author: mockUser,
    content: 'idk',
    rating: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: null,
    subject: { artist: 'The Beatles' },
  } as ReviewModel;

  const mockComment = {
    id: 100,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdBy: mockUser,
    parentReview: mockReview,
    parentCommentId: null,
    likes: 0,
  };

  const mockUserEntity = { id: 1 } as unknown as UserEntity;

  const mockReviewEntity = {
    id: 10,
    author: mockUserEntity,
    content: 'idk',
    rating: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: null,
    subjectType: 'artist',
    subjectId: 'The Beatles',
  } as ReviewEntity;

  // A persisted entity as returned by TypeORM, with @RelationId columns populated.
  const mockEntity: CommentEntity = {
    id: 100,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdBy: mockUserEntity,
    createdById: 1,
    parentReview: mockReviewEntity,
    parentReviewId: 10,
    parentComment: null,
    parentCommentId: null,
    replies: [],
    likeRows: [],
    likeCount: 0,
  };

  const qbMock = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getOneOrFail: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
  };

  const mockTypeOrmRepo = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => qbMock),
  };

  const likeInsertQb = {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    orIgnore: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({}),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
  };

  const mockLikeRepo = {
    count: jest.fn().mockResolvedValue(0),
    delete: jest.fn().mockResolvedValue(undefined),
    createQueryBuilder: jest.fn(() => likeInsertQb),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentRepository,
        {
          provide: getRepositoryToken(CommentEntity),
          useValue: mockTypeOrmRepo,
        },
        {
          provide: getRepositoryToken(CommentLikeEntity),
          useValue: mockLikeRepo,
        },
      ],
    }).compile();

    repository = module.get(CommentRepository);
  });

  describe('create', () => {
    it('persists the comment and returns the reloaded model with its like count', async () => {
      mockTypeOrmRepo.create.mockReturnValue({ id: undefined });
      mockTypeOrmRepo.save.mockResolvedValue({ id: 100 });
      qbMock.getOneOrFail.mockResolvedValue(mockEntity);

      const result = await repository.create({
        content: 'Test comment',
        createdBy: mockUser,
        parentReview: mockReview,
        parentCommentId: null,
      });

      expect(mockTypeOrmRepo.create).toHaveBeenCalledWith({
        content: 'Test comment',
        createdBy: mockUser,
        parentReview: mockReview,
        parentComment: null,
      });
      expect(qbMock.where).toHaveBeenCalledWith('comment.id = :id', {
        id: 100,
      });
      expect(result).toEqual(mockComment);
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
        createdBy: mockUser,
        parentReview: mockReview,
        parentCommentId: 100,
      });

      expect(mockTypeOrmRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ parentComment: { id: 100 } }),
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
          createdBy: mockUser,
          parentReview: mockReview,
          parentCommentId: null,
        }),
      ).rejects.toThrow(CommentDBException);
    });
  });

  describe('findById', () => {
    it('returns the mapped model when found', async () => {
      qbMock.getOne.mockResolvedValue(mockEntity);
      const result = await repository.findById(100);
      expect(qbMock.where).toHaveBeenCalledWith('comment.id = :id', {
        id: 100,
      });
      expect(result).toEqual(mockComment);
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
        { ...mockEntity, id: 2, parentComment: mockEntity },
      ]);
      const result = await repository.findReplies(100);
      expect(qbMock.where).toHaveBeenCalledWith(
        'comment.parentComment = :parentCommentId',
        { parentCommentId: 100 },
      );
      expect(result).toEqual([{ ...mockComment, id: 2, parentCommentId: 100 }]);
    });
  });

  describe('search', () => {
    it('always restricts to top-level comments and applies provided filters', async () => {
      qbMock.getManyAndCount.mockResolvedValue([[mockEntity], 1]);
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
      expect(result.total).toBe(1);
      expect(result.items).toEqual([mockComment]);
    });

    it('restricts to top-level comments when no filters are provided', async () => {
      qbMock.getManyAndCount.mockResolvedValue([[], 0]);
      await repository.search({});
      expect(qbMock.where).toHaveBeenCalledWith(
        'comment.parentComment IS NULL',
      );
      expect(qbMock.andWhere).not.toHaveBeenCalled();
    });
  });

  describe('hasLike', () => {
    it('returns true when a like row exists', async () => {
      mockLikeRepo.count.mockResolvedValue(1);
      const result = await repository.hasLike(1, 2);
      expect(mockLikeRepo.count).toHaveBeenCalledWith({
        where: { commentId: 1, userId: 2 },
      });
      expect(result).toBe(true);
    });

    it('returns false when no like row exists', async () => {
      mockLikeRepo.count.mockResolvedValue(0);
      const result = await repository.hasLike(1, 2);
      expect(result).toBe(false);
    });
  });

  describe('addLike', () => {
    it('inserts the like row, ignoring duplicates', async () => {
      await repository.addLike(1, 3);
      expect(likeInsertQb.values).toHaveBeenCalledWith({
        commentId: 1,
        userId: 3,
      });
      expect(likeInsertQb.orIgnore).toHaveBeenCalled();
      expect(likeInsertQb.execute).toHaveBeenCalled();
    });
  });

  describe('removeLike', () => {
    it('deletes the like row (idempotent)', async () => {
      await repository.removeLike(1, 2);
      expect(mockLikeRepo.delete).toHaveBeenCalledWith({
        commentId: 1,
        userId: 2,
      });
    });
  });
});
