import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { RabbitMqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [AuthModule, RabbitMqModule],
  providers: [OrdersService, PrismaService, AuthGuard],
  controllers: [OrdersController],
})
export class OrdersModule {}
