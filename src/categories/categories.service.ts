import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // List categories
  async listCategories(query: {
    page?: number;
    limit?: number;
    name?: string;
  }) {
    const { page = 1, limit = 10, name } = query;
    if (page < 1 || limit < 1) {
      throw new Error('Page and limit must be greater than 0');
    }

    const where: any = {};
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;
    const take = limit;

    try {
      const total = await this.prisma.category.count({ where });

      if (total === 0) {
        return {
          pagination: {
            total,
            page,
            limit,
            totalPages: 0,
          },
          data: [],
        };
      }

      const categories = await this.prisma.category.findMany({
        where,
        skip,
        take,
        include: {
          products: true,
        },
      });
      return {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: categories,
      };
    } catch (error) {
      console.error('Error in get categories:', error.message, error);
      throw new Error('Internal server error. Please try again later.');
    }
  }

  // Create a new category
  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      return this.prisma.category.create({
        data: createCategoryDto,
      });
    } catch (error) {
      console.error('Error in create categories:', error.message, error);
      throw new Error('Internal server error. Please try again later.');
    }
  }

  // Update an existing category
  async updateCategory(updateCategoryDto: UpdateCategoryDto) {
    try {
      const { id, ...updatedData } = updateCategoryDto;

      const parsedId = Number(id);
      if (isNaN(parsedId)) {
        throw new BadRequestException('Invalid or missing ID');
      }
      const category = await this.prisma.category.findUnique({
        where: { id: parsedId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      return await this.prisma.category.update({
        where: { id: parsedId },
        data: updatedData,
      });
    } catch (error) {
      console.error('Error in update categories:', error.message, error);
      throw new Error('Internal server error. Please try again later.');
    }
  }

  // Delete a category
  async deleteCategory(id: number) {
    const products = await this.prisma.product.findMany({
      where: { categoryId: id },
    });
    if (products.length > 0) {
      throw new BadRequestException(
        `Category with ID ${id} cannot be deleted because it is associated with products.`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
