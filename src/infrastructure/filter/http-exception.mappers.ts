import type { Response } from 'express';

import {
  AlreadyLikedException,
  CommentDBException,
  CommentNotFoundException,
  NotLikedException,
} from '../../error/comment/';

import { ArtistProviderError } from '../../error/artist/';

import { DomainException } from '../../error/domain.exception';
import { ReviewNotFoundException } from '../../error/review/review-not-found.exception';
import { ForbiddenDeletionException } from '../../error/review/forbidden-deletion.exception';
import { InvalidReviewException } from '../../error/review/invalid-review.exception';
import { ReviewCooldownException } from '../../error/review/review-cooldown.exception';

import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

function toResponse(e: HttpException, host: ArgumentsHost) {
  const response = host.switchToHttp().getResponse<Response>();
  response.status(e.getStatus()).json(e.getResponse());
}

@Catch(CommentNotFoundException)
export class NotFoundMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    return toResponse(new NotFoundException(exception.message), host);
  }
}

@Catch(AlreadyLikedException, NotLikedException)
export class ConflictMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    return toResponse(new ConflictException(exception.message), host);
  }
}

@Catch(CommentDBException, ArtistProviderError)
export class InternalServerErrorMapper implements ExceptionFilter {
  catch(_: Error, host: ArgumentsHost): void {
    return toResponse(
      new InternalServerErrorException('An unexpected error occurred'),
      host,
    );
  }
}

// Review domain exceptions carry a stable machine-readable `code`; preserve it
// in the response so the contract matches AllExceptionsFilter and the pipe.
function domainResponse(
  host: ArgumentsHost,
  status: HttpStatus,
  exception: DomainException,
): void {
  const response = host.switchToHttp().getResponse<Response>();
  response.status(status).json({
    statusCode: status,
    code: exception.code,
    message: exception.message,
  });
}

@Catch(ReviewNotFoundException)
export class ReviewNotFoundMapper implements ExceptionFilter {
  catch(exception: ReviewNotFoundException, host: ArgumentsHost): void {
    domainResponse(host, HttpStatus.NOT_FOUND, exception);
  }
}

@Catch(ForbiddenDeletionException)
export class ReviewForbiddenMapper implements ExceptionFilter {
  catch(exception: ForbiddenDeletionException, host: ArgumentsHost): void {
    domainResponse(host, HttpStatus.FORBIDDEN, exception);
  }
}

@Catch(InvalidReviewException)
export class ReviewBadRequestMapper implements ExceptionFilter {
  catch(exception: InvalidReviewException, host: ArgumentsHost): void {
    domainResponse(host, HttpStatus.BAD_REQUEST, exception);
  }
}

@Catch(ReviewCooldownException)
export class ReviewCooldownMapper implements ExceptionFilter {
  catch(exception: ReviewCooldownException, host: ArgumentsHost): void {
    domainResponse(host, HttpStatus.TOO_MANY_REQUESTS, exception);
  }
}
