import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../src/use-case/comment.service';
import { COMMENT_REPOSITORY } from '../src/repository/i-comment.repository';
import { CommentModel } from '../src/model/comment.model';
import { CommentNotFoundException } from '../src/error/comment/comment-not-found.exception';
import { ReviewModel, UserModel } from '../src/model';
import { SubjectReference } from '../src/model/subject-reference';

describe('CommentService', () => {
  let service: CommentService;

  const mockUser = { id: 1 } as unknown as UserModel;

  const mockReview = {
    id: 10,
    author: mockUser,
    content: 'idk',
    rating: 1,
    createdAt: new Date('2024-01-01'),
    subjectRef: new SubjectReference('artist', 'The Beatles'),
  } as ReviewModel;

  const mockComment: CommentModel = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdBy: mockUser,
    parentReview: mockReview,
    parentCommentId: null,
  };

  const mockRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    findReplies: jest.fn(),
    findLikesByCommentId: jest.fn(),
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
        createdBy: { id: 1 },
        parentReview: { id: 10 },
        parentCommentId: null,
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

  describe('getReplies', () => {
    it('returns replies when the parent comment exists', async () => {
      const reply = { ...mockComment, id: 2, parentCommentId: 1 };
      mockRepo.findById.mockResolvedValue(mockComment);
      mockRepo.findReplies.mockResolvedValue([reply]);
      const result = await service.getReplies(1);
      expect(mockRepo.findReplies).toHaveBeenCalledWith(1);
      expect(result).toEqual([reply]);
    });

    it('throws CommentNotFoundException when the parent comment does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getReplies(99)).rejects.toThrow(
        CommentNotFoundException,
      );
      expect(mockRepo.findReplies).not.toHaveBeenCalled();
    });
  });

  describe('getLikes', () => {
    it('returns the likedBy ids when comment exists', async () => {
      mockRepo.findLikesByCommentId.mockResolvedValue([2, 3]);
      const result = await service.getLikes(1);
      expect(mockRepo.findLikesByCommentId).toHaveBeenCalledWith(1);
      expect(result).toEqual([2, 3]);
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
      const filters = { createdById: 1 };
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

  describe('setLike', () => {
    it('calls addLike when liked is true and comment exists', async () => {
      mockRepo.findById.mockResolvedValue(mockComment);
      mockRepo.addLike.mockResolvedValue(undefined);
      await service.setLike(1, 3, true);
      expect(mockRepo.addLike).toHaveBeenCalledWith(1, 3);
      expect(mockRepo.removeLike).not.toHaveBeenCalled();
    });

    it('calls removeLike when liked is false and comment exists', async () => {
      mockRepo.findById.mockResolvedValue(mockComment);
      mockRepo.removeLike.mockResolvedValue(undefined);
      await service.setLike(1, 2, false);
      expect(mockRepo.removeLike).toHaveBeenCalledWith(1, 2);
      expect(mockRepo.addLike).not.toHaveBeenCalled();
    });

    it('throws CommentNotFoundException when comment not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.setLike(99, 3, true)).rejects.toThrow(
        CommentNotFoundException,
      );
      expect(mockRepo.addLike).not.toHaveBeenCalled();
    });
  });
});
