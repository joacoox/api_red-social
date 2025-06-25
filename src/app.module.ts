import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PublicationModule } from './publication/publication.module';
import { JwtService } from './servicices/jwt/jwt.service';

@Module({
  imports: [
    AutenticacionModule,
    UsuariosModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI!), 
    PublicationModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule { }
