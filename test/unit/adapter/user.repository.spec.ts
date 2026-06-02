import { QueryFailedError, type Repository } from 'typeorm';
import { UserRepository } from '../../../src/adapter/persistence/user.repository';
import { UserEntity } from '../../../src/entity/user.entity';
import { UserDBException } from '../../../src/adapter/persistence/user-db.exception';
import { InvalidCredentialsException } from '../../../src/error/user/invalid-credentials.exception';
import type { IPasswordHasher } from '../../../src/port/out/password-hasher.port';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockRepo: jest.Mocked<
    Pick<
      Repository<UserEntity>,
      | 'save'
      | 'findOneBy'
      | 'findAndCount'
      | 'softDelete'
      | 'createQueryBuilder'
    >
  >;
  let hasher: jest.Mocked<IPasswordHasher>;

  // Relation query builder chain used by follow / unfollow / isFollowing
  let relationQb: Record<string, jest.Mock>;

  // Select query builder chain used by findFollowers / findFollowing
  let selectQb: Record<string, jest.Mock>;

  const entity = (overrides?: Partial<UserEntity>): UserEntity =>
    Object.assign(new UserEntity(), {
      id: 1,
      username: 'ada',
      password: 'hashed',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@itba.edu.ar',
      biography: 'bio',
      location: '',
      profilePictureUrl: 'pic',
      followerCount: 0,
      followingCount: 0,
      ...overrides,
    });

  beforeEach(() => {
    relationQb = {
      relation: jest.fn().mockReturnThis(),
      of: jest.fn().mockReturnThis(),
      add: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      loadMany: jest.fn().mockResolvedValue([]),
    };

    selectQb = {
      innerJoin: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    mockRepo = {
      save: jest.fn(),
      findOneBy: jest.fn(),
      findAndCount: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(relationQb),
    };
    hasher = {
      hash: jest.fn().mockResolvedValue('hashed'),
      verify: jest.fn(),
    };
    repository = new UserRepository(
      mockRepo as unknown as Repository<UserEntity>,
      hasher,
    );
  });

  describe('create', () => {
    it('hashes the password and returns a mapped domain model', async () => {
      mockRepo.save.mockResolvedValue(entity());

      const result = await repository.create({
        username: 'ada',
        password: 'plaintext',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@itba.edu.ar',
        biography: 'bio',
        profilePictureUrl: 'pic',
      });

      expect(hasher.hash).toHaveBeenCalledWith('plaintext');
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed' }),
      );
      expect(result.id).toBe(1);
      expect(result.firstName).toBe('Ada');
    });

    it('translates a QueryFailedError into UserDBException', async () => {
      mockRepo.save.mockRejectedValue(
        new QueryFailedError('insert', [], {
          code: '23505',
        } as unknown as Error),
      );

      await expect(
        repository.create({
          username: 'ada',
          password: 'p',
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'ada@itba.edu.ar',
          biography: 'bio',
          profilePictureUrl: 'pic',
        }),
      ).rejects.toThrow(UserDBException);
    });
  });

  describe('findById', () => {
    it('returns a mapped model when found', async () => {
      mockRepo.findOneBy.mockResolvedValue(entity());
      const result = await repository.findById(1);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result?.username).toBe('ada');
    });

    it('returns null when not found', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);
      expect(await repository.findById(99)).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('delegates to findOneBy with the username', async () => {
      mockRepo.findOneBy.mockResolvedValue(entity());
      const result = await repository.findByUsername('ada');
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ username: 'ada' });
      expect(result?.id).toBe(1);
    });
  });

  describe('authenticate', () => {
    it('returns the user when the password verifies', async () => {
      mockRepo.findOneBy.mockResolvedValue(entity());
      hasher.verify.mockResolvedValue(true);
      const result = await repository.authenticate('ada', 'plaintext');
      expect(hasher.verify).toHaveBeenCalledWith('plaintext', 'hashed');
      expect(result.id).toBe(1);
    });

    it('throws InvalidCredentialsException when the user is missing', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);
      await expect(repository.authenticate('nobody', 'x')).rejects.toThrow(
        InvalidCredentialsException,
      );
      expect(hasher.verify).not.toHaveBeenCalled();
    });

    it('throws InvalidCredentialsException when the password fails', async () => {
      mockRepo.findOneBy.mockResolvedValue(entity());
      hasher.verify.mockResolvedValue(false);
      await expect(repository.authenticate('ada', 'wrong')).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe('search', () => {
    it('paginates and maps results to a Page of domain models', async () => {
      mockRepo.findAndCount.mockResolvedValue([[entity()], 1]);

      const result = await repository.search({
        username: 'ad',
        page: 2,
        pageSize: 5,
      });

      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
      expect(result.total).toBe(1);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(5);
      expect(result.items[0].username).toBe('ada');
    });

    it('defaults to page 1 / size 20 when pagination is omitted', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);
      const result = await repository.search({});
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
  });

  describe('update', () => {
    it('re-hashes the password when one is provided', async () => {
      mockRepo.save.mockResolvedValue(entity());
      await repository.update({ id: 1, password: 'newpass' });
      expect(hasher.hash).toHaveBeenCalledWith('newpass');
    });

    it('does not hash when no password is provided', async () => {
      mockRepo.save.mockResolvedValue(entity());
      await repository.update({ id: 1, biography: 'updated' });
      expect(hasher.hash).not.toHaveBeenCalled();
    });
  });

  describe('deleteById', () => {
    it('soft-deletes by id', async () => {
      mockRepo.softDelete.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });
      await repository.deleteById(1);
      expect(mockRepo.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('isFollowing', () => {
    it('returns true when followingId is in the loaded relation', async () => {
      relationQb.loadMany.mockResolvedValue([
        entity({ id: 2 }),
        entity({ id: 3 }),
      ]);

      const result = await repository.isFollowing(1, 2);

      expect(result).toBe(true);
      expect(relationQb.relation).toHaveBeenCalledWith(UserEntity, 'following');
      expect(relationQb.of).toHaveBeenCalledWith(1);
    });

    it('returns false when followingId is not in the loaded relation', async () => {
      relationQb.loadMany.mockResolvedValue([entity({ id: 3 })]);

      const result = await repository.isFollowing(1, 2);

      expect(result).toBe(false);
    });
  });

  describe('follow', () => {
    it('adds the relation when the user is not already following', async () => {
      relationQb.loadMany.mockResolvedValue([]);

      await repository.follow(1, 2);

      expect(relationQb.add).toHaveBeenCalledWith(2);
    });

    it('does nothing when the user is already following', async () => {
      relationQb.loadMany.mockResolvedValue([entity({ id: 2 })]);

      await repository.follow(1, 2);

      expect(relationQb.add).not.toHaveBeenCalled();
    });
  });

  describe('unfollow', () => {
    it('removes the relation via the query builder', async () => {
      await repository.unfollow(1, 2);

      expect(relationQb.relation).toHaveBeenCalledWith(UserEntity, 'following');
      expect(relationQb.of).toHaveBeenCalledWith(1);
      expect(relationQb.remove).toHaveBeenCalledWith(2);
    });
  });

  describe('findFollowers', () => {
    it('returns a page of users who follow the given user', async () => {
      mockRepo.createQueryBuilder.mockReturnValue(
        selectQb as unknown as ReturnType<
          Repository<UserEntity>['createQueryBuilder']
        >,
      );
      selectQb.getManyAndCount.mockResolvedValue([[entity()], 1]);

      const result = await repository.findFollowers(1, {
        page: 1,
        pageSize: 10,
      });

      expect(selectQb.innerJoin).toHaveBeenCalledWith(
        'u.following',
        'target',
        'target.id = :userId',
        { userId: 1 },
      );
      expect(selectQb.skip).toHaveBeenCalledWith(0);
      expect(selectQb.take).toHaveBeenCalledWith(10);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.items[0].id).toBe(1);
    });

    it('applies correct skip offset for page > 1', async () => {
      mockRepo.createQueryBuilder.mockReturnValue(
        selectQb as unknown as ReturnType<
          Repository<UserEntity>['createQueryBuilder']
        >,
      );
      selectQb.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findFollowers(1, { page: 3, pageSize: 5 });

      expect(selectQb.skip).toHaveBeenCalledWith(10);
      expect(selectQb.take).toHaveBeenCalledWith(5);
    });
  });

  describe('findFollowing', () => {
    it('returns a page of users that the given user follows', async () => {
      mockRepo.createQueryBuilder.mockReturnValue(
        selectQb as unknown as ReturnType<
          Repository<UserEntity>['createQueryBuilder']
        >,
      );
      selectQb.getManyAndCount.mockResolvedValue([[entity()], 1]);

      const result = await repository.findFollowing(1, {
        page: 1,
        pageSize: 10,
      });

      expect(selectQb.innerJoin).toHaveBeenCalledWith(
        'u.followers',
        'source',
        'source.id = :userId',
        { userId: 1 },
      );
      expect(selectQb.skip).toHaveBeenCalledWith(0);
      expect(selectQb.take).toHaveBeenCalledWith(10);
      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe(1);
    });

    it('applies correct skip offset for page > 1', async () => {
      mockRepo.createQueryBuilder.mockReturnValue(
        selectQb as unknown as ReturnType<
          Repository<UserEntity>['createQueryBuilder']
        >,
      );
      selectQb.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findFollowing(1, { page: 2, pageSize: 15 });

      expect(selectQb.skip).toHaveBeenCalledWith(15);
      expect(selectQb.take).toHaveBeenCalledWith(15);
    });
  });
});
