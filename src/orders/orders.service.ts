import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CHECKOUT_QUEUE') private readonly checkoutQueue: ClientProxy,
  ) {}

  async getCart(username: string) {
    return this.prisma.cart.findMany({
      where: { username },
      include: { variant: true },
    });
  }

  async addToCart(username: string, variantId: number, quantity: number) {
    const variant = await this.prisma.variant.findUnique({
      where: { id: variantId },
    });

    // Check variant
    if (!variant) {
      throw new Error('Variant not found');
    }

    // Quantity must positive
    if (quantity < 1) {
      throw new Error('Quantity must at least 1');
    }

    // Add or update the cart
    return this.prisma.cart.upsert({
      where: {
        username_variantId: { username, variantId },
      },
      create: {
        username,
        variantId,
        quantity,
      },
      update: {
        quantity: { increment: quantity },
      },
    });
  }

  async updateCartItem(username: string, variantId: number, quantity: number) {
    // Quantity must positive
    if (quantity < 1) {
      throw new Error('Quantity must at least 1');
    }

    return this.prisma.cart.update({
      where: {
        username_variantId: { username, variantId },
      },
      data: { quantity },
    });
  }

  async removeCartItem(username: string, variantId: number) {
    return this.prisma.cart.delete({
      where: {
        username_variantId: { username, variantId },
      },
    });
  }

  async checkout(username: string) {
    // Step 1: Fetch cart items
    const cartItems = await this.prisma.cart.findMany({
      where: { username },
      include: { variant: true },
    });

    if (!cartItems.length) {
      throw new BadRequestException('Cart is empty');
    }

    // Step 2: Validate stock availability
    for (const item of cartItems) {
      if (item.quantity > item.variant.stock) {
        throw new BadRequestException(
          `Insufficient stock for variant "${item.variant.name}". Available stock: ${item.variant.stock}`,
        );
      }
    }

    // Step 3: Publish the request to queue
    await firstValueFrom(
      this.checkoutQueue.emit('process_checkout', { username, cartItems }),
    );

    return { message: 'Checkout request has been queued for processing' };
  }

  async processPayment(username: string, orderId: number) {
    return this.prisma.$transaction(async (prisma) => {
      // Step 1: Validate the order
      const order = await this.prisma.order.findFirst({
        where: { id: orderId, username, status: 'pending' },
        include: { orderItems: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found or already paid');
      }

      // Step 2: Update the order status to 'paid'
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'paid' },
      });

      // Step 3: Clear the user's cart
      await prisma.cart.deleteMany({ where: { username } });

      return { message: 'Payment successful.' };
    });
  }
}
