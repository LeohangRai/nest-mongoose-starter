import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ParseMongoObjectIdPipe } from 'src/common/pipes/parse-mongo-object-id.pipe';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Get()
  getPosts() {
    return this.postsService.get();
  }

  @Get(':id')
  async getPostById(@Param('id', ParseMongoObjectIdPipe) id: string) {
    const post = await this.postsService.getPostById(id);
    if (!post) {
      throw new NotFoundException({
        message: 'There are no posts with the provided ID',
      });
    }
    return post;
  }

  @Post()
  createPost(@Body() data: CreatePostDto) {
    return this.postsService.create(data);
  }

  @Patch(':id')
  updatePost(
    @Param('id', ParseMongoObjectIdPipe) id: string,
    @Body() data: UpdatePostDto,
  ) {
    return this.postsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(@Param('id', ParseMongoObjectIdPipe) id: string) {
    return this.postsService.delete(id);
  }
}
