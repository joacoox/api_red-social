import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ROLES } from '../helpers/roles.consts';
import { AuthorizedGuard } from '../guards/authorized/authorized.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles/roles.guard';
import { UsuariosService } from './usuarios.service';
import { CreateUserDto } from './dto/create-usuario.dto';

@Controller('usuarios')
@UseGuards(AuthorizedGuard, RolesGuard)
@Roles(ROLES.ADMIN)
export class UsuariosController {
  constructor(private readonly usersService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Delete(':id')
  disable(@Param('id') id: string) {
    return this.usersService.disable(id);
  }

  @Post(':id/enable')
  enable(@Param('id') id: string) {
    return this.usersService.enable(id);
  }
}
