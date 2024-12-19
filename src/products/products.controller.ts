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
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { StockOpnameDto } from './dto/stock-opname.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApploggerService } from 'src/applogger/applogger.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly appLogger: ApploggerService,
  ) {}

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

    return this.productsService.createProduct(product);
  }

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
    return this.productsService.listProducts({
      page: numericObj.page,
      limit: numericObj.limit,
      category: numericObj.category,
      title,
    });
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    const numericId = Number(id);
    return this.productsService.listProductById(numericId);
  }

  @Get('variants')
  async listVariants(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sku') sku?: string,
    @Query('productId') productId?: string,
  ) {
    const numericObj = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      productId: productId ? Number(productId) : undefined,
    };
    return this.productsService.listVariants({
      page: numericObj.page,
      limit: numericObj.limit,
      sku,
      productId: numericObj.productId,
    });
  }

  @Get('categories')
  async listCategories(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
  ) {
    const numericPage = Number(page);
    const numericLimit = Number(limit);
    return this.productsService.listCategories({
      page: numericPage,
      limit: numericLimit,
      name,
    });
  }

  // Create a new category
  @UseGuards(AuthGuard)
  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @ApiBody({
    description: 'Form data',
    type: CreateCategoryDto,
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/categories',
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
  async createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    this.appLogger.log('accept file');
    const imagePath = file
      ? `${process.env.APP_URL}/uploads/categories/${file.filename}`
      : null;
    const categoryData = { ...createCategoryDto, image: imagePath };
    return this.productsService.createCategory(categoryData);
  }

  // Update an existing category
  @UseGuards(AuthGuard)
  @Patch('categories')
  @ApiOperation({ summary: 'Update a category' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Category updated successfully.' })
  @ApiBody({
    description: 'Form data',
    type: UpdateCategoryDto,
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/categories',
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
  async updateCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    this.appLogger.log('accept file');
    let categoryData;
    const imagePath = file
      ? `${process.env.APP_URL}/uploads/categories/${file.filename}`
      : null;
    if (imagePath) {
      categoryData = { ...updateCategoryDto, image: imagePath };
    } else {
      categoryData = { ...updateCategoryDto };
    }
    return this.productsService.updateCategory(categoryData);
  }

  // Delete a category with validation
  @UseGuards(AuthGuard)
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    const parsedId = Number(id);
    return this.productsService.deleteCategory(+parsedId);
  }

  @UseGuards(AuthGuard)
  @Post('stock-opname')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async stockOpname(@Body() stockOpnameDto: StockOpnameDto) {
    return this.productsService.stockOpname(
      stockOpnameDto.variantId,
      stockOpnameDto.adjustment,
      stockOpnameDto.reason,
    );
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

      return this.productsService.updateProduct(updateProductDto);
    } catch (error) {
      console.error('Internal Server Error:', error.message);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    return this.productsService.deleteProduct(+numericId);
  }
}
