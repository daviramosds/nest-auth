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
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO, PasswordForgotDTO, PasswordResetDTO } from './dto';
import { LoginEmail2FA } from './dto/login-email-2fa.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDTO: LoginDTO, @Req() req: Request) {
    return this.authService.login(loginDTO, req.socket.remoteAddress);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login/2fa/email')
  loginEmail2FA(@Body() loginEmail2FA: LoginEmail2FA, @Req() req: Request) {
    return this.authService.loginEmail2FA(
      loginEmail2FA,
      req.socket.remoteAddress,
    );
  }

  @ApiHeader({
    name: 'Authorization',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('')
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

  @HttpCode(HttpStatus.OK)
  @Post('password/reset')
  passwordReset(@Body() passwordResetDTO: PasswordResetDTO) {
    return this.authService.passwordReset(passwordResetDTO);
  }
}
