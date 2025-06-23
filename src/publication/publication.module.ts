import { Module } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { PublicationController } from './publication.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Publication, PublicationSchema } from './schema/publication';
import { UserSchema } from '../autenticacion/schemas/user';
import { User } from '../models/user';
import { JwtService } from '../servicices/jwt/jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publication.name, schema: PublicationSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [PublicationController],
  providers: [PublicationService, JwtService],
})
export class PublicationModule { }
