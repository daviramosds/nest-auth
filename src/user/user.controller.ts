import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  CreateUserDTO,
  VerifyUserDTO,
  VerifyEmail2FADTO,
  DeleteUserDTO,
} from './dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDTO: CreateUserDTO) {
    return this.userService.create(createUserDTO);
  }

  @Post('verify')
  async verify(@Body() verifyUserDTO: VerifyUserDTO) {
    return this.userService.verify(verifyUserDTO);
  }

  @HttpCode(204)
  @UseGuards(AuthGuard('jwt'))
  @Delete()
  async delete(@Body() deleteUserDTO: DeleteUserDTO, @Req() { user }: Request) {
    return this.userService.delete(user, deleteUserDTO);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/email/enable')
  async enableEmail2FA(@Req() req: Request) {
    return this.userService.enableEmail2FA(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/email/verify')
  async verifyEmail2FA(
    @Body() verifyEmail2FADTO: VerifyEmail2FADTO,
    @Req() req: Request,
  ) {
    return this.userService.verifyEmail2FA(req.user, verifyEmail2FADTO);
  }
}
