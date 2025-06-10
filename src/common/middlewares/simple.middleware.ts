import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export class SimpleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // console.log('Simple Middleware executed');

    const authorization = req.headers?.authorization;

    if (authorization) {
      req['user'] = {
        nome: 'Luiz',
        sobrenome: 'Silva',
        role: 'admin',
      };
    }

    res.setHeader('CABECALHO', 'Do Middleware');

    next(); // Próximo middleware ou rota

    // console.log(
    //   'Aqui é executado depois de todos os outros middlewares e interceptors',
    // );

    // res.on('finish', () => {
    //   console.log('Resposta finalizada');
    // });
    // res.on('close', () => {
    //   console.log('Conexão fechada');
    // });
    // res.on('error', (err) => {
    //   console.error('Erro na resposta:', err);
    // });
  }
}
