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
import { CreateUserDTO, VerifyUserDTO } from './dto';
import { DeleteUserDTO } from './dto/delete-user.dto';
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
}
