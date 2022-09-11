import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDTO) {
    console.log(dto);

    const { name, lastname, username, email, password } = dto;

    await this.prisma.user.create({
      data: {
        name,
        lastname,

        username,
        email,
        password: '',

        profile: '',
        banner: '',

        verification: {
          status: false,
          token: '',
          TokenExpires: new Date(),
        },
      },
    });
  }
}
