import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDTO,
  DeleteUserDTO,
  UpdateEmailDTO,
  UpdatePasswordDTO,
  UpdateUserDTO,
  Verify2FADTO,
  VerifyUserDTO,
} from './dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private nodemailer: NodemailerService,
  ) {}

  validateUser(user: User) {
    if (!user) {
      // user doest not exist
      throw new NotFoundException('User does not exist');
    }

    if (!user.verification.status) {
      throw new UnauthorizedException('This user is not verified');
    }
  }

  async create(dto: CreateUserDTO, test: boolean) {
    const { name, lastname, username, email, password } = dto;

    // 0.338ms
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 2); // add 2 hours from now

    // 226ms
    const usernameExist = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (usernameExist) throw new ConflictException('Username already exist');

    // 22ms
    const emailExist = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (emailExist) throw new ConflictException('Email already exist');

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
            secret: '',
          },
        },
      },
    });

    this.nodemailer.sendMail({
      to: `<${email}>`,
      subject: 'Account Created',
      template: 'create-user',
      params: {
        name,
        email,
        verificationToken,
      },
    });

    if (test) {
      return { message: 'User created', token: verificationToken, user: user };
    }

    return { message: 'User created' };
  }

  async verify(dto: VerifyUserDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isTokenExpired = new Date() > user.verification.tokenExpires;

    if (isTokenExpired) throw new UnauthorizedException('Invalid Token');

    if (!bcrypt.compareSync(dto.token, user.verification.token)) {
      throw new UnauthorizedException('Invalid Token');
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

    this.nodemailer.sendMail({
      subject: 'Account Verified',
      to: user.email,
      template: 'verify-user',
      params: {
        name: user.name,
        email: user.email,
      },
    });

    return { message: 'User verified' };
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

    this.nodemailer.sendMail({
      to: `<${user.email}>`,
      subject: 'Account Deleted',
      template: 'delete-user',
      params: {
        name: user.name,
        email: user.email,
      },
    });

    return { message: 'User deleted' };
  }

  async enable2FA(user: User, type: string, test?: boolean) {
    const $2fa = user.twoFactorAuthentication;

    if (type === 'email') {
      if ($2fa.email.enabled) {
        throw new BadRequestException('Email 2FA is already enabled');
      }

      const token = String(Math.floor(10000 + Math.random() * 90000));

      const tokenExpires = new Date();
      tokenExpires.setHours(tokenExpires.getHours() + 2); // add 2 hours from now

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          twoFactorAuthentication: {
            update: {
              email: {
                enabled: false,
                token: bcrypt.hashSync(token, 5),
                tokenExpires,
              },
            },
          },
        },
      });

      this.nodemailer.sendMail({
        to: `<${user.email}>`,
        subject: 'Enable 2FA',
        template: 'enable-2fa',
        params: {
          name: user.name,
          email: user.email,
          method: type,
        },
      });

      if (test) return { message: 'done', token: token };

      return { message: 'done' };
    }

    if (type == 'totp') {
      if ($2fa.totp.enabled)
        throw new BadRequestException('TOTP 2FA is already enabled');

      const secret = authenticator.generateSecret();

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          twoFactorAuthentication: {
            update: {
              totp: {
                enabled: false,
                secret: secret,
              },
            },
          },
        },
      });

      this.nodemailer.sendMail({
        to: `<${user.email}>`,
        subject: 'Enable 2FA',
        template: 'enable-2fa',
        params: {
          name: user.name,
          email: user.email,
          method: type,
        },
      });

      if (test) return { message: 'done', secret: secret };

      return { message: 'done' };
    }

    throw new BadRequestException();
  }

  async verify2FA(user: User, type: string, dto: Verify2FADTO) {
    const { token } = dto;

    if (type != 'email' && type != 'totp') {
      throw new BadRequestException('Invalid type');
    }

    if (type == 'email') {
      const $2fa = user.twoFactorAuthentication.email;

      if (!$2fa.token) throw new UnauthorizedException('Invalid token');

      const isTokenExpired = new Date() > $2fa.tokenExpires;

      if (isTokenExpired) throw new UnauthorizedException('Invalid token');

      if (!bcrypt.compareSync(token, $2fa.token)) {
        throw new UnauthorizedException('Invalid token');
      }

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          twoFactorAuthentication: {
            update: {
              [type]: {
                enabled: true,
                token: $2fa.token,
                tokenExpires: new Date(),
              },
            },
          },
        },
      });
    }

    if (type == 'totp') {
      const $2fa = user.twoFactorAuthentication.totp;
      if (!$2fa.secret) throw new UnauthorizedException('Invalid token');

      if (
        !authenticator.verify({
          token,
          secret: user.twoFactorAuthentication.totp.secret,
        })
      ) {
        throw new UnauthorizedException('Invalid token');
      }

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          twoFactorAuthentication: {
            update: {
              totp: {
                enabled: true,
                secret: $2fa.secret,
              },
            },
          },
        },
      });
    }

    return { message: `2FA with ${type} is now enabled` };
  }

  async disable2FA(user: User, type: string) {
    if (type != 'email' && type != 'totp') throw new BadRequestException();

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFactorAuthentication: {
          update: {
            [type]: {
              update: {
                enabled: false,
              },
            },
          },
        },
      },
    });

    return {
      message: `2FA with ${type} is disabled`,
    };
  }

  async updateEmail(user: User, dto: UpdateEmailDTO) {
    const { email, password } = dto;

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Password is incorrect');
    }

    await this.prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        email: email,
      },
    });

    return { message: `email updated to ${email}` };

    // TODO: send email
  }

  async updatePassword(user: User, dto: UpdatePasswordDTO) {
    const { newPassword, password } = dto;

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const passwordHash = bcrypt.hashSync(newPassword, 5);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: passwordHash,
      },
    });

    return { message: `Your password was updated` };

    // TODO: send email
  }

  async updateUser(user: User, dto: UpdateUserDTO) {
    this.validateUser(user);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: dto,
    });

    return { message: 'user updated' };
  }
}
