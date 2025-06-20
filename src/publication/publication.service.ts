import { Injectable, NotFoundException, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { Publication } from './schema/publication';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/autenticacion/schemas/user';
import { ROLES } from 'src/helpers/roles.consts';
import { CreateCommentDto } from './dto/create-comment.dto';


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
      filter.userId = userId;
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
        .populate({
          path: 'userId',
          select: '-password -email',
        })
        .populate({
          path: 'comments.userId',
          select: '-createdAt',
        })
        .exec(),
      this.publicationModel.countDocuments(filter),
    ]);

    results.forEach((publication: Publication & { comments: { createdAt?: Date }[] }) => {
      if (publication.comments && Array.isArray(publication.comments)) {
        publication.comments.sort(
          (a: { createdAt?: Date }, b: { createdAt?: Date }) =>
            (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        );
      }
    });

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

  async addComment(
    publicationId: string,
    dto: CreateCommentDto,
    id: string
  ): Promise<Publication> {

    const publication = await this.publicationModel.findById(publicationId);
    if (!publication) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Publicación no encontrada',
      }, HttpStatus.NOT_FOUND);
    }
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Usuario no encontrado',
      }, HttpStatus.NOT_FOUND);
    }

    const comment = {
      userId: new Types.ObjectId(id),
      text: dto.text,
      createdAt: new Date(),
    };
    publication.comments.push(comment);

    await publication.save();

    await publication.populate({
      path: 'comments.userId',
      select: '-createdAt',
    });
    publication.comments.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    return publication;
  }

  async removeComment(
    publicationId: string,
    commentId: string,
    userId: string,
  ): Promise<Publication> {
    const publication = await this.publicationModel.findById(publicationId);
    if (!publication) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Publicación no encontrada',
      }, HttpStatus.NOT_FOUND);
    }


    const index = publication.comments.findIndex(
      c => c.userId.toString() === commentId,
    );
    if (index === -1) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Comentario no encontrado',
      }, HttpStatus.NOT_FOUND);
    }

    const comment = publication.comments[index];
    const userDba = await this.userModel.findById(comment.userId);

    if (comment.userId.toString() !== userId || userDba?.role !== ROLES.ADMIN) {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'No tenés permiso para eliminar este comentario',
      }, HttpStatus.UNAUTHORIZED);
    }

    publication.comments.splice(index, 1);
    await publication.save();
    return publication;
  }

}
