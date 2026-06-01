import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from '../src/controller/comment.controller';
import {
  CREATE_COMMENT,
  DELETE_COMMENT,
  SEARCH_COMMENT,
  GET_COMMENT,
  GET_COMMENT_REPLIES,
  GET_COMMENT_LIKES,
  LIKE_COMMENT,
} from '../src/port/comment';
import { CommentModel } from '../src/model/comment.model';
import { CommentResponseDto } from '../src/dto/comment-response.dto';
import { UserLinkDto } from '../src/dto/user-link.dto';
import { CreateCommentDto } from '../src/dto/create-comment.dto';
import { SetCommentLikeDto } from '../src/dto/set-comment-like.dto';

describe('CommentController', () => {
  let controller: CommentController;

  const mockComment: CommentModel = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdById: 1,
    parentReviewId: 10,
    parentCommentId: null,
  };

  const mockCreate = { create: jest.fn() };
  const mockDelete = { deleteById: jest.fn() };
  const mockSearch = { search: jest.fn() };
  const mockGet = { get: jest.fn() };
  const mockGetReplies = { getReplies: jest.fn() };
  const mockGetLikes = { getLikes: jest.fn() };
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
        { provide: GET_COMMENT_LIKES, useValue: mockGetLikes },
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
        createdById: 1,
        parentReviewId: 10,
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
        createdById: 1,
        parentReviewId: 10,
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
      mockGet.get.mockResolvedValue(mockComment);
      const result = await controller.get(1);

      expect(mockGet.get).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(CommentResponseDto);
      expect(result.self).toBe('/api/comments/1');
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

  describe('getLikes', () => {
    it('calls getLikes port and returns an array of UserLinkDto', async () => {
      mockGetLikes.getLikes.mockResolvedValue([2, 3]);
      const result = await controller.getLikes(1);

      expect(mockGetLikes.getLikes).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserLinkDto);
      expect(result[0].user).toBe('/api/users/2');
      expect(result[1].user).toBe('/api/users/3');
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
