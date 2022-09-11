import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private prisma: PrismaService,
  ) {}

  async create(dto: CreateUserDTO) {
    console.log(dto);

    const { name, lastname, username, email, password } = dto;

    await this.userModel.create({
      name,
      lastname,

      username,
      email,
      password: 'a',

      profile: 'a',
      banner: 'a',

      verification: {
        status: false,
        token: 'a',
        TokenExpires: new Date(),
      },
    });
  }
}
