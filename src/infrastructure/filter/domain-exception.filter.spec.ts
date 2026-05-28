import { HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { DomainExceptionFilter } from '@infrastructure/filter/domain-exception.filter.js';
import { DomainException } from '@domain/exception/domain.exception.js';
import { ReviewNotFoundException } from '@review/domain/exception/review-not-found.exception.js';
import { ForbiddenDeletionException } from '@review/domain/exception/forbidden-deletion.exception.js';
import { ReviewCooldownException } from '@review/domain/exception/review-cooldown.exception.js';
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

  it('should map *_NOT_FOUND codes to 404', () => {
    filter.catch(new ReviewNotFoundException(), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        code: 'REVIEW_NOT_FOUND',
        message: 'Review not found',
      }),
    );
  });

  it('should map SUBJECT_NOT_FOUND specifically to 422', () => {
    filter.catch(new SubjectNotFoundException(), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 422,
        code: 'SUBJECT_NOT_FOUND',
        message: 'Subject not found',
      }),
    );
  });

  it('should map FORBIDDEN_* codes to 403', () => {
    filter.catch(new ForbiddenDeletionException(), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: 'FORBIDDEN_DELETION',
        message: 'Not authorized to delete this review',
      }),
    );
  });

  it('should map UNAUTHORIZED_* codes to 401', () => {
    class UnauthorizedTestException extends DomainException {
      constructor() {
        super('Not logged in', 'UNAUTHORIZED_ACCESS');
      }
    }

    filter.catch(new UnauthorizedTestException(), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        code: 'UNAUTHORIZED_ACCESS',
        message: 'Not logged in',
      }),
    );
  });

  it('should map *_COOLDOWN codes to 429', () => {
    filter.catch(new ReviewCooldownException(), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 429,
        code: 'REVIEW_COOLDOWN',
        message: 'Please wait before reviewing this subject again',
      }),
    );
  });

  it('should map INVALID_* codes to 400 with exception message', () => {
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

  it('should map unrecognized codes to 500 with generic message', () => {
    class UnknownDomainException extends DomainException {
      constructor() {
        super('Something broke', 'UNKNOWN_CODE');
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
