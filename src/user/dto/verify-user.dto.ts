import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyUserDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
