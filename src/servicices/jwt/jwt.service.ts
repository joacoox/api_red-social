import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { ITokenPayload } from '../../models/interfaces/ITokenPayload';
import { User } from '../../models/user';

@Injectable()
export class JwtService {
  crearToken(userData: User): ITokenPayload {

    const payload = {
      ...userData,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 15,
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
      console.log(error)
      return null;
    }
  }

  refrescar(token: string): ITokenPayload | null {
    let user = this.leerToken(token);
    if (user === null) return null;
    let newToken = this.crearToken(user);
    return newToken;
  }
}