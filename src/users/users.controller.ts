import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ParseMongoObjectIdPipe } from 'src/common/pipes/parse-mongo-object-id.pipe';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.get();
  }

  @Get(':id')
  async getUserById(@Param('id', ParseMongoObjectIdPipe) id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) {
      throw new NotFoundException({
        message: 'There are no users with the provided ID',
      });
    }
    return user;
  }

  @Post()
  createUser(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }
}
