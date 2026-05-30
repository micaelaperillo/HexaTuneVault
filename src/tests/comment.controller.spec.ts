import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from '../controller/comment.controller';
import {
  CREATE_COMMENT,
  DELETE_COMMENT,
  SEARCH_COMMENT,
  GET_COMMENT,
  GET_COMMENT_LIKES,
  LIKE_COMMENT,
  UNLIKE_COMMENT,
} from '../port/comment/';
import { CommentModel } from '../model/comment.model';
import { AssociatedType } from '../model/comment.associated.type';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { UserLinkDto } from '../dto/user-link.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';

describe('CommentController', () => {
  let controller: CommentController;

  const mockComment: CommentModel = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date('2024-01-01'),
    createdBy: 'user1',
    associatedTo: 'track1',
    associatedType: AssociatedType.TRACK,
    likedBy: ['user2'],
  };

  const mockCreate = { create: jest.fn() };
  const mockDelete = { deleteById: jest.fn() };
  const mockSearch = { search: jest.fn() };
  const mockGet = { get: jest.fn() };
  const mockGetLikes = { getLikes: jest.fn() };
  const mockLike = { like: jest.fn() };
  const mockUnlike = { unlike: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        { provide: CREATE_COMMENT, useValue: mockCreate },
        { provide: DELETE_COMMENT, useValue: mockDelete },
        { provide: SEARCH_COMMENT, useValue: mockSearch },
        { provide: GET_COMMENT, useValue: mockGet },
        { provide: GET_COMMENT_LIKES, useValue: mockGetLikes },
        { provide: LIKE_COMMENT, useValue: mockLike },
        { provide: UNLIKE_COMMENT, useValue: mockUnlike },
      ],
    }).compile();

    controller = module.get(CommentController);
  });

  describe('create', () => {
    it('calls create port and returns a CommentResponseDto with correct links', async () => {
      mockCreate.create.mockResolvedValue(mockComment);
      const dto = {
        content: 'Test comment',
        createdBy: 'user1',
        associatedTo: 'track1',
        associatedType: AssociatedType.TRACK,
      } as CreateCommentDto;

      const result = await controller.create(dto);

      expect(mockCreate.create).toHaveBeenCalledWith(dto);
      expect(result).toBeInstanceOf(CommentResponseDto);
      expect(result.self).toBe('/api/comments/1');
    });
  });

  describe('search', () => {
    it('calls search port with filters and returns an array of CommentResponseDto', async () => {
      mockSearch.search.mockResolvedValue([mockComment]);
      const filters = {
        createdBy: 'user1',
        associatedType: AssociatedType.TRACK,
      };
      const result = await controller.search(filters);

      expect(mockSearch.search).toHaveBeenCalledWith(filters);
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

  describe('getLikes', () => {
    it('calls getLikes port and returns an array of UserLinkDto', async () => {
      mockGetLikes.getLikes.mockResolvedValue(['user2', 'user3']);
      const result = await controller.getLikes(1);

      expect(mockGetLikes.getLikes).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserLinkDto);
      expect(result[0].user).toBe('/api/users/user2');
      expect(result[1].user).toBe('/api/users/user3');
    });
  });

  describe('delete', () => {
    it('calls deleteById port', async () => {
      mockDelete.deleteById.mockResolvedValue(undefined);
      await controller.delete(1);
      expect(mockDelete.deleteById).toHaveBeenCalledWith(1);
    });
  });

  describe('like', () => {
    it('calls like port with comment id and user id', async () => {
      mockLike.like.mockResolvedValue(undefined);
      await controller.like(1, 'user2');
      expect(mockLike.like).toHaveBeenCalledWith(1, 'user2');
    });
  });

  describe('unlike', () => {
    it('calls unlike port with comment id and user id', async () => {
      mockUnlike.unlike.mockResolvedValue(undefined);
      await controller.unlike(1, 'user2');
      expect(mockUnlike.unlike).toHaveBeenCalledWith(1, 'user2');
    });
  });
});
