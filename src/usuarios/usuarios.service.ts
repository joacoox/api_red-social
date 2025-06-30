import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../autenticacion/schemas/user';
import { CreateUserDto } from './dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async create(user: CreateUserDto) {
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
      return {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        surname: newUser.surname,
        dateOfBirth: newUser.dateOfBirth,
        description: newUser.description,
        image: newUser.image,
        role: newUser.role,
      };

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

  async disable(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, { filed: true }, { new: true });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async enable(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, { filed: false }, { new: true });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
}
