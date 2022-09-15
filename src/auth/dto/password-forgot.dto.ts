import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class PasswordForgotDTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
