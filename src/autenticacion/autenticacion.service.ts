import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsuarioDto } from './dto/create-autenticacion.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user';
import { LoginDto } from './dto/login-autenticacion.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '../servicices/jwt/jwt.service';
import { ITokenPayload } from '../models/interfaces/ITokenPayload';

@Injectable()
export class AutenticacionService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, private jwt : JwtService ) { }

  async create(user: UsuarioDto) : Promise<ITokenPayload> {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new this.userModel({
        ...user,
        password: hashedPassword,
      });
      await newUser.save();
      
      if (!newUser) {
        throw new HttpException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Error al crear el usuario',
        }, HttpStatus.BAD_REQUEST);
      }
      return this.jwt.crearToken({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        surname: newUser.surname,
        dateOfBirth: newUser.dateOfBirth,
        description: newUser.description,
        image: newUser.image,
        role: newUser.role,
      });

    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error.name === 'ValidationError') {
        const errores = Object.values(error.errors).map((e: any) => ({
          campo: e.path,
          mensaje: e.message,
        }));
        throw new HttpException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Error, se ingresaron datos invalidos',
          errores,
        }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error interno',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(user: LoginDto) : Promise<ITokenPayload> {
    try {
      const foundUser = await this.userModel.findOne({ username: user.username });

      if (!foundUser) {
        throw new HttpException({
          status: HttpStatus.UNAUTHORIZED,
          message: ('No se encontro un usuario asociado con el username: ' + user.username),
        }, HttpStatus.UNAUTHORIZED);
      }

      const isPasswordValid = await bcrypt.compare(user.password, foundUser.password);

      if (!isPasswordValid) {
        throw new HttpException({
          status: HttpStatus.UNAUTHORIZED,
          message: 'Contraseña incorrecta',
        }, HttpStatus.UNAUTHORIZED);
      }

      return this.jwt.crearToken({
        _id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        name: foundUser.name,
        surname: foundUser.surname,
        dateOfBirth: foundUser.dateOfBirth,
        description: foundUser.description,
        image: foundUser.image,
        role: foundUser.role,
      });

    } catch (error) {
      if (error instanceof HttpException) throw error;

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
