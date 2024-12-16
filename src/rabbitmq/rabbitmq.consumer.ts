import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CheckoutWorker } from 'src/orders/orders.worker';

@Controller()
export class RabbitMQConsumer {
  constructor(private readonly checkoutWorker: CheckoutWorker) {}

  @EventPattern('process_checkout')
  async handleCheckout(data: { username: string; cartItems: any[] }) {
    try {
      console.log('Received checkout message:', data);

      await this.checkoutWorker.processCheckout(data);

      console.log('Checkout processed successfully for user:', data.username);
    } catch (error) {
      console.error('Error processing checkout:', error.message);
    }
  }
}
