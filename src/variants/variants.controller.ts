import { Controller, Get, Query } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { ResponseUtil } from 'src/utils/response.util';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get()
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

    const variants = await this.variantsService.listVariants({
      page: numericObj.page,
      limit: numericObj.limit,
      sku,
      productId: numericObj.productId,
    });
    return ResponseUtil.success('Success retrieved variants', variants);
  }
}
