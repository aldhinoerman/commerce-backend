import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<void> {
    const { email, password } = registerUserDto;
    const hashedPassword = await this.authService.hashPassword(password);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  }

  async listUsers(query: { page?: number; limit?: number; email?: string }) {
    const { page = 1, limit = 10, email } = query;

    const where: any = {};
    if (email) {
      where.title = { contains: email, mode: 'insensitive' };
    }

    const total = await this.prisma.user.count({ where });
    const users = await this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: users,
    };
  }

  async getUser(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true, updatedAt: true },
    });
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const updateData: any = {};
    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.password) {
      updateData.password = await this.authService.hashPassword(
        updateUserDto.password,
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}
