import type { Response } from 'express';
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

import { DomainException } from '../../error/domain.exception';

import {
  CommentDBException,
  CommentNotFoundException,
  CommentDeletionForbiddenException,
} from '../../error/comment/';
import { AlbumProviderError } from '../../error/album/';
import { ArtistProviderError } from '../../error/artist/';
import { PodcastProviderError } from '../../error/podcast/';
import {
  UserDBException,
  UserNotFoundException,
  InvalidCredentialsException,
  AlreadyFollowingException,
  NotFollowingException,
  SelfFollowException,
  ForbiddenUserActionException,
} from '../../error/user/';
import { ReviewNotFoundException } from '../../error/review/review-not-found.exception';
import { ForbiddenDeletionException } from '../../error/review/forbidden-deletion.exception';
import { ReviewCooldownException } from '../../error/review/review-cooldown.exception';
import { ReviewRepositoryException } from '../../error/review/review-repository.exception';

// Single response envelope across the app: { statusCode, code, message }.
// Domain exceptions carry a stable machine-readable `code`; for plain
// exceptions a status-derived fallback code is used.
function send(
  host: ArgumentsHost,
  status: HttpStatus,
  exception: Error,
  fallbackCode: string,
  genericMessage?: string,
): void {
  const response = host.switchToHttp().getResponse<Response>();
  const code =
    exception instanceof DomainException ? exception.code : fallbackCode;
  response.status(status).json({
    statusCode: status,
    code,
    message: genericMessage ?? exception.message,
  });
}

@Catch(CommentNotFoundException, UserNotFoundException, ReviewNotFoundException)
export class NotFoundMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    send(host, HttpStatus.NOT_FOUND, exception, 'NOT_FOUND');
  }
}

@Catch(AlreadyFollowingException, NotFollowingException)
export class ConflictMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    send(host, HttpStatus.CONFLICT, exception, 'CONFLICT');
  }
}

@Catch(InvalidCredentialsException)
export class UnauthorizedMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    send(host, HttpStatus.UNAUTHORIZED, exception, 'UNAUTHORIZED');
  }
}

@Catch(
  ForbiddenDeletionException,
  CommentDeletionForbiddenException,
  ForbiddenUserActionException,
)
export class ForbiddenMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    send(host, HttpStatus.FORBIDDEN, exception, 'FORBIDDEN');
  }
}

@Catch(SelfFollowException)
export class UnprocessableEntityMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    send(
      host,
      HttpStatus.UNPROCESSABLE_ENTITY,
      exception,
      'UNPROCESSABLE_ENTITY',
    );
  }
}

@Catch(ReviewCooldownException)
export class TooManyRequestsMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    send(host, HttpStatus.TOO_MANY_REQUESTS, exception, 'TOO_MANY_REQUESTS');
  }
}

@Catch(CommentDBException, UserDBException, ReviewRepositoryException)
export class InternalServerErrorMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    send(
      host,
      HttpStatus.INTERNAL_SERVER_ERROR,
      exception,
      'INTERNAL_ERROR',
      'An unexpected error occurred',
    );
  }
}

// Upstream catalog provider (Spotify) failures are gateway errors, not faults
// in this service, so they surface as 502 rather than 500.
@Catch(AlbumProviderError, ArtistProviderError, PodcastProviderError)
export class BadGatewayMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    send(
      host,
      HttpStatus.BAD_GATEWAY,
      exception,
      'BAD_GATEWAY',
      'Upstream catalog provider failed',
    );
  }
}

export const filters = [
  new NotFoundMapper(),
  new ConflictMapper(),
  new UnauthorizedMapper(),
  new ForbiddenMapper(),
  new UnprocessableEntityMapper(),
  new TooManyRequestsMapper(),
  new InternalServerErrorMapper(),
  new BadGatewayMapper(),
] as const;
