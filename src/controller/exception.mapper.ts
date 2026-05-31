import type { Response } from 'express';

import {
  AlreadyLikedException,
  CommentDBException,
  CommentNotFoundException,
  NotLikedException,
} from '../error/comment/';

import { ArtistProviderError } from '../error/artist/';
import { PodcastProviderError } from '../error/podcast/';

import {
  UserDBException,
  UserNotFoundException,
  InvalidCredentialsException,
  AlreadyFollowingException,
  NotFollowingException,
  SelfFollowException,
} from '../error/user/';

import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';

function toResponse(e: HttpException, host: ArgumentsHost) {
  const response = host.switchToHttp().getResponse<Response>();
  response.status(e.getStatus()).json(e.getResponse());
}

@Catch(CommentNotFoundException, UserNotFoundException)
class NotFoundMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    return toResponse(new NotFoundException(exception.message), host);
  }
}

@Catch(
  AlreadyLikedException,
  NotLikedException,
  AlreadyFollowingException,
  NotFollowingException,
)
class ConflictMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    return toResponse(new ConflictException(exception.message), host);
  }
}

@Catch(InvalidCredentialsException)
class UnauthorizedMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    return toResponse(new UnauthorizedException(exception.message), host);
  }
}

@Catch(SelfFollowException)
class UnprocessableEntityMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    return toResponse(
      new UnprocessableEntityException(exception.message),
      host,
    );
  }
}

@Catch(
  CommentDBException,
  UserDBException,
  ArtistProviderError,
  PodcastProviderError,
)
class InternalServerErrorMapper implements ExceptionFilter {
  catch(_: Error, host: ArgumentsHost): void {
    return toResponse(
      new InternalServerErrorException('An unexpected error occurred'),
      host,
    );
  }
}

export const filters = [
  new NotFoundMapper(),
  new ConflictMapper(),
  new UnauthorizedMapper(),
  new UnprocessableEntityMapper(),
  new InternalServerErrorMapper(),
] as const;
