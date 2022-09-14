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
import { LoginDTO } from './dto/login.dto';

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace Express {
//     interface User {
//       sub: string;
//       iat: number;
//       exp: number;
//     }
//   }
// }

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
    const payload = req.user;
    return this.authService.retrieveData(payload.sub);
  }
}
