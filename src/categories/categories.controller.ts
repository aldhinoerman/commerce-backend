import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ResponseUtil } from 'src/utils/response.util';
import { AuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async listCategories(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
  ) {
    const numericPage = Number(page ?? 1);
    const numericLimit = Number(limit ?? 10);

    const categories = await this.categoriesService.listCategories({
      page: numericPage,
      limit: numericLimit,
      name,
    });

    return ResponseUtil.success('Success retrieved categories', categories);
  }

  // Create a new category
  @UseGuards(AuthGuard)
  @Post()
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
    const imagePath = file
      ? `${process.env.APP_URL}/uploads/categories/${file.filename}`
      : null;
    const categoryData = { ...createCategoryDto, image: imagePath };
    const categoryPost =
      await this.categoriesService.createCategory(categoryData);
    return ResponseUtil.success('Success created category', categoryPost);
  }

  // Update an existing category
  @UseGuards(AuthGuard)
  @Patch()
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
    let categoryData;
    const imagePath = file
      ? `${process.env.APP_URL}/uploads/categories/${file.filename}`
      : null;
    if (imagePath) {
      categoryData = { ...updateCategoryDto, image: imagePath };
    } else {
      categoryData = { ...updateCategoryDto };
    }

    const categoryUpdate =
      await this.categoriesService.updateCategory(categoryData);
    return ResponseUtil.success('Success updated category', categoryUpdate);
  }

  // Delete a category with validation
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    const parsedId = Number(id);
    const categoryDelete =
      await this.categoriesService.deleteCategory(+parsedId);
    return ResponseUtil.success('Success deleted category', {});
  }
}
