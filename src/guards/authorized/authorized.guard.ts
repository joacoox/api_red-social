import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../../servicices/jwt/jwt.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../models/user';


@Injectable()
export class AuthorizedGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, 
    @InjectModel(User.name) private userModel: Model<User>) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    const decoded = this.jwtService.leerToken(token);

    if (!decoded) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const user = await this.userModel.findById(decoded._id).exec();
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    if (user.filed === true) {
      throw new UnauthorizedException('Usuario inhabilitado, contacte con un administrador');
    }
    
    req.user = decoded;

    return true;
  }
}
