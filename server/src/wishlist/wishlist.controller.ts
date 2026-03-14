import { Controller, Get, Post, Delete, Param, UseGuards, Req, Body } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) { }

  @Post()
  add(@Req() req: any, @Body('productId') productId: number) {
    return this.wishlistService.addToWishlist(req.user.userId, productId);
  }

  @Delete(':productId')
  remove(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.userId, +productId);
  }

  @Get()
  getWishlist(@Req() req: any) {
    return this.wishlistService.getWishlist(req.user.userId);
  }
}
