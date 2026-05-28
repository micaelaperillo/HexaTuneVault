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
      const obj = body as Record<string, unknown>;
      response.status(status).json({
        statusCode: status,
        code: (obj.code as string) ?? 'ERROR',
        message: obj.message ?? exception.message,
      });
    }
  }
}
