import {
  Logger,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as basicAuth from 'express-basic-auth';
import mongoose from 'mongoose';
import { AppModule } from './app.module';
import {
  SWAGGER_CONFIG,
  SWAGGER_URL,
} from './common/configs/swagger/swagger-config';
import { formatErrors } from './common/helpers/validation/format-errors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
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
  }

  /* enable/disable mongoose logging */
  const isDbLoggingEnabled = configService.get<boolean>('database.logging');
  if (isDbLoggingEnabled) {
    mongoose.set('debug', { shell: true, color: true });
  }

  const port = configService.get<number>('app.port') || 3000;
  const logger = new Logger('NestApplication');
  await app.listen(port, () => {
    logger.log(`Server is up and running at http://localhost:${port}`);
  });
}
bootstrap();
