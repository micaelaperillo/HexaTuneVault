import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../error/domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.resolveStatus(exception.code);
    const message =
      status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : exception.message;

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.warn(`Unmapped domain exception code: ${exception.code}`);
    }

    response.status(status).json({
      statusCode: status,
      code:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'INTERNAL_ERROR'
          : exception.code,
      message,
    });
  }

  // Specific codes first, then generic suffix/prefix patterns
  private resolveStatus(code: string): HttpStatus {
    if (code === 'SUBJECT_NOT_FOUND') return HttpStatus.UNPROCESSABLE_ENTITY;
    if (code.endsWith('_NOT_FOUND')) return HttpStatus.NOT_FOUND;
    if (code.startsWith('FORBIDDEN_')) return HttpStatus.FORBIDDEN;
    if (code.startsWith('UNAUTHORIZED_')) return HttpStatus.UNAUTHORIZED;
    if (code.startsWith('DUPLICATE_')) return HttpStatus.CONFLICT;
    if (code.startsWith('INVALID_')) return HttpStatus.BAD_REQUEST;
    if (code.endsWith('_COOLDOWN')) return HttpStatus.TOO_MANY_REQUESTS;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
