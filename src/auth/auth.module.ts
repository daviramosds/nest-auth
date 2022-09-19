import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';

@Module({
  imports: [
    JwtModule.register({
      secret: '123',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, JwtStrategy],
  providers: [AuthService, PrismaService, JwtStrategy, NodemailerService],
})
export class AuthModule {}
