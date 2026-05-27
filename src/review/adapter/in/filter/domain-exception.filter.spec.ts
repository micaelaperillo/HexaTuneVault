import { HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter.js';
import { DomainException } from '@review/domain/exception/domain.exception.js';
import { ReviewNotFoundException } from '@review/domain/exception/review-not-found.exception.js';
import { UnauthorizedDeletionException } from '@review/domain/exception/unauthorized-deletion.exception.js';
import { DuplicateReviewException } from '@review/domain/exception/duplicate-review.exception.js';
import { SubjectNotFoundException } from '@review/domain/exception/subject-not-found.exception.js';
import { InvalidReviewException } from '@review/domain/exception/invalid-review.exception.js';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should map ReviewNotFoundException to 404', () => {
    filter.catch(new ReviewNotFoundException(), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        code: 'REVIEW_NOT_FOUND',
        message: 'Resource not found',
      }),
    );
  });

  it('should map UnauthorizedDeletionException to 403', () => {
    filter.catch(new UnauthorizedDeletionException(), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: 'UNAUTHORIZED_DELETION',
        message: 'Action not permitted',
      }),
    );
  });

  it('should map DuplicateReviewException to 409', () => {
    filter.catch(new DuplicateReviewException(), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        code: 'DUPLICATE_REVIEW',
        message: 'Resource already exists',
      }),
    );
  });

  it('should map SubjectNotFoundException to 422', () => {
    filter.catch(new SubjectNotFoundException(), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 422,
        code: 'SUBJECT_NOT_FOUND',
        message: 'Referenced subject does not exist',
      }),
    );
  });

  it('should map InvalidReviewException to 400 with exception message', () => {
    filter.catch(new InvalidReviewException('Bad rating'), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        code: 'INVALID_REVIEW',
        message: 'Bad rating',
      }),
    );
  });

  it('should map unmapped DomainException to 500', () => {
    class UnknownDomainException extends DomainException {
      constructor() {
        super('Something broke');
      }
    }

    filter.catch(new UnknownDomainException(), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      }),
    );
  });
});
