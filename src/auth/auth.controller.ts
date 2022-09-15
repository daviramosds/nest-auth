import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO, PasswordForgotDTO } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('retrieve')
  retrieve(@Req() req: Request) {
    const { user } = req;

    delete user.password;

    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('password/forgot')
  forgotPassword(@Body() passwordForgotDTO: PasswordForgotDTO) {
    return this.authService.passwordForgot(passwordForgotDTO);
  }
}
