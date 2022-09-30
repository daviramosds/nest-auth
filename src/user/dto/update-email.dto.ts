import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmailDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;
}
