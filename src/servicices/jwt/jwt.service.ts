import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { ITokenPayload } from '../../models/interfaces/ITokenPayload';
import { User } from '../../models/user';

@Injectable()
export class JwtService {
  crearToken(userData: User): ITokenPayload {
    const payload = {
      ...userData,
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 60 * 60 * 1.5,
    };

    const token = sign(payload, process.env.JWT_SECRET || 'CL@V3ULTR4S3CRETA', {
      algorithm: 'HS256',
    });

    return {
      token: token,
      user: userData,
    } as ITokenPayload;
  }

  leerToken(token: string): User | null {
    try {
      return verify(
        token,
        process.env.JWT_SECRET || 'CL@V3ULTR4S3CRETA',
      ) as User;
    } catch (error) {
      return null;
    }
  }
}