import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { NodemailerService } from '../src/nodemailer/nodemailer.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserController } from '../src/user/user.controller';
import { UserService } from '../src/user/user.service';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let userController: UserController;

  const user = {
    name: faker.name.firstName(),
    lastname: faker.name.lastName(),
    username: faker.internet.userName(),
    email: 'test@companymail.com',
    password: faker.internet.password(),
  };

  let verificationToken;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [UserController],
      providers: [UserService, PrismaService, NodemailerService, ConfigService],
    }).compile();

    userController = moduleFixture.get<UserController>(UserController);

    // app = moduleFixture.createNestApplication();
    // await app.init();
  });

  it('should create a user', async () => {
    const { token } = await userController.create(user, true);
    verificationToken = token;
  });

  it('shoud verify the created user', async () => {
    await userController.verify({
      username: user.username,
      token: verificationToken,
    });
  });
});
