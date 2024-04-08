import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('UserController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  describe('POST /api/users', () => {

    beforeEach(async () => {
      await testService.deleteUser();
    })

    it("should be rejected if request is invalid", async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: '',
          password: '',
          firstName: '',
        })

      logger.info(response.body)

      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })

    it("should be able to register", async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          password: 'P@ssw0rd',
          firstName: 'test',
          lastName: 'user',
          email: 'testuser@test.com'
        })

      logger.info(response.body)

      expect(response.status).toBe(200)
      expect(response.body.data.id).toBeDefined()
      expect(response.body.data.username).toBe('test')
    })

    it("should be rejected if username is exist", async () => {
      await testService.createUser();
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          password: 'P@ssw0rd',
          firstName: 'test',
          lastName: 'user',
          email: 'testuser@test.com'
        })

      logger.info(response.body)

      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })

  })
});
