import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // await new Promise((resolve) => setTimeout(resolve, 3000)); // Simula uma conexão lenta

    return next.handle().pipe(
      catchError((error) => {
        console.error('Erro capturado pelo interceptor:', error);
        throw error; // Re-throw the error to be handled by the global exception filter
      }),
    );
  }
}
