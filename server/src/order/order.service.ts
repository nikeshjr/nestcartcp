import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    let total = 0;
    const orderItemsData: { productId: number; quantity: number; price: number }[] = [];


    // Check stock and calculate total
    for (const item of createOrderDto.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new NotFoundException(`Product ID ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.name}`);
      }
      
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price, // capture price at purchase time
      });
    }

    // Create order and decrement stock inside a transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          total,
          status: 'pending',
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // Update stock
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });
  }

  async findAll(userId: number, role: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    if (role === 'admin') {
      const [data, total] = await Promise.all([
        this.prisma.order.findMany({
          include: {
            user: {
              select: { username: true, email: true }
            },
            items: {
              include: { product: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.order.count(),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    const where = { userId };
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number, userId: number, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { username: true, email: true }
        },
        items: {
          include: { product: true }
        }
      },
    });
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    if (role !== 'admin' && order.userId !== userId) {
      throw new NotFoundException('Order not found'); // Hide existence to unauthorized user
    }
    
    return order;
  }

  async cancel(id: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException(`Cannot cancel order in ${order.status} state`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'cancelled' },
      });

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return updatedOrder;
    });
  }

  async updateStatus(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const currentStatus = order.status;
    const nextStatus = updateOrderDto.status;

    // Define valid transitions
    const transitions: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [], // Terminal state
      cancelled: [],   // Terminal state
    };

    if (currentStatus === nextStatus) {
      return order; // No change needed
    }

    const allowed = transitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException('Invalid order status transition');
    }

    // Special logic for cancellation: Restore stock if moving to 'cancelled'
    if (nextStatus === 'cancelled') {
      return this.prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: { id },
          data: { status: 'cancelled' },
        });

        // Need to fetch items if we are in this specific flow
        const orderWithItems = await tx.order.findUnique({
          where: { id },
          include: { items: true },
        });

        if (orderWithItems && orderWithItems.items) {
          for (const item of orderWithItems.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
        return updatedOrder;
      });
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: nextStatus },
    });
  }
}
