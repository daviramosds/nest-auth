import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDTO, VerifyUserDTO } from './dto';
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
}
