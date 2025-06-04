import { Controller, Get, UseInterceptors, Post, UploadedFile, ParseFilePipe, HttpStatus, MaxFileSizeValidator, ParseFilePipeBuilder } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
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
      fileSize: 14_000,
    },
    fileFilter(req, file, callback) {
      const allowedMime = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedMime.includes(file.mimetype)) {
        return callback(new Error('Solo se permiten JPEG/PNG/GIF'), false);
      }
      callback(null, true);
    },
  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File
  ) {
  }

}
