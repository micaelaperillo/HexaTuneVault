import type { ArgumentsHost } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import {
  NotFoundMapper,
  ConflictMapper,
  UnauthorizedMapper,
  ForbiddenMapper,
  UnprocessableEntityMapper,
  TooManyRequestsMapper,
  InternalServerErrorMapper,
  BadGatewayMapper,
  filters,
} from '../../../../../../src/adapter/in/http/filter/http-exception.mappers';
import { UserNotFoundException } from '../../../../../../src/error/user/user-not-found.exception';
import { AlreadyFollowingException } from '../../../../../../src/error/user/already-following.exception';
import { InvalidCredentialsException } from '../../../../../../src/error/user/invalid-credentials.exception';
import { ForbiddenUserActionException } from '../../../../../../src/error/user/forbidden-user-action.exception';
import { ForbiddenDeletionException } from '../../../../../../src/error/review/forbidden-deletion.exception';
import { SelfFollowException } from '../../../../../../src/error/user/self-follow.exception';
import { ReviewCooldownException } from '../../../../../../src/error/review/review-cooldown.exception';
import { UserDBException } from '../../../../../../src/port/out/persistence.error';
import { AlbumProviderError } from '../../../../../../src/port/out/catalog.error';

describe('http-exception mappers', () => {
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    } as unknown as ArgumentsHost;
  });

  it('NotFoundMapper → 404 using the status-derived fallback code', () => {
    new NotFoundMapper().catch(new UserNotFoundException(1), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'User with id 1 not found',
    });
  });

  it('ConflictMapper → 409', () => {
    new ConflictMapper().catch(new AlreadyFollowingException(1, 2), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 409, code: 'CONFLICT' }),
    );
  });

  it('UnauthorizedMapper → 401', () => {
    new UnauthorizedMapper().catch(new InvalidCredentialsException(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }),
    );
  });

  it('ForbiddenMapper → 403 using the domain exception code', () => {
    new ForbiddenMapper().catch(new ForbiddenDeletionException(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN_DELETION' }),
    );
  });

  it('ForbiddenMapper maps ForbiddenUserActionException', () => {
    new ForbiddenMapper().catch(new ForbiddenUserActionException(), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'FORBIDDEN_ACTION' }),
    );
  });

  it('UnprocessableEntityMapper → 422', () => {
    new UnprocessableEntityMapper().catch(new SelfFollowException(1), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  it('TooManyRequestsMapper → 429 using the domain code', () => {
    new TooManyRequestsMapper().catch(new ReviewCooldownException(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'REVIEW_COOLDOWN' }),
    );
  });

  it('InternalServerErrorMapper → 500 with a generic message', () => {
    new InternalServerErrorMapper().catch(new UserDBException('boom'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  });

  it('BadGatewayMapper → 502 with a generic message', () => {
    new BadGatewayMapper().catch(
      new AlbumProviderError(new Error('down')),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
    expect(json).toHaveBeenCalledWith({
      statusCode: 502,
      code: 'BAD_GATEWAY',
      message: 'Upstream catalog provider failed',
    });
  });

  it('exports one instance per mapper', () => {
    expect(filters).toHaveLength(8);
  });
});
