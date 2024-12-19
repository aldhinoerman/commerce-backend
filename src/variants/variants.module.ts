import { Module } from '@nestjs/common';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PrismaService, VariantsService],
  controllers: [VariantsController],
})
export class VariantsModule {}
