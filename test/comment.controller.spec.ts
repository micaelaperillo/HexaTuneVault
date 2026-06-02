import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CommentController } from '../src/controller/comment.controller';
import {
  CREATE_COMMENT,
  DELETE_COMMENT,
  SEARCH_COMMENT,
  GET_COMMENT,
  GET_COMMENT_REPLIES,
  HAS_LIKED_COMMENT,
  LIKE_COMMENT,
} from '../src/port/comment';
import { CommentModel } from '../src/model/comment.model';
import { CommentResponseDto } from '../src/dto/comment-response.dto';
import { CreateCommentDto } from '../src/dto/create-comment.dto';
import { SetCommentLikeDto } from '../src/dto/set-comment-like.dto';
import { SubjectReference } from '../src/model/subject-reference';
import { ReviewModel, UserModel } from '../src/model';

describe('CommentController', () => {
  let controller: CommentController;

  const mockUser: UserModel = {
    id: 1,
    username: 'a',
    password: 'b',
    firstName: 'A',
    lastName: 'B',
    email: 'a@b.c',
    biography: 'abc',
    profilePictureUrl: 'a.b',
  };

  const mockComment: CommentModel = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdBy: mockUser,
    parentReview: ReviewModel.reconstitute({
      id: 10,
      author: mockUser,
      content: 'idk',
      rating: 1,
      subjectRef: new SubjectReference('artist', 'The Beatles'),
      createdAt: new Date(),
      updatedAt: null,
    }),
    parentCommentId: null,
    likes: 0,
  };

  const mockCreate = { create: jest.fn() };
  const mockDelete = { deleteById: jest.fn() };
  const mockSearch = { search: jest.fn() };
  const mockGet = { get: jest.fn() };
  const mockGetReplies = { getReplies: jest.fn() };
  const mockHasLiked = { hasLiked: jest.fn() };
  const mockLike = { setLike: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        { provide: CREATE_COMMENT, useValue: mockCreate },
        { provide: DELETE_COMMENT, useValue: mockDelete },
        { provide: SEARCH_COMMENT, useValue: mockSearch },
        { provide: GET_COMMENT, useValue: mockGet },
        { provide: GET_COMMENT_REPLIES, useValue: mockGetReplies },
        { provide: HAS_LIKED_COMMENT, useValue: mockHasLiked },
        { provide: LIKE_COMMENT, useValue: mockLike },
      ],
    }).compile();

    controller = module.get(CommentController);
  });

  describe('create', () => {
    it('calls create port and returns a CommentResponseDto with correct links', async () => {
      mockCreate.create.mockResolvedValue(mockComment);
      const dto: CreateCommentDto = {
        content: 'Test comment',
        createdById: 1,
        parentReviewId: 10,
      };

      const result = await controller.create(dto);

      expect(mockCreate.create).toHaveBeenCalledWith({
        content: 'Test comment',
        createdBy: { id: 1 },
        parentReview: { id: 10 },
        parentCommentId: null,
      });
      expect(result).toBeInstanceOf(CommentResponseDto);
      expect(result.self).toBe('/api/comments/1');
      expect(result.review).toBe('/api/reviews/10');
    });

    it('forwards parentCommentId for nested replies', async () => {
      mockCreate.create.mockResolvedValue({
        ...mockComment,
        parentCommentId: 5,
      });
      const dto: CreateCommentDto = {
        content: 'A reply',
        createdById: 1,
        parentReviewId: 10,
        parentCommentId: 5,
      };

      const result = await controller.create(dto);

      expect(mockCreate.create).toHaveBeenCalledWith({
        content: 'A reply',
        createdBy: { id: 1 },
        parentReview: { id: 10 },
        parentCommentId: 5,
      });
      expect(result.parent).toBe('/api/comments/5');
    });
  });

  describe('search', () => {
    it('maps reviewId to the parentReviewId filter and returns CommentResponseDtos', async () => {
      mockSearch.search.mockResolvedValue([mockComment]);
      const result = await controller.search({
        createdById: 1,
        reviewId: 10,
      });

      expect(mockSearch.search).toHaveBeenCalledWith({
        createdById: 1,
        content: undefined,
        parentReviewId: 10,
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(CommentResponseDto);
    });
  });

  describe('get', () => {
    it('calls get port and returns a CommentResponseDto with correct links', async () => {
      mockGet.get.mockResolvedValue({ ...mockComment, likes: 3 });
      const result = await controller.get(1);

      expect(mockGet.get).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(CommentResponseDto);
      expect(result.self).toBe('/api/comments/1');
      expect(result.like).toBe('/api/comments/1/like');
      expect(result.likes).toBe(3);
    });
  });

  describe('getReplies', () => {
    it('calls getReplies port and returns an array of CommentResponseDto', async () => {
      const reply = { ...mockComment, id: 2, parentCommentId: 1 };
      mockGetReplies.getReplies.mockResolvedValue([reply]);
      const result = await controller.getReplies(1);

      expect(mockGetReplies.getReplies).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(CommentResponseDto);
      expect(result[0].self).toBe('/api/comments/2');
      expect(result[0].parent).toBe('/api/comments/1');
    });
  });

  describe('hasLiked', () => {
    it('resolves (204) when the user has liked the comment', async () => {
      mockHasLiked.hasLiked.mockResolvedValue(true);

      await expect(
        controller.hasLiked(1, { user_id: 2 }),
      ).resolves.toBeUndefined();
      expect(mockHasLiked.hasLiked).toHaveBeenCalledWith(1, 2);
    });

    it('throws NotFoundException (404) when the user has not liked the comment', async () => {
      mockHasLiked.hasLiked.mockResolvedValue(false);

      await expect(controller.hasLiked(1, { user_id: 2 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('calls deleteById port', async () => {
      mockDelete.deleteById.mockResolvedValue(undefined);
      await controller.delete(1);
      expect(mockDelete.deleteById).toHaveBeenCalledWith(1);
    });
  });

  describe('setLike', () => {
    it('calls setLike port with comment id, user id and liked flag', async () => {
      mockLike.setLike.mockResolvedValue(undefined);
      const dto: SetCommentLikeDto = { user_id: 2, liked: true };
      await controller.setLike(1, dto);
      expect(mockLike.setLike).toHaveBeenCalledWith(1, 2, true);
    });

    it('passes liked=false to unlike', async () => {
      mockLike.setLike.mockResolvedValue(undefined);
      const dto: SetCommentLikeDto = { user_id: 2, liked: false };
      await controller.setLike(1, dto);
      expect(mockLike.setLike).toHaveBeenCalledWith(1, 2, false);
    });
  });
});
