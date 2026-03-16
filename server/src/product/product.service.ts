import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
      include: { category: true },
    });
  }

  async findAll(search?: string, categoryId?: number, page = 1, limit = 12) {
    const where: any = {};
    if (search) {
      where.name = { contains: search };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    
    // Use a transaction to ensure atomic deletion of relations
    return this.prisma.$transaction(async (tx) => {
      // 1. Remove from all shopping carts
      await tx.cartItem.deleteMany({
        where: { productId: id }
      });
      
      // 2. Remove from wishlist
      await tx.wishlistItem.deleteMany({
        where: { productId: id }
      });
      
      // 3. Remove reviews
      await tx.review.deleteMany({
        where: { productId: id }
      });
      
      // 4. Remove from order history (needed for hard-delete)
      await tx.orderItem.deleteMany({
        where: { productId: id }
      });
      
      // Finally, delete the product itself
      return tx.product.delete({
        where: { id },
      });
    });
  }
}