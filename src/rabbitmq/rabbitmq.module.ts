import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQConsumer } from './rabbitmq.consumer';
import { CheckoutWorker } from 'src/orders/orders.worker';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CHECKOUT_QUEUE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_MQ_URL],
          queue: 'checkout_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    PrismaModule,
  ],
  controllers: [RabbitMQConsumer],
  exports: [ClientsModule],
  providers: [CheckoutWorker],
})
export class RabbitMqModule {}
