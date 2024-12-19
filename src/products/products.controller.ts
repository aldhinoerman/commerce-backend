import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { StockOpnameDto } from './dto/stock-opname.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseUtil } from 'src/utils/response.util';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Get Product List
  @Get()
  async listProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('title') title?: string,
  ) {
    const numericObj = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      category: category ? Number(category) : undefined,
    };

    const products = await this.productsService.listProducts({
      page: numericObj.page,
      limit: numericObj.limit,
      category: numericObj.category,
      title,
    });
    return ResponseUtil.success('Success retrieved products', products);
  }

  // Create Product
  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @ApiBody({
    description: 'Form data',
    type: CreateProductDto,
  })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/products',
        filename: (_, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    if (createProductDto.variants) {
      createProductDto.variants.forEach((variant, index) => {
        const file = files.find(
          (f) => f.fieldname === `variants[${index}][image]`,
        );
        variant.image = file
          ? `${process.env.APP_URL}/uploads/products/${file.filename}`
          : null;
        variant.stock = Number(variant.stock) ?? 0;
        variant.price = Number(variant.price) ?? 0;
      });
    }

    const numericCategoryId = createProductDto?.categoryId
      ? Number(createProductDto.categoryId)
      : undefined;

    const product = {
      ...createProductDto,
      categoryId: numericCategoryId,
    };

    const productPost = await this.productsService.createProduct(product);
    return ResponseUtil.success('Success create product', productPost);
  }

  // Get Product By Id
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    const numericId = Number(id);
    const productById = await this.productsService.listProductById(numericId);
    return ResponseUtil.success('Success retrieved product', productById);
  }

  @UseGuards(AuthGuard)
  @Post('stock-opname')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async stockOpname(@Body() stockOpnameDto: StockOpnameDto) {
    const stockOp = await this.productsService.stockOpname(
      stockOpnameDto.variantId,
      stockOpnameDto.adjustment,
      stockOpnameDto.reason,
    );
    return ResponseUtil.success('Success updated stock', stockOp);
  }

  @UseGuards(AuthGuard)
  @Patch()
  @ApiOperation({ summary: 'Update a new product' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Product updated successfully.' })
  @ApiBody({
    description: 'Form data',
    type: UpdateProductDto,
  })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/products',
        filename: (_, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      if (updateProductDto.variants) {
        updateProductDto.variants.forEach((variant, index) => {
          const file = files.find(
            (f) => f.fieldname === `variants[${index}][image]`,
          );

          if (file) {
            variant.image = `${process.env.APP_URL}/uploads/products/${file.filename}`;
          }

          if (variant.stock) {
            variant.stock = Number(variant.stock);
          }

          if (variant.price) {
            variant.price = Number(variant.price);
          }
        });
      }

      const productUpdate =
        await this.productsService.updateProduct(updateProductDto);
      return ResponseUtil.success('Success updated product', productUpdate);
    } catch (error) {
      console.error('Internal Server Error:', error.message);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    const productDelete = await this.productsService.deleteProduct(+numericId);
    return ResponseUtil.success('Success deleted product', productDelete);
  }
}
