import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckoutWorker {
  constructor(private readonly prisma: PrismaService) {}

  async processCheckout(data: { username: string; cartItems: any[] }) {
    const { username, cartItems } = data;

    await this.prisma.$transaction(async (prisma) => {
      const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.quantity * item.variant.price,
        0,
      );

      const order = await prisma.order.create({
        data: {
          username,
          totalPrice,
          status: 'pending',
          orderItems: {
            create: cartItems.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.variant.price,
            })),
          },
        },
      });

      for (const item of cartItems) {
        const variant = await prisma.variant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant || variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for variant "${variant?.name}".`);
        }

        await prisma.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });
  }
}
