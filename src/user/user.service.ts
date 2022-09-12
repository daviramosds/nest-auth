import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDTO) {
    console.log(dto);

    const { name, lastname, username, email, password } = dto;

    const user = await this.prisma.user.create({
      data: {
        name,
        lastname,

        username,
        email,
        password,

        profile: 'a',
        banner: 'a',

        verification: {
          status: false,
          token: 'a',
          TokenExpires: new Date(),
        },
      },
    });

    delete user.password;

    return user;
  }
}
