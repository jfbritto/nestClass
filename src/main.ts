import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { ParseIntIdPipe } from './common/pipes/parse-int-id.pipe';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
    new ParseIntIdPipe(),
  );

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
  }

  await app.listen(process.env.APP_PORT);
}
bootstrap();
