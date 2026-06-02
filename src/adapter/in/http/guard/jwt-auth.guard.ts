// `type` on CanActivate/ExecutionContext: decorating canActivate emits metadata
// for its signature, which TS1272 requires be type-only (isolatedModules).
import {
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MapErrors } from 'error-mapper-decorator';
import { Public } from '../decorator/public.decorator';
import { TOKEN_VERIFIER, type ITokenVerifier } from '../../../../port/out';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { InvalidTokenException } from '../../../../error/auth/invalid-token.exception';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_VERIFIER) private readonly verifier: ITokenVerifier,
  ) {}

  @MapErrors({
    from: InvalidTokenException,
    to: (error) =>
      new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: error.message,
      }),
  })
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublic(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization header',
      });
    }

    request.user = await this.verifier.verify(token);
    return true;
  }

  private isPublic(context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride(Public, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false
    );
  }

  private extractToken(request: AuthenticatedRequest): string | undefined {
    const header = request.headers.authorization;
    if (!header) {
      return undefined;
    }
    const parts = header.split(' ');
    return parts.length === 2 && parts[0] === 'Bearer' && parts[1]
      ? parts[1]
      : undefined;
  }
}
