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
  Catch,
  ExceptionFilter,
  ArgumentsHost,
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

@Catch(CommentDBException, ArtistProviderError, PodcastProviderError)
export class InternalServerErrorMapper implements ExceptionFilter {
  catch(_: Error, host: ArgumentsHost): void {
    return toResponse(
      new InternalServerErrorException('An unexpected error occurred'),
      host,
    );
  }
}
