import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecadosModule } from '../recados/recados.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { SimpleMiddleware } from 'src/common/middlewares/simple.middleware';
import { OutroMiddleware } from 'src/common/middlewares/outro.middleware';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minuto
          limit: 60, // 6 requests
          blockDuration: 60000, // 1 minuto
        },
      ],
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: Boolean(process.env.DB_AUTO_LOAD_ENTITIES),
      synchronize: Boolean(process.env.DB_SYNCHRONIZE), //sempre deve estar false em produção
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', '..', 'pictures'),
      serveRoot: '/pictures',
    }),
    RecadosModule,
    PessoasModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SimpleMiddleware).forRoutes({
      path: '*', // Aplica o middleware a todas as rotas
      method: RequestMethod.ALL, // Aplica a todos os métodos HTTP
    });
    consumer.apply(OutroMiddleware).forRoutes({
      path: '*', // Aplica o middleware a todas as rotas
      method: RequestMethod.ALL, // Aplica a todos os métodos HTTP
    });
  }
}
