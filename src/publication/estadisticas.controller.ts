import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthorizedGuard } from '../guards/authorized/authorized.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles/roles.guard';
import { ROLES } from '../helpers/roles.consts';
import { EstadisticasService } from "./estadisticas.service";

@Controller('estadisticas')
@UseGuards(AuthorizedGuard, RolesGuard)
@Roles(ROLES.ADMIN)
export class EstadisticasController {

    constructor(private readonly estadisticas: EstadisticasService) { }

    // Cantidad de publicaciones realizadas por cada usuario en un lapso de
    // tiempo. El lapso de tiempo debe poder ser elegido.
    // ■ Cantidad de comentarios realizados en un lapso de tiempo. El lapso de
    // tiempo debe poder ser elegido.
    // ■ Cantidad de comentarios en cada publicación en un lapso de tiempo.El
    // lapso de tiempo debe poder ser elegido.

    @Get('publicaciones')
    async getPublicacionesPorUsuario(
        @Query('from') from: string,
        @Query('to') to: string
    ) {
        const response = await this.estadisticas.getPublicacionesPorUsuario(from, to);
        return response;
    }

    @Get('comentarios')
    getCantidadTotalComentarios(
        @Query('from') from: string,
        @Query('to') to: string
    ) {
        return this.estadisticas.getCantidadTotalComentarios(from, to);
    }

    @Get('comentarios-por-publicacion')
    getComentariosPorPublicacion(
        @Query('from') from: string,
        @Query('to') to: string
    ) {
        return this.estadisticas.getComentariosPorPublicacion(from, to);
    }

}