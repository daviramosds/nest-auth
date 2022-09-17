import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordForgotDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;
}
