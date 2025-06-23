import { Test, TestingModule } from '@nestjs/testing';
import { PessoasController } from './pessoas.controller';
import { PessoasService } from './pessoas.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Pessoa } from './entities/pessoa.entity';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';

describe('PessoasController', () => {
  let controller: PessoasController;
  let service: PessoasService;

  const mockPessoa = new Pessoa();
  mockPessoa.id = 1;
  mockPessoa.nome = 'Test User';
  mockPessoa.email = 'test@example.com';

  const mockTokenPayload: TokenPayloadDto = {
    sub: 1,
    email: 'test@example.com',
    iat: 1,
    exp: 1,
    aud: 'test',
    iss: 'test',
  };

  const mockPessoasService = {
    create: jest.fn().mockResolvedValue(mockPessoa),
    findAll: jest.fn().mockResolvedValue([mockPessoa]),
    findOne: jest.fn().mockResolvedValue(mockPessoa),
    update: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    uploadPicture: jest.fn().mockResolvedValue(mockPessoa),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PessoasController],
      providers: [
        {
          provide: PessoasService,
          useValue: mockPessoasService,
        },
      ],
    })
    .overrideGuard(AuthTokenGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<PessoasController>(PessoasController);
    service = module.get<PessoasService>(PessoasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a pessoa', async () => {
      const createDto: CreatePessoaDto = { nome: 'Test User', email: 'test@example.com', password: 'password' };
      const result = await controller.create(createDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPessoa);
    });
  });

  describe('findAll', () => {
    it('should return an array of pessoas', async () => {
      const pagination: PaginationDto = { limit: 10, offset: 0 };
      const result = await controller.findAll(pagination);
      expect(service.findAll).toHaveBeenCalledWith({ limit: 10, offset: 0 });
      expect(result).toEqual([mockPessoa]);
    });
  });

  describe('findOne', () => {
    it('should return a single pessoa', async () => {
      const result = await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPessoa);
    });
  });

  describe('update', () => {
    it('should update a pessoa', async () => {
      const updateDto: UpdatePessoaDto = { nome: 'Updated Name' };
      await controller.update(1, updateDto, mockTokenPayload, {} as any);
      expect(service.update).toHaveBeenCalledWith(1, updateDto, mockTokenPayload);
    });
  });

  describe('remove', () => {
    it('should remove a pessoa', async () => {
      await controller.remove(1, mockTokenPayload, {} as any);
      expect(service.remove).toHaveBeenCalledWith(1, mockTokenPayload);
    });
  });

  describe('uploadPicture', () => {
    it('should upload a picture', async () => {
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
      
      const result = await controller.uploadPicture(mockFile, mockTokenPayload, {} as any);
      expect(service.uploadPicture).toHaveBeenCalledWith(mockFile, mockTokenPayload);
      expect(result).toEqual(mockPessoa);
    });
  });
}); 