import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async addToWishlist(userId: number, productId: number) {
    console.log('WishlistService.addToWishlist:', { userId, productId });
    try {
      const result = await this.prisma.wishlistItem.create({
        data: { userId: +userId, productId: +productId },
      });
      console.log('Wishlist item created:', result);
      return result;
    } catch (error) {
      console.error('Prisma error in addToWishlist:', error);
      if (error.code === 'P2002') {
        throw new ConflictException('Product already in wishlist');
      }
      throw error;
    }
  }

  async removeFromWishlist(userId: number, productId: number) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) throw new NotFoundException('Product not in wishlist');

    return this.prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });
  }

  async getWishlist(userId: number) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true },
        },
      },
    });
  }
}
