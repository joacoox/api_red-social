import { Controller, Post, Body, HttpStatus, Get, HttpException,Res, Req } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { UsuarioDto } from './dto/create-autenticacion.dto';
import { LoginDto } from './dto/login-autenticacion.dto';
import { Response } from 'express';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) { }

  @Post('login')
  async login(@Body() userDto: LoginDto, @Res() response: Response) {
    try {
      const body = await this.autenticacionService.login(userDto);
      response.status(HttpStatus.OK);
      response.json(body);
    }
    catch (error) {
      console.log(error);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error interno',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('registro')
  create(@Body() usuario: UsuarioDto) {
    return this.autenticacionService.create(usuario);
  }

  @Get('find')
  find() {
    try {
      return this.autenticacionService.findAll();
    }
    catch (error) {
      console.log(error);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error interno',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('refrescar')
  async refrescar(@Req() req: any, @Res() response: Response) {
    try {
      const authHeader = req.headers['authorization'];
      const body = this.autenticacionService.refrescar(authHeader);
      response.status(HttpStatus.OK);
      response.json(body);
    }
    catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error interno',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
