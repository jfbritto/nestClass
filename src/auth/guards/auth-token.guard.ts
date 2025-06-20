import {
  ExecutionContext,
  CanActivate,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../auth.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoasRepository: Repository<Pessoa>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token de autenticação não encontrado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      const pessoa = await this.pessoasRepository.findOneBy({
        id: payload.sub,
        active: true,
      });

      if (!pessoa) {
        throw new UnauthorizedException('Pessoa não autorizada');
      }

      payload['pessoa'] = pessoa;

      request[REQUEST_TOKEN_PAYLOAD_KEY] = payload;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }

    return true;
  }

  extractTokenFromHeader(request: any): string | undefined {
    const authorization =
      request.headers?.authorization || request.headers?.Authorization;

    if (!authorization || typeof authorization !== 'string') {
      return;
    }

    return authorization.split(' ')[1];
  }
}
