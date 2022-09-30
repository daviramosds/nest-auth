import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  CreateUserDTO,
  DeleteUserDTO,
  UpdateEmailDTO,
  Verify2FADTO,
  VerifyUserDTO,
} from './dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDTO: CreateUserDTO, test?: boolean) {
    return this.userService.create(createUserDTO, test);
  }

  @Post('verify')
  verify(@Body() verifyUserDTO: VerifyUserDTO) {
    return this.userService.verify(verifyUserDTO);
  }

  @ApiBearerAuth()
  @HttpCode(204)
  @UseGuards(AuthGuard('jwt'))
  @Delete()
  delete(@Body() deleteUserDTO: DeleteUserDTO, @Req() { user }: Request) {
    return this.userService.delete(user, deleteUserDTO);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('2fa/enable/:type')
  enable2FA(@Req() req: Request, @Param('type') type) {
    return this.userService.enable2FA(req.user, type);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/verify/:type')
  async verify2FA(
    @Body() verify2FADTO: Verify2FADTO,
    @Param('type') type,
    @Req() req: Request,
  ) {
    return this.userService.verify2FA(req.user, type, verify2FADTO);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('/2fa/disable/:type')
  async disable2FA(@Req() req: Request, @Param('type') type) {
    return this.userService.disable2FA(req.user, type);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('/email')
  updateEmail(
    @Req() { user }: Request,
    @Body() updateEmailDTO: UpdateEmailDTO,
  ) {
    return this.userService.updateEmail(user, updateEmailDTO);
  }
}
