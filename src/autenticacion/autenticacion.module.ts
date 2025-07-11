import { Module } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionController } from './autenticacion.controller';
import { UserSchema } from './schemas/user';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './schemas/user';
import { JwtService } from '../servicices/jwt/jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, JwtService],
})
export class AutenticacionModule { }
