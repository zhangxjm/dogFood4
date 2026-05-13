import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
} from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  eachDayOfInterval,
} from 'date-fns';

export interface DailySales {
  date: string;
  totalAmount: number;
  orderCount: number;
}

export interface ProductSales {
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
}

export interface SalesStatistics {
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  weekOrders: number;
  monthRevenue: number;
  monthOrders: number;
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getDailySales(startDate: Date, endDate: Date): Promise<DailySales[]> {
    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
        status: { $in: [OrderStatus.PREPARING, OrderStatus.READY] },
      })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    const dailyMap = new Map<string, { totalAmount: number; orderCount: number }>();

    const days = eachDayOfInterval({
      start: startOfDay(startDate),
      end: endOfDay(endDate),
    });

    days.forEach((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      dailyMap.set(dateKey, { totalAmount: 0, orderCount: 0 });
    });

    orders.forEach((order: any) => {
      const dateKey = format(order.createdAt, 'yyyy-MM-dd');
      const existing = dailyMap.get(dateKey);
      if (existing) {
        existing.totalAmount += order.totalAmount;
        existing.orderCount += 1;
      }
    });

    return days.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const data = dailyMap.get(dateKey)!;
      return {
        date: dateKey,
        totalAmount: Number(data.totalAmount.toFixed(2)),
        orderCount: data.orderCount,
      };
    });
  }

  async getProductRanking(
    startDate: Date,
    endDate: Date,
    limit: number = 10,
  ): Promise<ProductSales[]> {
    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
        status: { $in: [OrderStatus.PREPARING, OrderStatus.READY] },
      })
      .exec();

    const productMap = new Map<
      string,
      { productName: string; quantity: number; totalAmount: number }
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId.toString();
        const existing = productMap.get(productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.totalAmount += item.subtotal;
        } else {
          productMap.set(productId, {
            productName: item.productName,
            quantity: item.quantity,
            totalAmount: item.subtotal,
          });
        }
      });
    });

    const ranking: ProductSales[] = Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.productName,
        quantity: data.quantity,
        totalAmount: Number(data.totalAmount.toFixed(2)),
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    return ranking;
  }

  async getSalesStatistics(): Promise<SalesStatistics> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.getAggregatedStats(todayStart, todayEnd),
      this.getAggregatedStats(weekStart, weekEnd),
      this.getAggregatedStats(monthStart, monthEnd),
    ]);

    return {
      todayRevenue: todayStats.totalAmount,
      todayOrders: todayStats.orderCount,
      weekRevenue: weekStats.totalAmount,
      weekOrders: weekStats.orderCount,
      monthRevenue: monthStats.totalAmount,
      monthOrders: monthStats.orderCount,
    };
  }

  private async getAggregatedStats(
    start: Date,
    end: Date,
  ): Promise<{ totalAmount: number; orderCount: number }> {
    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
        status: { $in: [OrderStatus.PREPARING, OrderStatus.READY] },
      })
      .exec();

    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalAmount: Number(totalAmount.toFixed(2)),
      orderCount: orders.length,
    };
  }
}
