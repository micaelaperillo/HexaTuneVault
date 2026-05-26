import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '@review/domain/exception/domain.exception.js';
import { ReviewNotFoundException } from '@review/domain/exception/review-not-found.exception.js';
import { UnauthorizedDeletionException } from '@review/domain/exception/unauthorized-deletion.exception.js';
import { DuplicateReviewException } from '@review/domain/exception/duplicate-review.exception.js';
import { SubjectNotFoundException } from '@review/domain/exception/subject-not-found.exception.js';
import { InvalidReviewException } from '@review/domain/exception/invalid-review.exception.js';

type ExceptionConstructor = new (...args: string[]) => DomainException;

const EXCEPTION_MAP = new Map<
  ExceptionConstructor,
  { status: HttpStatus; message?: string }
>([
  [
    ReviewNotFoundException,
    { status: HttpStatus.NOT_FOUND, message: 'Resource not found' },
  ],
  [
    UnauthorizedDeletionException,
    { status: HttpStatus.FORBIDDEN, message: 'Action not permitted' },
  ],
  [
    DuplicateReviewException,
    { status: HttpStatus.CONFLICT, message: 'Resource already exists' },
  ],
  [
    SubjectNotFoundException,
    {
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Referenced subject does not exist',
    },
  ],
  [InvalidReviewException, { status: HttpStatus.BAD_REQUEST }],
]);

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const mapping = EXCEPTION_MAP.get(
      exception.constructor as ExceptionConstructor,
    );
    if (mapping) {
      const { status } = mapping;
      const message = mapping.message ?? exception.message;
      response
        .status(status)
        .json({ statusCode: status, code: exception.code, message });
      return;
    }

    this.logger.warn(
      `Unmapped domain exception: ${exception.constructor.name}`,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
}
