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
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from 'src/auth/dtos/register-user.dto';
import { ParseMongoObjectIdPipe } from 'src/common/pipes/parse-mongo-object-id.pipe';
import { GetUsersQueryDto } from './dtos/get-users.query.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.get(query);
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
  createUser(@Body() data: RegisterUserDto) {
    return this.usersService.create(data);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseMongoObjectIdPipe) id: string,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseMongoObjectIdPipe) id: string) {
    return this.usersService.delete(id);
  }
}
