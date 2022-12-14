import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController, JwtStrategy],
  providers: [
    AuthService,
    UserService,
    PrismaService,
    JwtStrategy,
    NodemailerService,
  ],
})
export class AuthModule {}
