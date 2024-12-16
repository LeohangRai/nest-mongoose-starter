import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import mongoose from 'mongoose';
import { AppModule } from './app.module';
import {
  SWAGGER_CONFIG,
  SWAGGER_URL,
} from './common/helpers/swagger/swagger-config';
import { formatErrors } from './common/helpers/validation/format-errors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false, // if set to 'true', throws error if the request body/
      exceptionFactory: (errors) => {
        const formattedErrors = formatErrors(errors);
        return new UnprocessableEntityException(formattedErrors);
      },
    }),
  );

  const isDev = configService.get<string>('app.env') !== 'production';
  if (isDev) {
    /* set basic auth (prompt) for Swagger docs */
    const swaggerUser = configService.get<string>('swagger.user');
    const swaggerPassword = configService.get<string>('swagger.password');
    if (swaggerUser && swaggerPassword) {
      app.use(
        [SWAGGER_URL],
        basicAuth({
          challenge: true,
          users: { [swaggerUser]: swaggerPassword },
        }),
      );
    }

    /* enable Swagger docs */
    const documentFactory = () =>
      SwaggerModule.createDocument(app, SWAGGER_CONFIG);
    SwaggerModule.setup(SWAGGER_URL, app, documentFactory);

    /* enable mongoose logging */
    mongoose.set('debug', { shell: true, color: true });
  }

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
}
bootstrap();
