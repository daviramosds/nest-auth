import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastname?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  profile?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number?: string;
}
