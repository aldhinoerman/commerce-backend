import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ApploggerModule } from './applogger/applogger.module';
import { CategoriesModule } from './categories/categories.module';
import { VariantsService } from './variants/variants.service';
import { VariantsModule } from './variants/variants.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UsersModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    VariantsModule,
    ApploggerModule,
    PrismaModule,
    AuthModule,
  ],
  providers: [VariantsService],
})
export class AppModule {}
