import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VariantsService {
  constructor(private readonly prisma: PrismaService) {}

  //   Get all Variants
  async listVariants(query: {
    page?: number;
    limit?: number;
    sku?: string;
    productId?: number;
  }) {
    const { page = 1, limit = 10, sku, productId } = query;

    if (page < 1 || limit < 1) {
      throw new Error('Page and limit must be greater than 0');
    }

    const where: any = {};
    if (sku) {
      where.sku = { contains: sku, mode: 'insensitive' };
    }
    if (productId) {
      where.productId = productId;
    }

    const skip = (page - 1) * limit;
    const take = limit;

    try {
      const total = await this.prisma.variant.count({ where });

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

      const variants = await this.prisma.variant.findMany({
        where,
        skip,
        take,
      });

      return {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: variants,
      };
    } catch (error) {
      console.error('Error in get categories:', error.message, error);
      throw new Error('Internal server error. Please try again later.');
    }
  }
}
