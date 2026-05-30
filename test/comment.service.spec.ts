import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../src/use-case/comment.service';
import { COMMENT_REPOSITORY } from '../src/repository/i-comment.repository';
import { CommentModel } from '../src/model/comment.model';
import { AssociatedType } from '../src/model/comment.associated.type';
import { CommentNotFoundException } from '../src/error/comment/comment-not-found.exception';
import { AlreadyLikedException } from '../src/error/comment/already-liked.exception';
import { NotLikedException } from '../src/error/comment/not-liked.exception';

describe('CommentService', () => {
  let service: CommentService;

  const mockComment: CommentModel = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdBy: 'user1',
    associatedTo: 'track1',
    associatedType: AssociatedType.TRACK,
    likedBy: ['user2'],
  };

  const mockRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    findLikesByCommentId: jest.fn(),
    findByAssociatedId: jest.fn(),
    search: jest.fn(),
    deleteById: jest.fn(),
    addLike: jest.fn(),
    removeLike: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: COMMENT_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    service = module.get(CommentService);
  });

  describe('create', () => {
    it('delegates to repo and returns the created comment', async () => {
      mockRepo.create.mockResolvedValue(mockComment);
      const input = {
        content: 'Test comment',
        createdBy: 'user1',
        associatedTo: 'track1',
        associatedType: AssociatedType.TRACK,
      };
      const result = await service.create(input);
      expect(mockRepo.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockComment);
    });
  });

  describe('get', () => {
    it('returns the comment when found', async () => {
      mockRepo.findById.mockResolvedValue(mockComment);
      const result = await service.get(1);
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockComment);
    });

    it('throws CommentNotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.get(99)).rejects.toThrow(CommentNotFoundException);
    });
  });

  describe('getLikes', () => {
    it('returns the likedBy array when comment exists', async () => {
      mockRepo.findLikesByCommentId.mockResolvedValue(['user2', 'user3']);
      const result = await service.getLikes(1);
      expect(mockRepo.findLikesByCommentId).toHaveBeenCalledWith(1);
      expect(result).toEqual(['user2', 'user3']);
    });

    it('throws CommentNotFoundException when comment does not exist', async () => {
      mockRepo.findLikesByCommentId.mockResolvedValue(null);
      await expect(service.getLikes(99)).rejects.toThrow(
        CommentNotFoundException,
      );
    });
  });

  describe('search', () => {
    it('delegates to repo and returns results', async () => {
      mockRepo.search.mockResolvedValue([mockComment]);
      const filters = { createdBy: 'user1' };
      const result = await service.search(filters);
      expect(mockRepo.search).toHaveBeenCalledWith(filters);
      expect(result).toEqual([mockComment]);
    });
  });

  describe('deleteById', () => {
    it('delegates to repo', async () => {
      mockRepo.deleteById.mockResolvedValue(undefined);
      await service.deleteById(1);
      expect(mockRepo.deleteById).toHaveBeenCalledWith(1);
    });
  });

  describe('like', () => {
    it('calls addLike when comment exists and user has not liked yet', async () => {
      mockRepo.findById.mockResolvedValue({ ...mockComment, likedBy: [] });
      mockRepo.addLike.mockResolvedValue(undefined);
      await service.like(1, 'user3');
      expect(mockRepo.addLike).toHaveBeenCalledWith(1, 'user3');
    });

    it('throws CommentNotFoundException when comment not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.like(99, 'user3')).rejects.toThrow(
        CommentNotFoundException,
      );
    });

    it('throws AlreadyLikedException when user already liked the comment', async () => {
      mockRepo.findById.mockResolvedValue({
        ...mockComment,
        likedBy: ['user2'],
      });
      await expect(service.like(1, 'user2')).rejects.toThrow(
        AlreadyLikedException,
      );
    });
  });

  describe('unlike', () => {
    it('calls removeLike when comment exists and user has liked it', async () => {
      mockRepo.findById.mockResolvedValue({
        ...mockComment,
        likedBy: ['user2'],
      });
      mockRepo.removeLike.mockResolvedValue(undefined);
      await service.unlike(1, 'user2');
      expect(mockRepo.removeLike).toHaveBeenCalledWith(1, 'user2');
    });

    it('throws CommentNotFoundException when comment not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.unlike(99, 'user3')).rejects.toThrow(
        CommentNotFoundException,
      );
    });

    it('throws NotLikedException when user has not liked the comment', async () => {
      mockRepo.findById.mockResolvedValue({ ...mockComment, likedBy: [] });
      await expect(service.unlike(1, 'user3')).rejects.toThrow(
        NotLikedException,
      );
    });
  });
});
