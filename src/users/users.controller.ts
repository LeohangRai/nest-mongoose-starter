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
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
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

  @Patch(':id')
  async updateUser(
    @Param('id', ParseMongoObjectIdPipe) id: string,
    @Body() data: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(id, data);
    if (!updatedUser)
      throw new NotFoundException({
        message: 'There are no users with the provided ID',
      });
    return updatedUser;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseMongoObjectIdPipe) id: string) {
    const deletedUser = await this.usersService.delete(id);
    if (!deletedUser) {
      throw new NotFoundException({
        message: 'There are no users with the provided ID',
      });
    }
  }
}
