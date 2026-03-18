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
    const where: any = { isActive: true }; // Only show active products
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
    const product = await this.prisma.product.findUnique({ 
      where: { id },
      include: { orderItems: true } // check if it was part of orders
    });
    if (!product) throw new NotFoundException('Product not found');
    
    // Check if product was ever ordered
    const hasBeenOrdered = product.orderItems.length > 0;

    if (hasBeenOrdered) {
      // SOFT DELETE: Keep the record for order history but hide it from store
      return this.prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
    }

    // HARD DELETE: If never ordered, we can safely remove it and its cart items/reviews
    return this.prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      return tx.product.delete({ where: { id } });
    });
  }

  async getSuggestions(query: string) {
    if (!query || query.trim().length < 2) return { products: [], categories: [] };

    const [products, categories] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          name: { contains: query },
          isActive: true, // Only suggest active products
        },
        select: { id: true, name: true, price: true, image: true },
        take: 5,
      }),
      this.prisma.category.findMany({
        where: { name: { contains: query } },
        select: { id: true, name: true },
        take: 3,
      }),
    ]);

    return { products, categories };
  }
}