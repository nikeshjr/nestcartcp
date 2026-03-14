import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalOrders = await this.prisma.order.count();
    const totalProducts = await this.prisma.product.count();
    const totalUsers = await this.prisma.user.count({ where: { role: 'user' } });
    
    const revenueData = await this.prisma.order.aggregate({
      where: { status: { not: 'cancelled' } },
      _sum: { total: true },
    });

    const trendingProducts = await this.prisma.product.findMany({
      take: 5,
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
      orderBy: {
        orderItems: {
          _count: 'desc',
        },
      },
    });

    const lowStockProducts = await this.prisma.product.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: 'asc' },
    });

    return {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenueData._sum.total || 0,
      trendingProducts,
      lowStockProducts,
    };
  }
}
