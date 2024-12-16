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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { StockOpnameDto } from './dto/stock-opname.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  async listProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: number,
    @Query('title') title?: string,
  ) {
    return this.productsService.listProducts({ page, limit, category, title });
  }

  @Get('variants')
  async listVariants(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sku') sku?: string,
    @Query('productId') productId?: number,
  ) {
    return this.productsService.listVariants({ page, limit, sku, productId });
  }

  @Get('categories')
  async listCategories() {
    return this.productsService.listCategories();
  }

  // Create a new category
  @UseGuards(AuthGuard)
  @Post('categories')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.productsService.createCategory(createCategoryDto);
  }

  // Update an existing category
  @UseGuards(AuthGuard)
  @Patch('categories/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateCategory(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.productsService.updateCategory(+id, updateCategoryDto);
  }

  // Delete a category with validation
  @UseGuards(AuthGuard)
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: number) {
    return this.productsService.deleteCategory(+id);
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
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(+id, updateProductDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteProduct(@Param('id') id: number) {
    return this.productsService.deleteProduct(+id);
  }
}
