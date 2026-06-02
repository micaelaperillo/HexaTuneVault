import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../entity/user.entity';
import { USER_REPOSITORY } from '../port/out/user-repository.port';
import { UserRepository } from '../adapter/user.repository';
import { PASSWORD_HASHER } from '../port/out/password-hasher.port';
import { Argon2idPasswordHasher } from '../adapter/argon2id-password-hasher';
import { TOKEN_ISSUER } from '../port/out/token-issuer.port';
import { JwtTokenRepository } from '../adapter/jwt-token.repository';

import {
  UserService,
  AUTHENTICATE_USER,
  CREATE_USER,
  EDIT_USER,
  DELETE_USER,
  SEARCH_USER,
  GET_USER,
  FOLLOW_USER,
  LIST_FOLLOWS,
} from '../use-case/user.service';

import { UserController } from '../controller/user.controller';
import { SessionController } from '../controller/session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController, SessionController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2idPasswordHasher },
    { provide: TOKEN_ISSUER, useClass: JwtTokenRepository },
    { provide: AUTHENTICATE_USER, useClass: UserService },
    { provide: CREATE_USER, useClass: UserService },
    { provide: EDIT_USER, useClass: UserService },
    { provide: DELETE_USER, useClass: UserService },
    { provide: SEARCH_USER, useClass: UserService },
    { provide: GET_USER, useClass: UserService },
    { provide: FOLLOW_USER, useClass: UserService },
    { provide: LIST_FOLLOWS, useClass: UserService },
  ],
})
export class UserModule {}
