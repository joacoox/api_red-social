import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Req, Put } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { AuthorizedGuard } from 'src/guards/authorized/authorized.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Publication } from './schema/publication';


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
  @UseGuards(AuthorizedGuard)
  @Delete(':id')
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

  @Post(':id/comments')
  @UseGuards(AuthorizedGuard)
  async commentOnPost(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any
  ): Promise<Publication> {
    return this.publicationService.addComment(id, createCommentDto, req.user._id);
  }

  @Put(':id/comments')
  @UseGuards(AuthorizedGuard)
  async deleteCommentOnPost(
    @Param('id') idPost: string,
    @Body() idComment : string,
    @Req() req: any
  ) {
    return this.publicationService.removeComment(idPost,idComment,req.user._id);
  }
}
