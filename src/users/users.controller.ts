import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import mongoose from 'mongoose';
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
  async getUserById(@Param('id') id: string) {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException({
        message: 'Validation failed (BSON Object ID is expected)',
      });
    }
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
