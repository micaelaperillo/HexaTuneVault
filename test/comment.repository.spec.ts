import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CommentRepository } from '../src/adapter/comment.repository';
import { CommentEntity } from '../src/entity/comment.entity';
import { CommentDBException } from '../src/error/comment/comment-db.exception';
import { AssociatedType } from '../src/model/comment.associated.type';

describe('CommentRepository', () => {
  let repository: CommentRepository;

  const mockTypeOrmRepo = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    delete: jest.fn(),
  };

  const mockComment = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdBy: 'user1',
    associatedTo: 'track1',
    associatedType: AssociatedType.TRACK,
    likedBy: ['user2'],
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
      ],
    }).compile();

    repository = module.get(CommentRepository);
  });

  describe('create', () => {
    it('saves and returns the comment', async () => {
      mockTypeOrmRepo.save.mockResolvedValue(mockComment);
      const input = {
        content: 'Test comment',
        createdBy: 'user1',
        associatedTo: 'track1',
        associatedType: AssociatedType.TRACK,
      };
      const result = await repository.create(input);
      expect(mockTypeOrmRepo.save).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockComment);
    });

    it('throws CommentDBException on database error', async () => {
      mockTypeOrmRepo.save.mockRejectedValue(
        new QueryFailedError('INSERT', [], new Error('DB error')),
      );
      await expect(
        repository.create({
          content: 'x',
          createdBy: 'u',
          associatedTo: 'a',
          associatedType: AssociatedType.TRACK,
        }),
      ).rejects.toThrow(CommentDBException);
    });
  });

  describe('findById', () => {
    it('returns the comment when found', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(mockComment);
      const result = await repository.findById(1);
      expect(mockTypeOrmRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockComment);
    });

    it('returns null when not found', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(null);
      const result = await repository.findById(99);
      expect(result).toBeNull();
    });
  });

  describe('findLikesByCommentId', () => {
    it('returns the likedBy array when comment exists', async () => {
      mockTypeOrmRepo.findOne.mockResolvedValue(mockComment);
      const result = await repository.findLikesByCommentId(1);
      expect(result).toEqual(['user2']);
    });

    it('returns null when comment not found', async () => {
      mockTypeOrmRepo.findOne.mockResolvedValue(null);
      const result = await repository.findLikesByCommentId(99);
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

  describe('findByAssociatedId', () => {
    it('returns comments matching the associated id and type', async () => {
      mockTypeOrmRepo.findBy.mockResolvedValue([mockComment]);
      const result = await repository.findByAssociatedId(
        'track1',
        AssociatedType.TRACK,
      );
      expect(mockTypeOrmRepo.findBy).toHaveBeenCalledWith({
        associatedTo: 'track1',
        associatedType: AssociatedType.TRACK,
      });
      expect(result).toEqual([mockComment]);
    });
  });

  describe('search', () => {
    it('applies all provided filters', async () => {
      mockTypeOrmRepo.findBy.mockResolvedValue([mockComment]);
      const result = await repository.search({
        createdBy: 'user1',
        content: 'test',
        associatedType: AssociatedType.TRACK,
      });
      expect(result).toEqual([mockComment]);
    });

    it('applies no filters when none are provided', async () => {
      mockTypeOrmRepo.findBy.mockResolvedValue([]);
      await repository.search({});
      expect(mockTypeOrmRepo.findBy).toHaveBeenCalledWith({});
    });
  });

  describe('addLike', () => {
    it('appends userId to likedBy and saves', async () => {
      const comment = { ...mockComment, likedBy: [] };
      mockTypeOrmRepo.findOneBy.mockResolvedValue(comment);
      mockTypeOrmRepo.save.mockResolvedValue(undefined);
      await repository.addLike(1, 'user3');
      expect(mockTypeOrmRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ likedBy: ['user3'] }),
      );
    });

    it('does nothing when comment not found', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(null);
      await repository.addLike(99, 'user3');
      expect(mockTypeOrmRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('removeLike', () => {
    it('removes userId from likedBy and saves', async () => {
      const comment = { ...mockComment, likedBy: ['user2', 'user3'] };
      mockTypeOrmRepo.findOneBy.mockResolvedValue(comment);
      mockTypeOrmRepo.save.mockResolvedValue(undefined);
      await repository.removeLike(1, 'user2');
      expect(mockTypeOrmRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ likedBy: ['user3'] }),
      );
    });

    it('does nothing when comment not found', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(null);
      await repository.removeLike(99, 'user2');
      expect(mockTypeOrmRepo.save).not.toHaveBeenCalled();
    });
  });
});
