import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';

import { TOKEN_VERIFIER } from '../repository/token-verifier.port';
import { JwtTokenRepository } from '../adapter/jwt-token.repository';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // `@types/jsonwebtoken` types `expiresIn` as `number | StringValue`
          // (an `ms` template-literal type), so a plain `string` from the env
          // needs this assertion. Keep the env value a valid `ms` span (e.g. '1h').
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1h') as NonNullable<
            JwtModuleOptions['signOptions']
          >['expiresIn'],
        },
      }),
    }),
  ],
  providers: [
    { provide: TOKEN_VERIFIER, useClass: JwtTokenRepository },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
