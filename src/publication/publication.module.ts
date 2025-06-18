import { Module } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { PublicationController } from './publication.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Publication, PublicationSchema } from './schema/publication';
import { UserSchema } from 'src/autenticacion/schemas/user';
import { User } from 'src/models/user';
import { JwtService } from 'src/servicices/jwt/jwt.service';

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
