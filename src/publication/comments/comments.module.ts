import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../../autenticacion/schemas/user';
import { User } from '../../models/user';
import { Publication, PublicationSchema } from '../schema/publication';
import { JwtService } from '../../servicices/jwt/jwt.service';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Publication.name, schema: PublicationSchema },
        { name: User.name, schema: UserSchema }
      ]),
    ],
  controllers: [CommentsController],
  providers: [CommentsService, JwtService],
})
export class CommentsModule {}
