import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './infrastructure/filter/all-exceptions.filter';
import {
  ReviewNotFoundMapper,
  ReviewForbiddenMapper,
  ReviewBadRequestMapper,
  ReviewCooldownMapper,
} from './infrastructure/filter/http-exception.mappers';

function flattenValidationErrors(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const messages = Object.values(error.constraints ?? {});
    if (error.children?.length) {
      messages.push(...flattenValidationErrors(error.children));
    }
    return messages;
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    exposedHeaders: ['X-Total-Count', 'Location'],
  });
  // Global filters: later-registered run first, so the review mappers take
  // precedence over the AllExceptionsFilter catch-all for review exceptions.
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new ReviewNotFoundMapper(),
    new ReviewForbiddenMapper(),
    new ReviewBadRequestMapper(),
    new ReviewCooldownMapper(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: flattenValidationErrors(errors),
        }),
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
