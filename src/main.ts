import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { formatErrors } from './common/helpers/validation/format-errors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(3000);
}
bootstrap();
