import { Injectable } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  async login(dto: LoginDTO) {
    return dto;
  }
}
