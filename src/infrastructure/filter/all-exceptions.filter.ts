import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

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
      response
        .status(status)
        .json({ statusCode: status, message: 'Internal server error' });
      return;
    }

    const body = exception.getResponse();
    response
      .status(status)
      .json(
        typeof body === 'string' ? { statusCode: status, message: body } : body,
      );
  }
}
