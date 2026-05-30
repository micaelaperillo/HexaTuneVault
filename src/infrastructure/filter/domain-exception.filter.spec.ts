import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import { DomainException } from '../../error/domain.exception';
import { ReviewNotFoundException } from '../../error/review/review-not-found.exception';
import { ForbiddenDeletionException } from '../../error/review/forbidden-deletion.exception';
import { ReviewCooldownException } from '../../error/review/review-cooldown.exception';
import { InvalidReviewException } from '../../error/review/invalid-review.exception';

function collectExceptionFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return collectExceptionFiles(full);
    // Exclude the shared-kernel base by exact basename so the guard survives
    // the base file being relocated between directories.
    return entry.name.endsWith('.exception.ts') &&
      entry.name !== 'domain.exception.ts'
      ? [full]
      : [];
  });
}

// Every concrete domain exception must be represented here, paired with the
// HTTP status it must resolve to. The drift guard below fails if a new
// *.exception.ts file is added without registering it, catching codes that
// would silently fall through resolveStatus to 500.
const concreteExceptions: [DomainException, HttpStatus][] = [
  [new ReviewNotFoundException(), HttpStatus.NOT_FOUND],
  [new ForbiddenDeletionException(), HttpStatus.FORBIDDEN],
  [new ReviewCooldownException(), HttpStatus.TOO_MANY_REQUESTS],
  [new InvalidReviewException('test'), HttpStatus.BAD_REQUEST],
];

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
    filter.catch(
      new DomainException('Subject not found', 'SUBJECT_NOT_FOUND'),
      mockHost,
    );

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

  it('should map DUPLICATE_* codes to 409', () => {
    filter.catch(
      new DomainException('Already exists', 'DUPLICATE_ENTRY'),
      mockHost,
    );
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        code: 'DUPLICATE_ENTRY',
        message: 'Already exists',
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

  it.each(
    concreteExceptions.map(
      ([exception, status]) => [exception.code, exception, status] as const,
    ),
  )('maps %s to its expected status', (_code, exception, expectedStatus) => {
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: expectedStatus,
        code: exception.code,
        message: exception.message,
      }),
    );
  });

  it('registers every review-module domain exception', () => {
    expect(concreteExceptions.length).toBeGreaterThan(0);
    // Scope the scan to the review module's exception dir. Other modules
    // (e.g. comment) have their own error handling and are not part of this
    // filter's registry, so they must not be counted by this guard.
    const reviewExceptionsDir = join(__dirname, '../..', 'error', 'review');
    const files = collectExceptionFiles(reviewExceptionsDir);
    expect(files.length).toBe(concreteExceptions.length);
  });
});
