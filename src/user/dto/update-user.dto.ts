import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastname?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  profile?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  number?: string;
}
