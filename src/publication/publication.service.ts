import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { Publication } from './schema/publication';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../autenticacion/schemas/user';
import { ROLES } from '../helpers/roles.consts';
import { UpdatePublicationDto } from './dto/update-publication.dto';

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

  async update(idPost: string, dto: UpdatePublicationDto) {
    const updated = await this.publicationModel.findByIdAndUpdate(
      idPost,
      {
        ...dto,
      },
      { new: true }
    ).exec();

    if (!updated) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Publicación no encontrada',
      }, HttpStatus.NOT_FOUND);
    }

    return updated;
  }

  async remove(idPost: string, userId: string ) {

    const publication = await this.publicationModel.findById(idPost);
    if (!publication) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Publication no encontrada',
      }, HttpStatus.NOT_FOUND);
    }
    const userDba = await this.userModel.findById(userId);

    if (!userDba) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Credenciales de usuario no encontradas',
      }, HttpStatus.NOT_FOUND);
    }

    if (!(publication.userId.toString() === userId) && !(userDba.role === ROLES.ADMIN)) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        message: 'No tenes permisos para eliminar esta publicacion',
      }, HttpStatus.BAD_REQUEST);
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

  const filter: any = { filed: false };
  if (userId) {
    filter.userId = userId;
  }

  let results = await this.publicationModel
    .find(filter)
    .populate({
      path: 'userId',
      select: '-password -email',
    })
    .populate({
      path: 'comments.userId',
      select: '-createdAt -password -email',
    })
    .exec();

  if (sortBy === 'likes') {
    results.sort((a, b) => (b.likes.length || 0) - (a.likes.length || 0));
  } else {
    results.sort((a, b) => (b["createdAt"].getTime() || 0) - (a["createdAt"].getTime() || 0));
  }

  const paginated = results.slice(offset, offset + limit);

  paginated.forEach(pub => {
    if (Array.isArray(pub.comments)) {
      pub.comments.sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
      );
      pub.comments = pub.comments.slice(0, 3);
    }
  });

  return {
    total: results.length,
    page,
    limit,
    totalPages: Math.ceil(results.length / limit),
    results: paginated,
  };
}

  async findOne(postId: string) {
    if (postId === null || postId === undefined) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        message: 'ID no valido',
      }, HttpStatus.BAD_REQUEST);
    }

    const response = await this.publicationModel.findById(postId)
      .select('-comments')
      .exec();

    return response;
  }

  async likePublication(publicationId: string, userId: string) {
    const publication = await this.publicationModel.findById(publicationId);

    if (!publication) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Publicación no encontrada',
      }, HttpStatus.NOT_FOUND);
    }

    const userDba = await this.userModel.findById(userId);

    if (!userDba) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Credenciales de usuario no encontradas',
      }, HttpStatus.NOT_FOUND);
    }
    const alreadyLiked = publication.likes.includes(userDba.id);

    if (alreadyLiked) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Ya le diste me gusta a esta publicación',
      }, HttpStatus.BAD_REQUEST);
    }

    publication.likes.push(userDba.id);
    await publication.save();

    return { message: 'Me gusta agregado correctamente' };
  }

  async unlikePublication(publicationId: string, userId: string) {
    const publication = await this.publicationModel.findById(publicationId);

    if (!publication) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Publicación no encontrada',
      }, HttpStatus.NOT_FOUND);
    }

    const userDba = await this.userModel.findById(userId);

    if (!userDba) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Credenciales de usuario no encontradas',
      }, HttpStatus.NOT_FOUND);
    }

    const index = publication.likes.indexOf(userDba.id);

    if (index === -1) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        message: 'No habías dado me gusta a esta publicación',
      }, HttpStatus.BAD_REQUEST);
    }

    publication.likes.splice(index, 1);
    await publication.save();

    return { message: 'Me gusta eliminado correctamente' };
  }
}
