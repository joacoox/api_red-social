import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ROLES } from '../../helpers/roles.consts';
import { User } from '../../models/user';
import { Publication } from '../schema/publication';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Publication.name) private publicationModel: Model<Publication>,
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

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
      select: '-createdAt -password -email',
    });
    //publication.comments.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());

    if (Array.isArray(publication.comments)) {
      publication.comments.sort(
        (a: { createdAt?: Date }, b: { createdAt?: Date }) =>
          (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
      );
      publication.comments = publication.comments.slice(0, 3);
    }

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

  async findAllComments(postId: string, limit: number) {

    if (postId === null || postId === undefined) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        message: 'ID no valido',
      }, HttpStatus.BAD_REQUEST);
    }

    const doc = await this.publicationModel
      .findById(postId)
      .populate({
        path: 'comments.userId',
        select: '-createdAt -password -email'
      })
      .exec();

    if (!doc) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Publicacion no encontrada',
      }, HttpStatus.BAD_REQUEST);
    }

    const comments = Array.isArray(doc.comments)
      ? 
      doc.comments.sort((a, b) =>
        (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
      )
      : [];

    const sliced = (typeof limit === 'number' && limit > 0)
      ? comments.slice(0, limit)
      : comments;

    return { ...doc.toObject(), comments: sliced };
  }
}
