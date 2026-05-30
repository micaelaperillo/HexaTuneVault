import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from '@infrastructure/filter/all-exceptions.filter.js';
import { DomainExceptionFilter } from '@infrastructure/filter/domain-exception.filter.js';

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
  // NestJS evaluates global filters in reverse order — DomainExceptionFilter runs first
  app.useGlobalFilters(new AllExceptionsFilter(), new DomainExceptionFilter());
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
