import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { ApploggerService } from 'src/applogger/applogger.service';

@Module({
  imports: [AuthModule],
  providers: [ProductsService, PrismaService, ApploggerService],
  controllers: [ProductsController],
})
export class ProductsModule {}
