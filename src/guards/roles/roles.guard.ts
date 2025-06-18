import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const profile = request.header('profile');

    if (profile === 'admin') return true;

    throw new HttpException('No es admin', HttpStatus.UNAUTHORIZED, {
      cause: new Error(),
      description: 'Que no sos admin',
    });
  }
}
