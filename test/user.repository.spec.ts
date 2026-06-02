// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { ILike, QueryFailedError } from 'typeorm';
// import { UserRepository } from '../src/adapter/user.repository';
// import { UserEntity } from '../src/entity/user.entity';
// import { UserDBException } from '../src/error/user/user-db.exception';
// import { InvalidCredentialsException } from '../src/error/user/invalid-credentials.exception';
// import { PASSWORD_HASHER } from '../src/repository/i-password-hasher';
// import type { UserModel } from '../src/model/user.model';

// describe('UserRepository', () => {
//   let repository: UserRepository;

//   const storedUser = {
//     id: 1,
//     username: 'ada',
//     password: 'hashed-secret',
//   } as UserModel;

//   const relationMock = {
//     of: jest.fn().mockReturnThis(),
//     add: jest.fn().mockResolvedValue(undefined),
//     remove: jest.fn().mockResolvedValue(undefined),
//     loadMany: jest.fn().mockResolvedValue([]),
//   };

//   const qbMock = {
//     where: jest.fn().mockReturnThis(),
//     andWhere: jest.fn().mockReturnThis(),
//     innerJoin: jest.fn().mockReturnThis(),
//     skip: jest.fn().mockReturnThis(),
//     take: jest.fn().mockReturnThis(),
//     getOne: jest.fn().mockResolvedValue(null),
//     getMany: jest.fn().mockResolvedValue([]),
//     getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
//     relation: jest.fn().mockReturnValue(relationMock),
//   };

//   const mockTypeOrmRepo = {
//     save: jest.fn(),
//     findOneBy: jest.fn(),
//     findBy: jest.fn(),
//     softDelete: jest.fn(),
//     createQueryBuilder: jest.fn(() => qbMock),
//   };

//   const hasher = {
//     hash: jest.fn(),
//     verify: jest.fn(),
//   };

//   beforeEach(async () => {
//     jest.clearAllMocks();
//     qbMock.getOne.mockResolvedValue(null);
//     qbMock.getMany.mockResolvedValue([]);
//     qbMock.getManyAndCount.mockResolvedValue([[], 0]);
//     relationMock.loadMany.mockResolvedValue([]);

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UserRepository,
//         { provide: getRepositoryToken(UserEntity), useValue: mockTypeOrmRepo },
//         { provide: PASSWORD_HASHER, useValue: hasher },
//       ],
//     }).compile();

//     repository = module.get(UserRepository);
//   });

//   describe('create', () => {
//     it('hashes the password before persisting and returns the stored user', async () => {
//       hasher.hash.mockResolvedValue('hashed-secret');
//       mockTypeOrmRepo.save.mockResolvedValue(storedUser);

//       const result = await repository.create({
//         username: 'ada',
//         password: 'plain',
//       } as Omit<UserModel, 'id'>);

//       expect(hasher.hash).toHaveBeenCalledWith('plain');
//       expect(mockTypeOrmRepo.save).toHaveBeenCalledWith(
//         expect.objectContaining({ username: 'ada', password: 'hashed-secret' }),
//       );
//       expect(result).toBe(storedUser);
//     });

//     it('translates a QueryFailedError into UserDBException', async () => {
//       hasher.hash.mockResolvedValue('hashed-secret');
//       mockTypeOrmRepo.save.mockRejectedValue(
//         new QueryFailedError('INSERT', [], new Error('duplicate key')),
//       );

//       await expect(
//         repository.create({ username: 'ada', password: 'plain' } as Omit<
//           UserModel,
//           'id'
//         >),
//       ).rejects.toBeInstanceOf(UserDBException);
//     });

//     it('re-throws non-database errors unchanged', async () => {
//       const boom = new Error('hasher exploded');
//       hasher.hash.mockRejectedValue(boom);

//       await expect(
//         repository.create({ username: 'ada', password: 'plain' } as Omit<
//           UserModel,
//           'id'
//         >),
//       ).rejects.toBe(boom);
//     });
//   });

//   describe('findById', () => {
//     it('looks the user up by id and returns it', async () => {
//       mockTypeOrmRepo.findOneBy.mockResolvedValue(storedUser);

//       const result = await repository.findById(1);

//       expect(mockTypeOrmRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
//       expect(result).toBe(storedUser);
//     });

//     it('returns null when no user matches', async () => {
//       mockTypeOrmRepo.findOneBy.mockResolvedValue(null);

//       await expect(repository.findById(99)).resolves.toBeNull();
//     });
//   });

//   describe('findByUsername', () => {
//     it('delegates to findOneBy with the username', async () => {
//       mockTypeOrmRepo.findOneBy.mockResolvedValue(storedUser);

//       const result = await repository.findByUsername('ada');

//       expect(mockTypeOrmRepo.findOneBy).toHaveBeenCalledWith({
//         username: 'ada',
//       });
//       expect(result).toBe(storedUser);
//     });
//   });

//   describe('authenticate', () => {
//     it('returns the user when it exists and the password verifies', async () => {
//       mockTypeOrmRepo.findOneBy.mockResolvedValue(storedUser);
//       hasher.verify.mockResolvedValue(true);

//       const result = await repository.authenticate('ada', 'plain');

//       expect(hasher.verify).toHaveBeenCalledWith('plain', 'hashed-secret');
//       expect(result).toBe(storedUser);
//     });

//     it('throws InvalidCredentialsException and skips verify when the user is missing', async () => {
//       mockTypeOrmRepo.findOneBy.mockResolvedValue(null);

//       await expect(
//         repository.authenticate('ghost', 'plain'),
//       ).rejects.toBeInstanceOf(InvalidCredentialsException);
//       expect(hasher.verify).not.toHaveBeenCalled();
//     });

//     it('throws InvalidCredentialsException when the password does not verify', async () => {
//       mockTypeOrmRepo.findOneBy.mockResolvedValue(storedUser);
//       hasher.verify.mockResolvedValue(false);

//       await expect(
//         repository.authenticate('ada', 'wrong'),
//       ).rejects.toBeInstanceOf(InvalidCredentialsException);
//     });
//   });

//   describe('search', () => {
//     it('applies no filters when none are provided', async () => {
//       mockTypeOrmRepo.findBy.mockResolvedValue([storedUser]);

//       const result = await repository.search({});

//       expect(mockTypeOrmRepo.findBy).toHaveBeenCalledWith({});
//       expect(result).toEqual([storedUser]);
//     });

//     it('applies a case-insensitive partial match per provided filter', async () => {
//       mockTypeOrmRepo.findBy.mockResolvedValue([storedUser]);

//       await repository.search({
//         username: 'ad',
//         email: 'example',
//         firstName: 'Ad',
//         lastName: 'Lov',
//       });

//       expect(mockTypeOrmRepo.findBy).toHaveBeenCalledWith({
//         username: ILike('%ad%'),
//         email: ILike('%example%'),
//         firstName: ILike('%Ad%'),
//         lastName: ILike('%Lov%'),
//       });
//     });
//   });

//   describe('update', () => {
//     it('re-hashes the password when one is supplied', async () => {
//       hasher.hash.mockResolvedValue('hashed-new');
//       mockTypeOrmRepo.save.mockResolvedValue(storedUser);

//       await repository.update({ id: 1, password: 'new-plain' });

//       expect(hasher.hash).toHaveBeenCalledWith('new-plain');
//       expect(mockTypeOrmRepo.save).toHaveBeenCalledWith(
//         expect.objectContaining({ id: 1, password: 'hashed-new' }),
//       );
//     });

//     it('leaves the password untouched when none is supplied', async () => {
//       mockTypeOrmRepo.save.mockResolvedValue(storedUser);

//       await repository.update({ id: 1, biography: 'updated' });

//       expect(hasher.hash).not.toHaveBeenCalled();
//       expect(mockTypeOrmRepo.save).toHaveBeenCalledWith({
//         id: 1,
//         biography: 'updated',
//       });
//     });

//     it('translates a QueryFailedError into UserDBException', async () => {
//       mockTypeOrmRepo.save.mockRejectedValue(
//         new QueryFailedError('UPDATE', [], new Error('constraint')),
//       );

//       await expect(
//         repository.update({ id: 1, biography: 'x' }),
//       ).rejects.toBeInstanceOf(UserDBException);
//     });

//     it('re-throws a non-database error raised inside the DB call unchanged', async () => {
//       const boom = new Error('connection lost');
//       mockTypeOrmRepo.save.mockRejectedValue(boom);

//       await expect(repository.update({ id: 1, biography: 'x' })).rejects.toBe(
//         boom,
//       );
//     });
//   });

//   describe('deleteById', () => {
//     it('soft-deletes the user by id', async () => {
//       mockTypeOrmRepo.softDelete.mockResolvedValue(undefined);

//       await repository.deleteById(1);

//       expect(mockTypeOrmRepo.softDelete).toHaveBeenCalledWith(1);
//     });
//   });

//   describe('follow', () => {
//     it('adds the relation when not already following', async () => {
//       relationMock.loadMany.mockResolvedValue([]);

//       await repository.follow(1, 2);

//       expect(relationMock.of).toHaveBeenCalledWith(1);
//       expect(relationMock.add).toHaveBeenCalledWith(2);
//     });

//     it('does nothing when the edge already exists', async () => {
//       relationMock.loadMany.mockResolvedValue([{ id: 2 }]);

//       await repository.follow(1, 2);

//       expect(relationMock.add).not.toHaveBeenCalled();
//     });
//   });

//   describe('unfollow', () => {
//     it('removes the relation', async () => {
//       await repository.unfollow(1, 2);

//       expect(relationMock.of).toHaveBeenCalledWith(1);
//       expect(relationMock.remove).toHaveBeenCalledWith(2);
//     });
//   });

//   describe('isFollowing', () => {
//     it('returns true when the target is among the loaded relations', async () => {
//       relationMock.loadMany.mockResolvedValue([{ id: 2 }, { id: 3 }]);

//       await expect(repository.isFollowing(1, 2)).resolves.toBe(true);
//     });

//     it('returns false when the target is absent', async () => {
//       relationMock.loadMany.mockResolvedValue([{ id: 3 }]);

//       await expect(repository.isFollowing(1, 2)).resolves.toBe(false);
//     });
//   });

//   describe('findFollowers', () => {
//     it('paginates and wraps the rows with page metadata', async () => {
//       qbMock.getManyAndCount.mockResolvedValue([[storedUser], 1]);

//       const result = await repository.findFollowers(1, { page: 2, pageSize: 20 });

//       expect(qbMock.skip).toHaveBeenCalledWith(20);
//       expect(qbMock.take).toHaveBeenCalledWith(20);
//       expect(result).toEqual({
//         items: [storedUser],
//         page: 2,
//         pageSize: 20,
//         total: 1,
//       });
//     });
//   });

//   describe('findFollowing', () => {
//     it('paginates and wraps the rows with page metadata', async () => {
//       qbMock.getManyAndCount.mockResolvedValue([[storedUser], 1]);

//       const result = await repository.findFollowing(1, { page: 1, pageSize: 10 });

//       expect(qbMock.skip).toHaveBeenCalledWith(0);
//       expect(qbMock.take).toHaveBeenCalledWith(10);
//       expect(result).toEqual({
//         items: [storedUser],
//         page: 1,
//         pageSize: 10,
//         total: 1,
//       });
//     });
//   });
// });
