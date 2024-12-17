import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseUtil } from 'src/utils/response.util';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.userService.register(registerUserDto);
    return ResponseUtil.created('User Created Successfully', user);
  }

  @UseGuards(AuthGuard)
  @Get()
  async listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('email') email?: string,
  ) {
    const numericPage = Number(page);
    const numericLimit = Number(limit);
    const users = await this.userService.listUsers({
      page: numericPage,
      limit: numericLimit,
      email,
    });
    return ResponseUtil.success('Users retrieved successfully', users);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    return this.userService.getUser(numericId);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const numericId = parseInt(id, 10);
    return this.userService.updateUser(numericId, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    return this.userService.deleteUser(+numericId);
  }
}
