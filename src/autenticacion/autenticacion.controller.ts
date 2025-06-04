import { Controller, Post, Body, HttpStatus, Get, UploadedFile, UseInterceptors, HttpException } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { UsuarioDto } from './dto/create-autenticacion.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { LoginDto } from './dto/login-autenticacion.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) { }

  @Post('login')
  login(@Body() userDto: LoginDto) {
    try {
      console.log(userDto)
      const user : LoginDto = {
        username : "joaco2",
        password : "joAco123456"
      }
      if (!userDto) {
        throw new HttpException('Body vacío o inválido', HttpStatus.BAD_REQUEST);
      } 
      return this.autenticacionService.login(userDto);
    }
    catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.mensaje || error.message
      }
    }
  }

  @Get('find')
  find() {
    try {
      return this.autenticacionService.findAll();
    }
    catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al traer los usuarios de la base de datos"
      }
    }
  }

  @Post('registro')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination(req, file, callback) {
        callback(null, 'public/images');
      },
      filename(req, file, callback) {
        const newName = Date.now() + '-' + file.originalname;
        callback(null, newName);
      },
    }),
    limits: {
      fileSize: 20_000,
    },
    fileFilter(req, file, callback) {
      const allowedMime = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedMime.includes(file.mimetype)) {
        return callback(new Error('Solo se permiten JPEG/PNG/GIF'), false);
      }
      callback(null, true);
    },
  }))
  create(@Body() usuario: UsuarioDto, @UploadedFile() image: Express.Multer.File) {
    return this.autenticacionService.create(usuario, image.originalname)
  }
}
