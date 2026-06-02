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
} from '../../error/comment/';
import { ArtistProviderError } from '../../error/artist/';
import { PodcastProviderError } from '../../error/podcast/';
import {
  UserDBException,
  UserNotFoundException,
  InvalidCredentialsException,
  AlreadyFollowingException,
  NotFollowingException,
  SelfFollowException,
} from '../../error/user/';
import { ReviewNotFoundException } from '../../error/review/review-not-found.exception';
import { ForbiddenDeletionException } from '../../error/review/forbidden-deletion.exception';
import { InvalidReviewException } from '../../error/review/invalid-review.exception';
import { ReviewCooldownException } from '../../error/review/review-cooldown.exception';
import { NotLikedException } from '../../error/review/not-liked.exception';
import { AlreadyLikedException } from '../../error/review/already-liked.exception';
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

@Catch(
  AlreadyFollowingException,
  NotFollowingException,
  AlreadyLikedException,
  NotLikedException,
)
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

@Catch(ForbiddenDeletionException)
export class ForbiddenMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    send(host, HttpStatus.FORBIDDEN, exception, 'FORBIDDEN');
  }
}

@Catch(InvalidReviewException)
export class BadRequestMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    send(host, HttpStatus.BAD_REQUEST, exception, 'BAD_REQUEST');
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

@Catch(
  CommentDBException,
  UserDBException,
  ArtistProviderError,
  PodcastProviderError,
  ReviewRepositoryException,
)
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

export const filters = [
  new NotFoundMapper(),
  new ConflictMapper(),
  new UnauthorizedMapper(),
  new ForbiddenMapper(),
  new BadRequestMapper(),
  new UnprocessableEntityMapper(),
  new TooManyRequestsMapper(),
  new InternalServerErrorMapper(),
] as const;
