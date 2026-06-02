import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
      response.status(status).json({
        statusCode: status,
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
      return;
    }

    const body = exception.getResponse();
    if (typeof body === 'string') {
      response
        .status(status)
        .json({ statusCode: status, code: 'ERROR', message: body });
    } else {
      const code =
        isRecord(body) && typeof body.code === 'string' ? body.code : 'ERROR';
      const message =
        (isRecord(body) ? body.message : undefined) ?? exception.message;
      response.status(status).json({ statusCode: status, code, message });
    }
  }
}
