import { QueryFailedError, type Repository } from 'typeorm';
import { UserRepository } from '../src/adapter/user.repository';
import { UserEntity } from '../src/entity/user.entity';
import { UserDBException } from '../src/error/user/user-db.exception';
import { InvalidCredentialsException } from '../src/error/user/invalid-credentials.exception';
import type { IPasswordHasher } from '../src/repository/password-hasher.port';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockRepo: jest.Mocked<
    Pick<
      Repository<UserEntity>,
      'save' | 'findOneBy' | 'findAndCount' | 'softDelete'
    >
  >;
  let hasher: jest.Mocked<IPasswordHasher>;

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
    mockRepo = {
      save: jest.fn(),
      findOneBy: jest.fn(),
      findAndCount: jest.fn(),
      softDelete: jest.fn(),
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
});
