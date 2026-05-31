import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';

import { USER_REPOSITORY } from '../repository/i-user.repository';
import { UserRepository } from '../adapter/user.repository';
import { PASSWORD_HASHER } from '../repository/i-password-hasher';
import { Argon2idPasswordHasher } from '../adapter/argon2id-password-hasher';
import { TOKEN_ISSUER } from '../repository/i-token-issuer';
import { JwtTokenIssuer } from '../adapter/jwt-token-issuer';

import {
  UserService,
  AUTHENTICATE_USER,
  CREATE_USER,
  EDIT_USER,
  DELETE_USER,
  SEARCH_USER,
  GET_USER,
  FOLLOW_USER,
} from '../use-case/user.service';

import { UserController } from '../controller/user.controller';

import { DatabaseModule } from '../infrastructure/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET is not set');
        }
        return {
          secret,
          signOptions: {
            // `@types/jsonwebtoken` types `expiresIn` as `number | StringValue`
            // (an `ms` template-literal type), so a plain `string` from the env
            // needs this assertion. Keep the env value a valid `ms` span (e.g. '1h').
            expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as NonNullable<
              JwtModuleOptions['signOptions']
            >['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2idPasswordHasher },
    { provide: TOKEN_ISSUER, useClass: JwtTokenIssuer },
    { provide: AUTHENTICATE_USER, useClass: UserService },
    { provide: CREATE_USER, useClass: UserService },
    { provide: EDIT_USER, useClass: UserService },
    { provide: DELETE_USER, useClass: UserService },
    { provide: SEARCH_USER, useClass: UserService },
    { provide: GET_USER, useClass: UserService },
    { provide: FOLLOW_USER, useClass: UserService },
  ],
})
export class UserModule {}
