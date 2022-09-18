import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmail2FADTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
