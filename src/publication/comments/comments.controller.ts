import { Controller, Post, Body, Param, Put, Req, UseGuards, Get, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthorizedGuard } from '../../guards/authorized/authorized.guard';
import { Publication } from '../schema/publication';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

   @Post(':id/comments')
  @UseGuards(AuthorizedGuard)
  async commentOnPost(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any
  ): Promise<Publication> {
    return this.commentsService.addComment(id, createCommentDto, req.user._id);
  }

  @Put(':id/comments')
  @UseGuards(AuthorizedGuard)
  async deleteCommentOnPost(
    @Param('id') idPost: string,
    @Body() idComment : string,
    @Req() req: any
  ) {
    return this.commentsService.removeComment(idPost,idComment,req.user._id);
  }

  @Get(':id/comments/findAll')
  @UseGuards(AuthorizedGuard)
  async findAllComments(
    @Param('id') id: string,
    @Req() req: any,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.findAllComments(id, Number(limit) || 0);
  }
}
