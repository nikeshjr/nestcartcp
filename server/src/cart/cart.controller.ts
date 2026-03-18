import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  addItem(@Request() req, @Body('productId', ParseIntPipe) productId: number, @Body('quantity', ParseIntPipe) quantity: number) {
    return this.cartService.addItem(req.user.userId, productId, quantity);
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  removeItem(@Request() req, @Param('productId', ParseIntPipe) productId: number) {
    return this.cartService.removeItem(req.user.userId, productId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}
