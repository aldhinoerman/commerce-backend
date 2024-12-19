import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddToCartDto, RemoveCartItemDto, UpdateCartDto } from './dto/cart.dto';
import { ResponseUtil } from 'src/utils/response.util';
import { CheckoutDto } from './dto/checkout.dto';
import { PaymentDto } from './dto/payment.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('cart')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getCart(@Query('username') username: string) {
    const carts = await this.ordersService.getCart({ username });
    return ResponseUtil.success('Successfully retrieved cart', carts);
  }

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
    console.log('username from query');
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

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async checkout(@Body() checkoutDto: CheckoutDto) {
    const result = await this.ordersService.checkout(checkoutDto.username);
    return ResponseUtil.success(result.message, {});
  }

  @Post('payment')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async pay(@Body() paymentDto: PaymentDto) {
    const result = await this.ordersService.processPayment(
      paymentDto.username,
      paymentDto.orderId,
    );
    return ResponseUtil.success(result.message, {});
  }
}
