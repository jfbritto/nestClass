import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export class OutroMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // console.log('Outro Middleware executed');

    next();
  }
}
