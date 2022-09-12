import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

    // login
    return user;
  }
}
