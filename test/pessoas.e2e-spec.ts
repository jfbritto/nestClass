import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';

describe('PessoasController (e2e)', () => {
  let app: INestApplication;
  let pessoaRepository: Repository<Pessoa>;
  let hashingService: HashingService;
  let accessToken: string;
  let testUser: Pessoa;

  const testUserData = {
    nome: 'E2E Test User',
    email: 'e2e.auth@test.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    pessoaRepository = moduleFixture.get<Repository<Pessoa>>(
      getRepositoryToken(Pessoa),
    );
    hashingService = moduleFixture.get<HashingService>(HashingService);
  });

  // Clean and login before each test that needs an authenticated user
  beforeEach(async () => {
    await pessoaRepository.query('DELETE FROM pessoa');
    
    const passwordHash = await hashingService.hash(testUserData.password);
    testUser = await pessoaRepository.save({
        ...testUserData,
        passwordHash,
    });

    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
            email: testUserData.email,
            password: testUserData.password
        });
    
    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/pessoas (POST)', () => {
    it('should create another person and return it', () => {
      const createPessoaDto = {
        nome: 'Another Test User',
        email: 'another.e2e@test.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/pessoas')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPessoaDto)
        .expect(201)
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              nome: createPessoaDto.nome,
              email: createPessoaDto.email,
            }),
          );
        });
    });

    it('should fail to create a person without auth token', () => {
        const createPessoaDto = {
            nome: 'No Auth User',
            email: 'noauth@test.com',
            password: 'password123',
        };

        return request(app.getHttpServer())
            .post('/pessoas')
            .send(createPessoaDto)
            .expect(401);
    });

    it('should return a 400 error if data is invalid', () => {
        const invalidDto = {
            nome: 'No',
            email: 'not-an-email',
            password: '123',
        };

        return request(app.getHttpServer())
            .post('/pessoas')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidDto)
            .expect(400);
    });
  });

  describe('/pessoas (GET)', () => {
    it('should return an array of people', async () => {
      const passwordHash = await hashingService.hash('password123');
      await pessoaRepository.save([
        { nome: 'User 1', email: 'user1@test.com', passwordHash },
        { nome: 'User 2', email: 'user2@test.com', passwordHash },
      ]);

      return request(app.getHttpServer())
        .get('/pessoas')
        .expect(200)
        .then((response) => {
          expect(response.body).toBeInstanceOf(Array);
          expect(response.body.length).toBe(3); // 1 from beforeEach + 2 from this test
        });
    });
  });

  describe('/pessoas/:id (GET)', () => {
    it('should return a single person', async () => {
        const passwordHash = await hashingService.hash('password123');
        const pessoa = await pessoaRepository.save({
            nome: 'FindMe User',
            email: 'findme@test.com',
            passwordHash
        });

        return request(app.getHttpServer())
            .get(`/pessoas/${pessoa.id}`)
            .expect(200)
            .then((response) => {
                expect(response.body.id).toBe(pessoa.id);
                expect(response.body.email).toBe(pessoa.email);
            });
    });

    it('should return 404 if person is not found', () => {
        return request(app.getHttpServer())
            .get('/pessoas/999999')
            .expect(404);
    });
  });

  describe('/pessoas/:id (PATCH)', () => {
    it('should update the authenticated user and return 200 OK', async () => {
      const updateDto = { nome: 'Updated Name' };

      return request(app.getHttpServer())
        .patch(`/pessoas/${testUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200);
    });

    it('should return 401 Unauthorized if no token is provided', () => {
      return request(app.getHttpServer())
        .patch(`/pessoas/${testUser.id}`)
        .send({ nome: 'new name' })
        .expect(401);
    });
  });

  describe('/pessoas/:id (DELETE)', () => {
    it('should delete the authenticated user and return 200 OK', async () => {
      return request(app.getHttpServer())
        .delete(`/pessoas/${testUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return 401 Unauthorized if no token is provided', () => {
      return request(app.getHttpServer())
        .delete(`/pessoas/${testUser.id}`)
        .expect(401);
    });
  });
}); 