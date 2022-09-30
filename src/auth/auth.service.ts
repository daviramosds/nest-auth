import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as geoip from 'geoip-lite';
import { authenticator } from 'otplib';
import { UserService } from 'src/user/user.service';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  Login2FADTO,
  LoginDTO,
  PasswordForgotDTO,
  PasswordResetDTO,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private nodemailer: NodemailerService,
    private config: ConfigService,
    private userService: UserService,
  ) {}

  async signJwt(payload: { sub: string }, ip: string): Promise<string> {
    const jwt = await this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '1h',
    });

    const ipInfo = await geoip.lookup(ip);
    // const ipInfo = await geoip.lookup(ip);

    await this.prisma.jwt.create({
      data: {
        jwt: jwt,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        payload: this.jwt.decode(jwt),
        device: {
          ip: ip,
          location: {
            contry: ipInfo.country,
            region: ipInfo.region,
          },
        },
      },
    });

    return jwt;
  }

  async login(dto: LoginDTO, ip: string, test?: boolean) {
    const { username, password } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    this.userService.validateUser(user);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const $2fa = user.twoFactorAuthentication;
    const { twoFactor } = dto;

    if (!twoFactor && ($2fa.email.enabled || $2fa.totp.enabled)) {
      const types2FA = [];

      if ($2fa.email.enabled) types2FA.push('email');
      if ($2fa.totp.enabled) types2FA.push('totp');

      throw new BadRequestException({
        message: 'Please provide a twoFactor',
        twoFactor: types2FA,
      });
    }

    if (twoFactor === 'email') {
      const token = String(Math.floor(10000 + Math.random() * 90000));

      const tokenExpires = new Date();
      tokenExpires.setHours(tokenExpires.getHours() + 2); // add 2 hours from now

      await this.prisma.user.update({
        where: {
          username: username,
        },
        data: {
          twoFactorAuthentication: {
            update: {
              email: {
                enabled: user.twoFactorAuthentication.email.enabled,
                token: bcrypt.hashSync(token, 5),
                tokenExpires: tokenExpires,
              },
            },
          },
        },
      });

      this.nodemailer.sendMail({
        to: `<${user.email}>`,
        subject: '2FA CODE',
        body: [
          `<div style="font-family: sans-serif; font-size: 16px; color: #111;">`,
          `<p>Hello ${user.name}</p>`,
          `<p>2FA CODE</p>`,
          `<h1>${token}</h1>`,
          `</div>`,
        ].join('\n'),
      });

      if (test) return { message: 'To continue use email 2fa', token: token };

      return { message: 'To continue use email 2fa' };
    }

    if (twoFactor === 'totp') {
      return { twoFactor: 'totp' };
    }

    const jwt = await this.signJwt({ sub: user.id }, ip);

    return {
      access_token: jwt,
    };
  }

  async login2FA(dto: Login2FADTO, type: string, ip: string) {
    const { username, password, token } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    this.userService.validateUser(user);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const $2fa = user.twoFactorAuthentication;

    if (type === 'email') {
      const isTokenExpired = new Date() > $2fa.email.tokenExpires;

      if (isTokenExpired) throw new UnauthorizedException('Invalid token');

      if (!bcrypt.compareSync(token, $2fa.email.token)) {
        throw new UnauthorizedException('Token is incorrect');
      }

      await this.prisma.user.update({
        where: {
          username: username,
        },
        data: {
          twoFactorAuthentication: {
            update: {
              email: {
                enabled: $2fa.email.enabled,
                token: '',
                tokenExpires: new Date(),
              },
            },
          },
        },
      });
    }

    if (type === 'totp') {
      if (!$2fa.totp.secret) throw new UnauthorizedException('Invalid token');

      if (
        !authenticator.verify({
          token,
          secret: user.twoFactorAuthentication.totp.secret,
        })
      ) {
        throw new UnauthorizedException('Invalid token');
      }
    }

    const jwt = await this.signJwt({ sub: user.id }, ip);

    return {
      access_token: jwt,
    };
  }

  async retrieve(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    delete user.password;

    return user;
  }

  async passwordForgot(dto: PasswordForgotDTO, test?: boolean) {
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

    const token = String(Math.floor(10000 + Math.random() * 90000));

    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 2);

    await this.prisma.user.update({
      where: {
        username: username,
      },
      data: {
        passwordReset: {
          token: token,
          tokenExpires: tokenExpires,
        },
      },
    });

    if (test) return { message: 'OK', token: token };
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
