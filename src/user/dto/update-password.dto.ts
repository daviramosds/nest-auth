import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
