import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => {
          return {
            property: error.property,
            message: error.constraints[Object.keys(error.constraints).at(-1)],
          };
        });
        return new UnprocessableEntityException(result);
      },
    }),
  );
  await app.listen(3000);
}
bootstrap();
