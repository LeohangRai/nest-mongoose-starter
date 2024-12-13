import { DocumentBuilder } from '@nestjs/swagger';

export const SWAGGER_URL = '/api-docs';

export const SWAGGER_CONFIG = new DocumentBuilder()
  .setTitle('NestJS Mongoose API')
  .setDescription('OpenAPI documentation for NestJS Mongoose API')
  .setVersion('1.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
  })
  .build();
