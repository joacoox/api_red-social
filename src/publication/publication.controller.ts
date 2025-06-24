import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Req, Put } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { AuthorizedGuard } from '../guards/authorized/authorized.guard';
import { UpdatePublicationDto } from './dto/update-publication.dto';

@Controller('publication')
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) { }

  @Post()
  @UseGuards(AuthorizedGuard)
  async create(
    @Body() dto: CreatePublicationDto,
    @Req() req: any
  ) {
    dto.userId = req.user._id;
    return this.publicationService.create(dto);
  }

  @Put(":id")
  @UseGuards(AuthorizedGuard)
  async update(
    @Body() dto: UpdatePublicationDto,
    @Param('id') idPost: string
  ) {
    return this.publicationService.update(idPost ,dto);
  }

  @Delete(':id')
  @UseGuards(AuthorizedGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.publicationService.remove(id, req.user._id);
  }

  @Get()
  @UseGuards(AuthorizedGuard)
  findAll(
    @Query('sortBy') sortBy?: 'date' | 'likes',
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.publicationService.findAll({
      sortBy,
      userId,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Get(':id')
  @UseGuards(AuthorizedGuard)
  findOne(@Param('id') id: string,) {
    return this.publicationService.findOne(id);
  }

  @Post(':id/like')
  @UseGuards(AuthorizedGuard)
  likePublication(
    @Param('id') id: string,
    @Req() req: any
  ) {
    return this.publicationService.likePublication(id, req.user._id);
  }

  @Delete(':id/like')
  @UseGuards(AuthorizedGuard)
  unlikePublication(
    @Param('id') id: string,
    @Req() req: any
  ) {
    return this.publicationService.unlikePublication(id, req.user._id);
  }
}
