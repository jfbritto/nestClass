import {
  ConflictException,
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

@Injectable()
export class PessoasService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
  ) {}

  throwNotFoundError() {
    throw new NotFoundException('Pessoa não encontrada');
  }

  async create(createPessoaDto: CreatePessoaDto) {
    try {
      const dadosPessoa = {
        nome: createPessoaDto.nome,
        passwordHash: createPessoaDto.password,
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

  async update(id: number, updatePessoaDto: UpdatePessoaDto) {
    const dadosPessoa = {
      nome: updatePessoaDto.nome,
      passwordHash: updatePessoaDto.password,
      email: updatePessoaDto.email,
    };

    const pessoa = await this.pessoaRepository.preload({
      id,
      ...dadosPessoa,
    });

    if (!pessoa) {
      this.throwNotFoundError();
    }

    await this.pessoaRepository.save(pessoa);
  }

  async remove(id: number) {
    const result = await this.pessoaRepository.delete(id);
    if (result.affected === 0) {
      this.throwNotFoundError();
    }
  }
}
