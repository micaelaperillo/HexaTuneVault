import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from './public.decorator';
import {
  TOKEN_VERIFIER,
  type ITokenVerifier,
} from '../../repository/i-token-verifier';
import type { AuthenticatedRequest } from './authenticated-request';
import { InvalidTokenException } from '../../error/auth/invalid-token.exception';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_VERIFIER) private readonly verifier: ITokenVerifier,
  ) {}

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

    try {
      request.user = await this.verifier.verify(token);
      return true;
    } catch (error) {
      if (error instanceof InvalidTokenException) {
        throw new UnauthorizedException({
          code: 'UNAUTHORIZED',
          message: error.message,
        });
      }
      throw error;
    }
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
