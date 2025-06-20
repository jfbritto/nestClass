import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class PessoasService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
    private readonly hashingService: HashingService,
  ) {}

  throwNotFoundError() {
    throw new NotFoundException('Pessoa não encontrada');
  }

  async create(createPessoaDto: CreatePessoaDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createPessoaDto.password,
      );
      const dadosPessoa = {
        nome: createPessoaDto.nome,
        passwordHash,
        email: createPessoaDto.email,
      };

      const novaPessoa = this.pessoaRepository.create(dadosPessoa);
      await this.pessoaRepository.save(novaPessoa);
      return novaPessoa;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('E-mail já está em uso');
      }
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(pagination: PaginationDto) {
    const { limit, offset } = pagination;
    const pessoas = await this.pessoaRepository.find({
      skip: offset,
      take: limit,
      order: { id: 'ASC' },
    });
    if (!pessoas || pessoas.length === 0) {
      this.throwNotFoundError();
    }
    return pessoas;
  }

  async findOne(id: number) {
    const pessoa = await this.pessoaRepository.findOne({ where: { id } });
    if (!pessoa) {
      this.throwNotFoundError();
    }
    return pessoa;
  }

  async update(
    id: number,
    updatePessoaDto: UpdatePessoaDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const dadosPessoa = {
      nome: updatePessoaDto?.nome,
    };

    if (updatePessoaDto?.password) {
      dadosPessoa['passwordHash'] = await this.hashingService.hash(
        updatePessoaDto.password,
      );
    }

    const pessoa = await this.pessoaRepository.preload({
      id,
      ...dadosPessoa,
    });

    if (!pessoa) {
      this.throwNotFoundError();
    }

    if (pessoa.id !== tokenPayload.sub) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta pessoa',
      );
    }

    await this.pessoaRepository.save(pessoa);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const pessoa = await this.findOne(id);

    if (pessoa.id !== tokenPayload.sub) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta pessoa',
      );
    }

    return this.pessoaRepository.remove(pessoa);
  }

  async uploadPicture(
    file: Express.Multer.File,
    tokenPayload: TokenPayloadDto,
  ) {
    const pessoa = await this.findOne(tokenPayload.sub);
    if (!pessoa) {
      this.throwNotFoundError();
    }
    if (!file) {
      throw new InternalServerErrorException('Arquivo não enviado');
    }

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);

    const fileName = `${tokenPayload.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);

    await fs.writeFile(fileFullPath, file.buffer);

    pessoa.picture = fileName;
    await this.pessoaRepository.save(pessoa);

    return pessoa;
  }
}
