import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { ParseIntIdPipe } from './common/pipes/parse-int-id.pipe';

// import { AuthTokenInterceptor } from './common/interceptors/auth-token.interceptor';
// import { AddHeaderInterceptor } from './common/interceptors/add-header.interceptor';
// import { TimingConnectionInterceptor } from './common/interceptors/timing-connection.interceptor';
// import { ErrorHandlingInterceptor } from './common/interceptors/error.handling.interceptor';
// import { SimpleCacheInterceptor } from './common/interceptors/simple-cache.interceptor';
// import { ChangeDataInterceptor } from './common/interceptors/change-data.interceptor';

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

  // app.useGlobalInterceptors(new AddHeaderInterceptor());
  // app.useGlobalInterceptors(new TimingConnectionInterceptor());
  // app.useGlobalInterceptors(new ErrorHandlingInterceptor());
  // app.useGlobalInterceptors(new SimpleCacheInterceptor());
  // app.useGlobalInterceptors(new ChangeDataInterceptor());
  // app.useGlobalInterceptors(new AuthTokenInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
