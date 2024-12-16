import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersService } from './orders.service';
import { AddToCartDto, RemoveCartItemDto, UpdateCartDto } from './dto/cart.dto';
import { ResponseUtil } from 'src/utils/response.util';
import { CheckoutDto } from './dto/checkout.dto';
import { PaymentDto } from './dto/payment.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('cart')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async addToCart(@Body() addToCartDto: AddToCartDto) {
    const cartItem = await this.ordersService.addToCart(
      addToCartDto.username,
      addToCartDto.variantId,
      addToCartDto.quantity,
    );
    return ResponseUtil.success('Item added to cart', cartItem);
  }

  @Patch('cart')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateCartItem(@Body() updateCartDto: UpdateCartDto) {
    const cartItem = await this.ordersService.updateCartItem(
      updateCartDto.username,
      updateCartDto.variantId,
      updateCartDto.quantity,
    );
    return ResponseUtil.success('Cart item updated successfully', cartItem);
  }

  @Delete('cart')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async removeCartItem(@Body() removeCartItemDto: RemoveCartItemDto) {
    await this.ordersService.removeCartItem(
      removeCartItemDto.username,
      removeCartItemDto.variantId,
    );
    return ResponseUtil.success('Cart item removed successfully', {});
  }

  @Post('checkout')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async checkout(@Body() checkoutDto: CheckoutDto) {
    const result = await this.ordersService.checkout(checkoutDto.username);
    return ResponseUtil.success(result.message, {});
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async pay(@Body() paymentDto: PaymentDto) {
    const result = await this.ordersService.processPayment(
      paymentDto.username,
      paymentDto.orderId,
    );
    return ResponseUtil.success(result.message, {});
  }
}
