import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommentNotFoundException } from '../exceptions/comment-not-found.exception';
import { AlreadyLikedException } from '../exceptions/already-liked.exception';
import { NotLikedException } from '../exceptions/not-liked.exception';
import { Response } from 'express';
import { CommentDBException } from '../exceptions/comment-db.exception';

@Catch(
  CommentNotFoundException,
  AlreadyLikedException,
  NotLikedException,
  CommentDBException,
)
export class CommentExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    let httpException: HttpException;

    if (exception instanceof CommentNotFoundException)
      httpException = new NotFoundException(exception.message);
    else if (exception instanceof AlreadyLikedException)
      httpException = new ConflictException(exception.message);
    else if (exception instanceof NotLikedException)
      httpException = new ConflictException(exception.message);
    else if (exception instanceof CommentDBException)
      httpException = new InternalServerErrorException(
        'An unexpected error occurred',
      );
    else return;

    const response = host.switchToHttp().getResponse<Response>();
    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }
}
