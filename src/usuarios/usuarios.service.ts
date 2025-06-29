import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../autenticacion/schemas/user';
import { CreateUserDto } from './dto/create-usuario.dto';


@Injectable()
export class UsuariosService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async create(dto: CreateUserDto): Promise<User> {
    const created = new this.userModel(dto);
    return created.save();
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
