import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create() {
    await this.prisma.user.create({
      data: {
        name: '',
        lastname: '',

        username: '',
        email: '',
        password: '',

        profile: '',
        banner: '',

        verification: {
          status: false,
          token: '',
          TokenExpires: '',
        },
      },
    });
  }
}
