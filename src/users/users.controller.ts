import {
  Body,
  Controller,
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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('email') email?: string,
  ) {
    const users = await this.userService.listUsers({ page, limit, email });
    return ResponseUtil.success('Users retrieved successfully', users);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: number) {
    return this.userService.getUser(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }
}
