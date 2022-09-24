import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO, PasswordForgotDTO, PasswordResetDTO } from './dto';
import { Login2FADTO } from './dto/login-2fa.dto';

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
  @Post('login/2fa/:type')
  login2FA(
    @Body() login2FADTO: Login2FADTO,
    @Req() req: Request,
    @Param('type') type,
  ) {
    return this.authService.login2FA(
      login2FADTO,
      type,
      req.socket.remoteAddress,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
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
