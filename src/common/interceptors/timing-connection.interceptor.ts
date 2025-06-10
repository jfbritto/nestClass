import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TimingConnectionInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // const startTime = new Date();

    // console.log('Iniciando a conexão...');
    // await new Promise((resolve) => setTimeout(resolve, 3000)); // Simula uma conexão lenta

    return next.handle().pipe(
      tap(() => {
        // const endTime = new Date();
        // const duration = endTime.getTime() - startTime.getTime();
        // console.log(`Conexão finalizada em ${duration}ms`);
      }),
    );
  }
}
