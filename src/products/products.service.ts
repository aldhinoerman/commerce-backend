import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { cleanUndefined } from 'src/utils/functions';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  //   Create a product
  async createProduct(data: {
    title: string;
    description?: string;
    categoryId?: number;
    variants?: {
      name: string;
      price: number;
      stock: number;
      description?: string;
      sku: string;
      image?: string;
    }[];
  }) {
    return this.prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        variants: data.variants?.length
          ? {
              create: data.variants.map((variant) => ({
                name: variant.name,
                price: variant.price,
                description: variant.description,
                stock: variant.stock,
                sku: variant.sku,
                image: variant.image,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
      },
    });
  }

  //   Get all products
  async listProducts(query: {
    page?: number;
    limit?: number;
    category?: number;
    title?: string;
  }) {
    const { page = 1, limit = 10, category, title } = query;

    const where: any = {};
    if (category) {
      where.categoryId = category;
    }
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    const total = await this.prisma.product.count({ where });
    const products = await this.prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        variants: true,
      },
    });

    return {
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: products,
    };
  }

  async listProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return { data: product };
  }

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

  // Handle stock opname (adjust stock for a variant)
  async stockOpname(variantId: number, adjustment: number, reason: string) {
    const variant = await this.prisma.variant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      throw new Error(`Variant with ID ${variantId} not found`);
    }

    const newStock = variant.stock + adjustment;
    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }

    const updatedVariant = await this.prisma.variant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });

    await this.prisma.stockOpname.create({
      data: {
        variantId,
        adjustment,
        reason,
      },
    });

    return updatedVariant;
  }

  //   Update a product
  async updateProduct(updateProductDto: UpdateProductDto) {
    const { id, categoryId, variants, ...data } = updateProductDto;

    const parseData = cleanUndefined(data);

    try {
      const result = await this.prisma.product.update({
        where: { id: Number(id) },
        data: {
          ...parseData,
          ...(categoryId && {
            category: {
              connect: { id: Number(categoryId) },
            },
          }),
          ...(variants && {
            variants: {
              upsert: variants.map((variant) => ({
                where: { sku: variant.sku },
                create: {
                  name: variant.name,
                  sku: variant.sku,
                  description: variant.description || null,
                  price: Number(variant.price),
                  stock: Number(variant.stock),
                  image: variant.image,
                },
                update: {
                  name: variant.name,
                  description: variant.description || null,
                  price: Number(variant.price),
                  stock: Number(variant.stock),
                  image: variant.image,
                },
              })),
            },
          }),
        },
      });
      return result;
    } catch (error) {
      console.error('Prisma Update Error:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  //   Delete a product
  async deleteProduct(id: number) {
    await this.prisma.variant.deleteMany({
      where: { productId: Number(id) },
    });
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
