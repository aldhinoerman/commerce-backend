import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  //   Create a product
  async createProduct(data: {
    title: string;
    description: string;
    categoryId: number;
    variants?: {
      name: string;
      price: number;
      stock: number;
      description: string;
      sku: string;
      image: string;
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
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      products,
    };
  }

  //   Get all Variants
  async listVariants(query: {
    page?: number;
    limit?: number;
    sku?: string;
    productId?: number;
  }) {
    const { page = 1, limit = 10, sku, productId } = query;

    const where: any = {};
    if (sku) {
      where.sku = { contains: sku, mode: 'insensitive' };
    }
    if (productId) {
      where.productId = productId;
    }

    const total = await this.prisma.variant.count({ where });
    const variants = await this.prisma.variant.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      variants,
    };
  }

  // List categories
  async listCategories() {
    return this.prisma.category.findMany();
  }

  // Create a new category
  async createCategory(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  // Update an existing category
  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
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
  async updateProduct(id: number, updateProductDto: UpdateProductDto) {
    const { categoryId, variants, ...data } = updateProductDto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(categoryId && {
          category: {
            connect: { id: categoryId },
          },
        }),
        ...(variants && {
          variants: {
            upsert: variants.map((variant) => ({
              where: { sku: variant.sku },
              create: {
                name: variant.name,
                sku: variant.sku,
                description: variant.description,
                price: variant.price,
                stock: variant.stock,
                image: variant.image,
              },
              update: {
                name: variant.name,
                description: variant.description,
                price: variant.price,
                stock: variant.stock,
                image: variant.image,
              },
            })),
          },
        }),
      },
    });
  }

  //   Delete a product
  async deleteProduct(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
