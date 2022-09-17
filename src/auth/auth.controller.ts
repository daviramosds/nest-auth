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
import { ApiHeader, ApiHeaders, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO, PasswordForgotDTO, PasswordResetDTO } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO);
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
  passwordReset(@Body() PasswordResetDTO: PasswordResetDTO) {
    return this.authService.passwordReset(PasswordResetDTO);
  }
}
