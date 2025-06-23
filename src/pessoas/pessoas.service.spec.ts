import { Test, TestingModule } from '@nestjs/testing';
import { PessoasService } from './pessoas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('PessoasService', () => {
  let service: PessoasService;
  let repository: Repository<Pessoa>;
  let hashingService: HashingService;

  const mockPessoaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  };

  const mockHashingService = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PessoasService,
        {
          provide: getRepositoryToken(Pessoa),
          useValue: mockPessoaRepository,
        },
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
      ],
    }).compile();

    service = module.get<PessoasService>(PessoasService);
    repository = module.get<Repository<Pessoa>>(getRepositoryToken(Pessoa));
    hashingService = module.get<HashingService>(HashingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new pessoa', async () => {
      const createPessoaDto: CreatePessoaDto = { nome: 'Test', email: 'test@test.com', password: 'password' };
      const hashedPassword = 'hashedPassword';
      const pessoa = new Pessoa();
      
      mockHashingService.hash.mockResolvedValue(hashedPassword);
      mockPessoaRepository.create.mockReturnValue(pessoa);
      mockPessoaRepository.save.mockResolvedValue(pessoa);

      const result = await service.create(createPessoaDto);

      expect(hashingService.hash).toHaveBeenCalledWith(createPessoaDto.password);
      expect(repository.create).toHaveBeenCalledWith({ nome: createPessoaDto.nome, email: createPessoaDto.email, passwordHash: hashedPassword });
      expect(repository.save).toHaveBeenCalledWith(pessoa);
      expect(result).toEqual(pessoa);
    });

    it('should throw a ConflictException if email already exists', async () => {
      const createPessoaDto: CreatePessoaDto = { nome: 'Test', email: 'test@test.com', password: 'password' };
      mockPessoaRepository.save.mockRejectedValue({ code: '23505' });

      await expect(service.create(createPessoaDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of pessoas', async () => {
      const pessoas = [new Pessoa()];
      mockPessoaRepository.find.mockResolvedValue(pessoas);

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(repository.find).toHaveBeenCalledWith({ skip: 0, take: 10, order: { id: 'ASC' } });
      expect(result).toEqual(pessoas);
    });

    it('should throw a NotFoundException if no pessoas are found', async () => {
      mockPessoaRepository.find.mockResolvedValue([]);
      await expect(service.findAll({ limit: 10, offset: 0 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a single pessoa', async () => {
      const pessoa = new Pessoa();
      mockPessoaRepository.findOne.mockResolvedValue(pessoa);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(pessoa);
    });

    it('should throw a NotFoundException if pessoa is not found', async () => {
      mockPessoaRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const tokenPayload: TokenPayloadDto = { 
      sub: 1, 
      email: 'test@test.com',
      iat: 1,
      exp: 1,
      aud: 'test',
      iss: 'test'
    };
    const updatePessoaDto: UpdatePessoaDto = { nome: 'Updated Name' };

    it('should update a pessoa', async () => {
      const pessoa = new Pessoa();
      pessoa.id = 1;
      mockPessoaRepository.preload.mockResolvedValue(pessoa);
      mockPessoaRepository.save.mockResolvedValue(pessoa);
      
      await service.update(1, updatePessoaDto, tokenPayload);

      expect(repository.preload).toHaveBeenCalledWith({ id: 1, ...{nome: updatePessoaDto.nome} });
      expect(repository.save).toHaveBeenCalledWith(pessoa);
    });

    it('should throw NotFoundException if pessoa to update is not found', async () => {
        mockPessoaRepository.preload.mockResolvedValue(null);
        await expect(service.update(1, updatePessoaDto, tokenPayload)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
        const pessoa = new Pessoa();
        pessoa.id = 2; // different id from token
        mockPessoaRepository.preload.mockResolvedValue(pessoa);

        await expect(service.update(1, updatePessoaDto, tokenPayload)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const tokenPayload: TokenPayloadDto = { 
      sub: 1, 
      email: 'test@test.com',
      iat: 1,
      exp: 1,
      aud: 'test',
      iss: 'test'
    };

    it('should remove a pessoa', async () => {
      const pessoa = new Pessoa();
      pessoa.id = 1;
      mockPessoaRepository.findOne.mockResolvedValue(pessoa);
      mockPessoaRepository.remove.mockResolvedValue(pessoa);
      
      const result = await service.remove(1, tokenPayload);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(pessoa);
      expect(result).toEqual(pessoa);
    });

    it('should throw ForbiddenException if user is not authorized to remove', async () => {
        const pessoa = new Pessoa();
        pessoa.id = 2;
        mockPessoaRepository.findOne.mockResolvedValue(pessoa);

        await expect(service.remove(1, tokenPayload)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('uploadPicture', () => {
    const tokenPayload: TokenPayloadDto = {
      sub: 1,
      email: 'test@test.com',
      iat: 1,
      exp: 1,
      aud: 'test',
      iss: 'test',
    };

    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'avatar.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 12345,
      buffer: Buffer.from('test file data'),
      stream: null,
      destination: '',
      filename: '',
      path: '',
    };

    beforeEach(() => {
      (fs.writeFile as jest.Mock).mockClear();
      mockPessoaRepository.findOne.mockClear();
      mockPessoaRepository.save.mockClear();
    });

    it('should upload a picture and update the pessoa', async () => {
      const pessoa = new Pessoa();
      pessoa.id = 1;
      mockPessoaRepository.findOne.mockResolvedValue(pessoa);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      
      const updatedPessoa = { ...pessoa, picture: '1.jpg' };
      mockPessoaRepository.save.mockResolvedValue(updatedPessoa);

      const result = await service.uploadPicture(mockFile, tokenPayload);

      expect(mockPessoaRepository.findOne).toHaveBeenCalledWith({ where: { id: tokenPayload.sub } });
      expect(fs.writeFile).toHaveBeenCalled();
      expect(mockPessoaRepository.save).toHaveBeenCalledWith(updatedPessoa);
      expect(result.picture).toEqual('1.jpg');
    });

    it('should throw NotFoundException if pessoa is not found', async () => {
      mockPessoaRepository.findOne.mockResolvedValue(null);
      await expect(service.uploadPicture(mockFile, tokenPayload)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if file is not provided', async () => {
      const pessoa = new Pessoa();
      pessoa.id = 1;
      mockPessoaRepository.findOne.mockResolvedValue(pessoa);
      await expect(service.uploadPicture(null, tokenPayload)).rejects.toThrow('Arquivo não enviado');
    });
  });
}); 