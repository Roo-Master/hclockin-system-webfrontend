import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(email: string, password: string) {
    // TODO: Implement actual login
    return { 
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 900
    };
  }

  async verifyToken(token: string) {
    return { userId: 'mock-user', email: 'test@test.com' };
  }
}
