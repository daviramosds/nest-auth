import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Payload } from '@prisma/client';
import { authenticator } from 'otplib';
import { AuthService } from '../src/auth/auth.service';
import { NodemailerService } from '../src/nodemailer/nodemailer.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserController } from '../src/user/user.controller';
import { UserService } from '../src/user/user.service';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const createdUser = {
    name: faker.name.firstName(),
    lastname: faker.name.lastName(),
    username: faker.internet.userName(),
    email: 'test@companymail.com',
    password: faker.internet.password(),
  };

  let verificationToken;
  let passwordResetToken;

  let loginJWT;

  let verifyEmail2FAToken;
  let verifyTOTP2FASecret;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [UserController],
      providers: [UserService, PrismaService, NodemailerService, ConfigService],
    }).compile();

    userService = moduleFixture.get<UserService>(UserService);
    authService = moduleFixture.get<AuthService>(AuthService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should create a user', async () => {
    const { token } = await userService.create(createdUser, true);
    verificationToken = token;
  });

  it('shoud verify the created user', async () => {
    await userService.verify({
      username: createdUser.username,
      token: verificationToken,
    });
  });

  it('should login the user', async () => {
    const { access_token } = await authService.login(
      { username: createdUser.username, password: createdUser.password },
      await faker.internet.ipv4(),
    );

    loginJWT = access_token;
  });

  it('shoud enable email 2FA', async () => {
    const user = await prismaService.user.findFirst({
      where: {
        email: createdUser.email,
      },
    });

    const { token } = await userService.enable2FA(user, 'email', true);
    verifyEmail2FAToken = token;
  });

  it('shoud verify email 2FA', async () => {
    const user = await prismaService.user.findFirst({
      where: {
        email: createdUser.email,
      },
    });

    await userService.verify2FA(user, 'email', {
      username: createdUser.username,
      token: verifyEmail2FAToken,
    });
  });

  it('should login with email 2FA', async () => {
    const { token } = await authService.login(
      {
        username: createdUser.username,
        password: createdUser.password,
        twoFactor: 'email',
      },
      await faker.internet.ipv4(),
      true,
    );

    await authService.login2FA(
      {
        username: createdUser.username,
        password: createdUser.password,
        token: token,
      },
      'email',
      await faker.internet.ipv4(),
    );
  });

  it('should disable email 2FA', async () => {
    const user = await prismaService.user.findFirst({
      where: {
        email: createdUser.email,
      },
    });

    await userService.disable2FA(user, 'email');
  });

  it('shoud enable totp 2FA', async () => {
    const user = await prismaService.user.findFirst({
      where: {
        email: createdUser.email,
      },
    });

    const { secret } = await userService.enable2FA(user, 'totp', true);
    verifyTOTP2FASecret = secret;
  });

  it('shoud verify totp 2FA', async () => {
    const user = await prismaService.user.findFirst({
      where: {
        email: createdUser.email,
      },
    });

    const token = authenticator.generate(verifyTOTP2FASecret);

    await userService.verify2FA(user, 'totp', {
      username: createdUser.username,
      token: token,
    });
  });

  it('should login with totp 2FA', async () => {
    const token = authenticator.generate(verifyTOTP2FASecret);

    await authService.login2FA(
      {
        username: createdUser.username,
        password: createdUser.password,
        token: token,
      },
      'totp',
      await faker.internet.ipv4(),
    );
  });

  it('should disable email 2FA', async () => {
    const user = await prismaService.user.findFirst({
      where: {
        email: createdUser.email,
      },
    });

    await userService.disable2FA(user, 'totp');
  });

  it('should get the user data', async () => {
    const payload: Payload = await jwtService.verify(loginJWT, {
      secret: process.env.JWT_SECRET,
    });

    await authService.retrieve(payload.sub);
  });

  it('should start password forgot', async () => {
    const { token } = await authService.passwordForgot(
      {
        username: createdUser.username,
      },
      true,
    );

    passwordResetToken = token;
  });

  it('should delete the user', async () => {
    const user = await prismaService.user.findFirst({
      where: {
        email: createdUser.email,
      },
    });

    await userService.delete(user, { password: createdUser.password });
  });

  /*
    TODO:
    - get user data
    - password forgot
    - password reset
  */
});
