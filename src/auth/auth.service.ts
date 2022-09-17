import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO, PasswordForgotDTO, PasswordResetDTO } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(dto: LoginDTO) {
    const { username, password } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (!user) {
      // user doest not exist
      throw new NotFoundException('User does not exist');
    }

    if (!user.verification.status) {
      throw new UnauthorizedException('This user is not verified');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const payload = { sub: user.id };

    return {
      access_token: this.jwt.sign(payload),
    };
  }

  async retrieve(token: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: token,
      },
    });

    delete user.password;

    return user;
  }

  async passwordForgot(dto: PasswordForgotDTO) {
    const { username } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (!user) {
      // user doest not exist
      throw new NotFoundException('User does not exist');
    }

    if (!user.verification.status) {
      throw new UnauthorizedException('This user is not verified');
    }

    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 2);

    await this.prisma.user.update({
      where: {
        username: username,
      },
      data: {
        passwordReset: {
          token: String(Math.floor(10000 + Math.random() * 90000)),
          tokenExpires: tokenExpires,
        },
      },
    });

    return { message: 'OK' };
  }

  async passwordReset(dto: PasswordResetDTO) {
    const { username, token, password } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (!user) {
      // user doest not exist
      throw new NotFoundException('User does not exist');
    }

    if (!user.verification.status) {
      throw new UnauthorizedException('This user is not verified');
    }

    const isTokenExpired = new Date() > user.passwordReset.tokenExpires;

    if (isTokenExpired)
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);

    if (user.passwordReset.token != token) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    await this.prisma.user.update({
      where: {
        username: username,
      },
      data: {
        password: bcrypt.hashSync(password, 5),
      },
    });

    return { message: 'OK' };
  }
}
