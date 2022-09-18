import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, NodemailerService],
})
export class UserModule {}
