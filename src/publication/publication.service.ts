import { Injectable, ForbiddenException, NotFoundException, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { Publication } from './schema/publication';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/autenticacion/schemas/user';
import { ROLES } from 'src/helpers/roles.consts';


@Injectable()
export class PublicationService {

  constructor(
    @InjectModel(Publication.name) private publicationModel: Model<Publication>,
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  async create(dto: CreatePublicationDto) {
    const publication = new this.publicationModel({
      ...dto,
      userId: dto.userId,
      imageUrl: dto.image,
      filed: false
    });
    return publication.save();
  }

  async remove(id: string, user: { id: string }) {

    const publication = await this.publicationModel.findById(id);

    if (!publication) {
      throw new NotFoundException('Publication no encontrada');
    }
    const userDba = await this.userModel.findById(user.id);

    if (!userDba) {
      throw new NotFoundException('Credenciales de usuario no encontradas');
    }

    if (!(publication.userId.toString() === user.id) && !(userDba.role === ROLES.ADMIN)) {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'No tenes permisos para eliminar esta publicacion',
      }, HttpStatus.UNAUTHORIZED);
    }

    publication.filed = true;
    await publication.save();

    return { message: 'Publicacion Archivada' };
  }

  async findAll(query: {
    sortBy?: 'date' | 'likes';
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      sortBy = 'date',
      userId,
      page = 1,
      limit = 10,
    } = query;

    const offset = (page - 1) * limit;

    const filter: any = {
      filed: false
    };

    if (userId) {
      filter.user = userId;
    }

    const sort: any = {};
    if (sortBy === 'likes') {
      sort['likes'] = -1;
    } else {
      sort['createdAt'] = -1;
    }

    const [results, total] = await Promise.all([
      this.publicationModel
        .find(filter)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .exec(),
      this.publicationModel.countDocuments(filter),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      results,
    };
  }

  async likePublication(publicationId: string, userId: string) {
    const publication = await this.publicationModel.findById(publicationId);

    if (!publication) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const userDba = await this.userModel.findById(userId);

    if (!userDba) {
      throw new NotFoundException('Credenciales de usuario no encontradas');
    }
    const alreadyLiked = publication.likes.includes(userDba.id);

    if (alreadyLiked) {
      throw new BadRequestException('Ya le diste me gusta a esta publicación');
    }

    publication.likes.push(userDba.id);
    await publication.save();

    return { message: 'Me gusta agregado correctamente' };
  }

  async unlikePublication(publicationId: string, userId: string) {
    const publication = await this.publicationModel.findById(publicationId);

    if (!publication) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const userDba = await this.userModel.findById(userId);

    if (!userDba) {
      throw new NotFoundException('Credenciales de usuario no encontradas');
    }

    const index = publication.likes.indexOf(userDba.id);

    if (index === -1) {
      throw new BadRequestException('No habías dado me gusta a esta publicación');
    }

    publication.likes.splice(index, 1);
    await publication.save();

    return { message: 'Me gusta eliminado correctamente' };
  }

}
