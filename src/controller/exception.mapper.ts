import type { Response } from 'express';

import {
  AlreadyLikedException,
  CommentDBException,
  CommentNotFoundException,
  NotLikedException,
} from '../error/comment/';

import { ArtistProviderError } from '../error/artist/';

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
export class NotFoundMapper implements ExceptionFilter {
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
export class ConflictMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    return toResponse(new ConflictException(exception.message), host);
  }
}

@Catch(InvalidCredentialsException)
export class UnauthorizedMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    return toResponse(new UnauthorizedException(exception.message), host);
  }
}

@Catch(SelfFollowException)
export class UnprocessableEntityMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    return toResponse(
      new UnprocessableEntityException(exception.message),
      host,
    );
  }
}

@Catch(CommentDBException, UserDBException, ArtistProviderError)
export class InternalServerErrorMapper implements ExceptionFilter {
  catch(_: Error, host: ArgumentsHost): void {
    return toResponse(
      new InternalServerErrorException('An unexpected error occurred'),
      host,
    );
  }
}
