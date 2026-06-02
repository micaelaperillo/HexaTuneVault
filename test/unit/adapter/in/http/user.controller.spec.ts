import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../../../../src/adapter/in/http/user.controller';
import {
  AUTHENTICATE_USER,
  type IAuthenticateUser,
  CREATE_USER,
  type ICreateUser,
  EDIT_USER,
  type IEditUser,
  DELETE_USER,
  type IDeleteUser,
  SEARCH_USER,
  type ISearchUser,
  GET_USER,
  type IGetUser,
  FOLLOW_USER,
  type IFollowUser,
  LIST_FOLLOWS,
  type IListFollows,
} from '../../../../../src/port/in/user/';
import { ForbiddenUserActionException } from '../../../../../src/error/user/';
import { UserResponseDto } from '../../../../../src/adapter/in/http/dto/out/user';
import type { UserModel } from '../../../../../src/model';
import type { AuthenticatedUser } from '../../../../../src/model/user';

describe('UserController', () => {
  let controller: UserController;

  let mockAuth: jest.Mocked<IAuthenticateUser>;
  let mockCreate: jest.Mocked<ICreateUser>;
  let mockEdit: jest.Mocked<IEditUser>;
  let mockDelete: jest.Mocked<IDeleteUser>;
  let mockSearch: jest.Mocked<ISearchUser>;
  let mockGet: jest.Mocked<IGetUser>;
  let mockFollow: jest.Mocked<IFollowUser>;
  let mockListFollows: jest.Mocked<IListFollows>;

  const baseUser: UserModel = {
    id: 1,
    username: 'alice',
    password: 'hashed',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    biography: 'Just a user',
    location: 'Buenos Aires',
    profilePictureUrl: 'https://example.com/pic.jpg',
    followerCount: 3,
    followingCount: 5,
  };

  const currentUser: AuthenticatedUser = { id: 1 };

  const pageOf = (user: UserModel) => ({
    items: [user],
    total: 1,
    page: 1,
    pageSize: 20,
  });

  beforeEach(async () => {
    mockAuth = { authenticate: jest.fn() };
    mockCreate = { create: jest.fn() };
    mockEdit = { edit: jest.fn() };
    mockDelete = { deleteById: jest.fn() };
    mockSearch = { search: jest.fn() };
    mockGet = { get: jest.fn() };
    mockFollow = { follow: jest.fn(), unfollow: jest.fn() };
    mockListFollows = { findFollowers: jest.fn(), findFollowing: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: AUTHENTICATE_USER, useValue: mockAuth },
        { provide: CREATE_USER, useValue: mockCreate },
        { provide: EDIT_USER, useValue: mockEdit },
        { provide: DELETE_USER, useValue: mockDelete },
        { provide: SEARCH_USER, useValue: mockSearch },
        { provide: GET_USER, useValue: mockGet },
        { provide: FOLLOW_USER, useValue: mockFollow },
        { provide: LIST_FOLLOWS, useValue: mockListFollows },
      ],
    }).compile();

    controller = module.get(UserController);
  });

  describe('create', () => {
    it('calls createUser port and returns a UserResponseDto', async () => {
      mockCreate.create.mockResolvedValue(baseUser);

      const result = await controller.create({
        username: 'alice',
        password: 'secret',
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice@example.com',
        biography: 'Just a user',
        location: 'Buenos Aires',
        profile_picture_url: 'https://example.com/pic.jpg',
      });

      expect(mockCreate.create).toHaveBeenCalledWith({
        username: 'alice',
        password: 'secret',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        biography: 'Just a user',
        location: 'Buenos Aires',
        profilePictureUrl: 'https://example.com/pic.jpg',
      });
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toBe(1);
      expect(result.username).toBe('alice');
      expect(result.self).toBe('/api/users/1');
    });
  });

  describe('search', () => {
    it('returns a paged list of UserResponseDtos', async () => {
      mockSearch.search.mockResolvedValue(pageOf(baseUser));

      const result = await controller.search({
        username: 'alice',
        email: undefined,
        first_name: undefined,
        last_name: undefined,
        page: 1,
        page_size: 20,
      });

      expect(mockSearch.search).toHaveBeenCalledWith({
        username: 'alice',
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        page: 1,
        pageSize: 20,
      });
      expect(result.total).toBe(1);
      expect(result.items[0]).toBeInstanceOf(UserResponseDto);
      expect(result.items[0].username).toBe('alice');
    });
  });

  describe('get', () => {
    it('returns a UserResponseDto for the given id', async () => {
      mockGet.get.mockResolvedValue(baseUser);

      const result = await controller.get(1);

      expect(mockGet.get).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toBe(1);
    });

    it('uses empty string for missing location and zero for missing follower/following counts', async () => {
      const userWithoutOptionals: UserModel = {
        ...baseUser,
        location: undefined,
        followerCount: undefined,
        followingCount: undefined,
      };
      mockGet.get.mockResolvedValue(userWithoutOptionals);

      const result = await controller.get(1);

      expect(result.location).toBe('');
      expect(result.follower_count).toBe(0);
      expect(result.following_count).toBe(0);
    });
  });

  describe('edit', () => {
    it('calls editUser port and returns a UserResponseDto when id matches current user', async () => {
      mockEdit.edit.mockResolvedValue(baseUser);

      const result = await controller.edit(
        1,
        { username: 'alice2', biography: 'Updated' },
        currentUser,
      );

      expect(mockEdit.edit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          username: 'alice2',
          biography: 'Updated',
        }),
      );
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.username).toBe('alice');
    });

    it('throws ForbiddenUserActionException when id does not match current user', async () => {
      await expect(
        controller.edit(2, { username: 'hacker' }, currentUser),
      ).rejects.toThrow(ForbiddenUserActionException);
      expect(mockEdit.edit).not.toHaveBeenCalled();
    });

    it('prunes undefined fields from the patch payload', async () => {
      mockEdit.edit.mockResolvedValue(baseUser);

      await controller.edit(
        1,
        { username: 'alice2', password: undefined },
        currentUser,
      );

      const callArg = mockEdit.edit.mock.calls[0][0];
      expect('username' in callArg).toBe(true);
      expect('password' in callArg).toBe(false);
    });
  });

  describe('delete', () => {
    it('calls deleteUser port when id matches current user', async () => {
      mockDelete.deleteById.mockResolvedValue(undefined);

      await controller.delete(1, currentUser);

      expect(mockDelete.deleteById).toHaveBeenCalledWith(1);
    });

    it('throws ForbiddenUserActionException when id does not match current user', async () => {
      await expect(controller.delete(2, currentUser)).rejects.toThrow(
        ForbiddenUserActionException,
      );
      expect(mockDelete.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('followers', () => {
    it('returns a paged list of followers', async () => {
      mockListFollows.findFollowers.mockResolvedValue(pageOf(baseUser));

      const result = await controller.followers(1, { page: 1, page_size: 20 });

      expect(mockListFollows.findFollowers).toHaveBeenCalledWith(1, {
        page: 1,
        pageSize: 20,
      });
      expect(result.total).toBe(1);
      expect(result.items[0]).toBeInstanceOf(UserResponseDto);
    });
  });

  describe('following', () => {
    it('returns a paged list of users the given user is following', async () => {
      mockListFollows.findFollowing.mockResolvedValue(pageOf(baseUser));

      const result = await controller.following(1, { page: 1, page_size: 20 });

      expect(mockListFollows.findFollowing).toHaveBeenCalledWith(1, {
        page: 1,
        pageSize: 20,
      });
      expect(result.total).toBe(1);
      expect(result.items[0]).toBeInstanceOf(UserResponseDto);
    });
  });

  describe('follow', () => {
    it('calls follow port with the current user id and target id', async () => {
      mockFollow.follow.mockResolvedValue(undefined);

      await controller.follow(2, currentUser);

      expect(mockFollow.follow).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('unfollow', () => {
    it('calls unfollow port with the current user id and target id', async () => {
      mockFollow.unfollow.mockResolvedValue(undefined);

      await controller.unfollow(2, currentUser);

      expect(mockFollow.unfollow).toHaveBeenCalledWith(1, 2);
    });
  });
});
