import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';

import { TOKEN_VERIFIER } from '../repository/i-token-verifier';
import { JwtTokenVerifier } from '../adapter/jwt-token-verifier';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';

@Global()
@Module({
  imports: [
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
  providers: [
    { provide: TOKEN_VERIFIER, useClass: JwtTokenVerifier },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
