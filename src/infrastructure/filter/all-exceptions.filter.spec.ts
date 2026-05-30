import { HttpStatus, HttpException, BadRequestException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should return 500 with INTERNAL_ERROR for non-HttpException errors', () => {
    filter.catch(new Error('something broke'), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  });

  it('should return 500 with INTERNAL_ERROR for non-Error values', () => {
    filter.catch('string error', mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  });

  it('should handle HttpException with string body', () => {
    filter.catch(
      new HttpException('Not allowed', HttpStatus.FORBIDDEN),
      mockHost,
    );

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 403,
      code: 'ERROR',
      message: 'Not allowed',
    });
  });

  it('should handle HttpException with object body and preserve code', () => {
    const exception = new BadRequestException({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: ['field is required'],
    });

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: ['field is required'],
    });
  });

  it('should default code to ERROR when object body lacks code', () => {
    const exception = new BadRequestException({
      statusCode: 400,
      message: 'Bad Request',
    });

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 400,
      code: 'ERROR',
      message: 'Bad Request',
    });
  });

  it('should fall back to exception.message when object body lacks message', () => {
    const exception = new HttpException(
      { statusCode: 422 },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 422,
      code: 'ERROR',
      message: 'Http Exception',
    });
  });
});
