import { Injectable, NotFoundException } from '@nestjs/common';
import { Recado } from './entities/recado.entity';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class RecadosService {
  constructor(
    @InjectRepository(Recado)
    private readonly recadoRepository: Repository<Recado>,
    private readonly pessoaService: PessoasService,
  ) {}

  throwNotFoundError() {
    throw new NotFoundException('Recado não encontrado');
  }

  async findAll(pagination: PaginationDto) {
    const { limit, offset } = pagination;
    const recados = await this.recadoRepository.find({
      skip: offset,
      take: limit,
      order: { id: 'desc' },
      relations: ['de', 'para'],
      select: {
        de: { id: true, nome: true },
        para: { id: true, nome: true },
      },
    });
    if (!recados || recados.length === 0) {
      this.throwNotFoundError();
    }

    return recados;
  }

  async findOne(id: number) {
    const recado = await this.recadoRepository.findOne({
      where: { id },
      relations: ['de', 'para'],
      select: {
        de: { id: true, nome: true },
        para: { id: true, nome: true },
      },
    });
    if (!recado) {
      this.throwNotFoundError();
    }

    return recado;
  }

  async create(createRecadoDto: CreateRecadoDto) {
    const de = await this.pessoaService.findOne(createRecadoDto.deId);
    const para = await this.pessoaService.findOne(createRecadoDto.paraId);

    const newRecado = await this.recadoRepository.create({
      texto: createRecadoDto.texto,
      lido: false,
      data: new Date(),
      de,
      para,
    });

    await this.recadoRepository.save(newRecado);
    return {
      ...newRecado,
      de: {
        id: newRecado.de.id,
      },
      para: {
        id: newRecado.para.id,
      },
    };
  }

  async update(id: number, updateRecadoDto: UpdateRecadoDto) {
    const recado = await this.findOne(id);

    recado.texto = updateRecadoDto?.texto ?? recado.texto;
    recado.lido = updateRecadoDto?.lido ?? recado.lido;

    await this.recadoRepository.save(recado);

    return recado;
  }

  async remove(id: number) {
    const result = await this.recadoRepository.delete(id);
    if (result.affected === 0) {
      this.throwNotFoundError();
    }
  }
}
