import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDTO) {
    console.log(dto);

    const { name, lastname, username, email, password } = dto;

    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 2); // add 2 hours from now

    const user = await this.prisma.user.create({
      data: {
        name,
        lastname,

        username,
        email,
        password,

        profile: `https://source.boringavatars.com/beam/30/${username}?colors=1F271B,FFE092,FFA14C,FFC01F,EE964B`,
        banner: `https://source.boringavatars.com/beam/30/${name}-${lastname}?colors=1F271B,FFE092,FFA14C,FFC01F,EE964B`,

        verification: {
          status: false,
          token: (Math.random() * (10000 - 99999) + 99999).toString(),
          tokenExpires: tokenExpires,
        },
      },
    });

    delete user.password;

    return user;
  }
}
