import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './infrastructure/filter/all-exceptions.filter';
import { filters } from './infrastructure/filter/http-exception.mappers';

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
  // Later-registered filters run first, so the domain mappers take precedence
  // over the AllExceptionsFilter catch-all.
  app.useGlobalFilters(new AllExceptionsFilter(), ...filters);
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

  const config = new DocumentBuilder()
    .setTitle('HexaTuneVault')
    .setDescription('HexaTuneVault API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
