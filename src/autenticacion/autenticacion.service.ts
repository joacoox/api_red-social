import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsuarioDto } from './dto/create-autenticacion.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user';
import { LoginDto } from './dto/login-autenticacion.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AutenticacionService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async create(user: UsuarioDto, path: string) {
    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const newUser = new this.userModel({
        ...user,
        password: hashedPassword,
        image: Date.now() + '-' + path,
      });

      return await newUser.save();
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errores = Object.values(error.errors).map((e: any) => ({
          campo: e.path,
          mensaje: e.message,
        }));
        throw new HttpException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Error de validación',
          errores,
        }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error interno',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(user : LoginDto ): Promise<User> {
    try {
      console.log("username: \n\n" , user.username)
      
      const foundUser = await this.userModel.findOne({ username: user.username });
      
      if (!foundUser) {
        throw new HttpException({
          status: HttpStatus.UNAUTHORIZED,
          message: 'Usuario o contraseña incorrectos',
        }, HttpStatus.UNAUTHORIZED);
      }

      const isPasswordValid = await bcrypt.compare(user.password, foundUser.password);
      
      if (!isPasswordValid) {
        throw new HttpException({
          status: HttpStatus.UNAUTHORIZED,
          message: 'Usuario o contraseña incorrectos',
        }, HttpStatus.UNAUTHORIZED);
      }

      return foundUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno del servidor',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find() as User[];
  }
}
