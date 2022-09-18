import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO, VerifyUserDTO } from './dto';
import { DeleteUserDTO } from './dto/delete-user.dto';
import { User } from '@prisma/client';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private nodemailer: NodemailerService,
  ) {}

  async create(dto: CreateUserDTO) {
    const { name, lastname, username, email, password } = dto;

    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 2); // add 2 hours from now

    const usernameExist = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (usernameExist) {
      throw new HttpException('Username already exist', HttpStatus.CONFLICT);
    }

    const emailExist = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (emailExist) {
      throw new HttpException('Email already exist', HttpStatus.CONFLICT);
    }

    const verificationToken = String(Math.floor(10000 + Math.random() * 90000));

    const user = await this.prisma.user.create({
      data: {
        name,
        lastname,

        username,
        email,
        password: bcrypt.hashSync(password, 5), // hashing the password

        profile: `https://source.boringavatars.com/beam/30/${username}?colors=1F271B,FFE092,FFA14C,FFC01F,EE964B`,
        banner: `https://source.boringavatars.com/beam/30/${name}-${lastname}?colors=1F271B,FFE092,FFA14C,FFC01F,EE964B`,

        verification: {
          status: false,
          token: bcrypt.hashSync(verificationToken, 5),
          tokenExpires: tokenExpires,
        },

        twoFactorAuthentication: {
          email: {
            enabled: false,
            token: '',
            tokenExpires: new Date(),
          },
          totp: {
            enabled: false,
            token: '',
            tokenExpires: new Date(),
          },
        },
      },
    });

    delete user.password;

    this.nodemailer.sendMail({
      to: `<${email}>`,
      subject: 'Account Created',
      body: [
        `<div style="font-family: sans-serif; font-size: 16px; color: #111;">`,
        `<p>Hello ${name}</p>`,
        `<p>Your account ${email} was created, to be able to use your account, use the code below</p>`,
        `<h1>${verificationToken}</h1>`,
        `<p>if you have not created a account don't worry, the account will expire in few hours</p>`,
        `</div>`,
      ].join('\n'),
    });

    return user;
  }

  async verify(dto: VerifyUserDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isTokenExpired = new Date() > user.verification.tokenExpires;

    if (isTokenExpired)
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);

    if (user.verification.token != dto.token) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    await this.prisma.user.update({
      where: {
        username: dto.username,
      },
      data: {
        verification: {
          status: true,
          token: user.verification.token,
          tokenExpires: user.verification.tokenExpires,
        },
      },
    });

    return { message: 'user verified' };
  }

  async delete(user: User, dto: DeleteUserDTO) {
    if (!bcrypt.compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('Password is incorrect');
    }

    await this.prisma.user.delete({
      where: {
        username: user.username,
      },
    });

    return { message: 'User deleted' };
  }
}
