import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStateMachine } from './order.state-machine';
import { OrderGateway } from './order.gateway';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private orderGateway: OrderGateway,
    private productsService: ProductsService,
  ) {}

  async generateOrderNo(): Promise<string> {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const count = await this.orderModel.countDocuments({
      createdAt: {
        $gte: startOfDay,
      },
    });
    return `DD${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNo = await this.generateOrderNo();

    const items = createOrderDto.items.map((item) => ({
      productId: new Types.ObjectId(item.productId),
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      note: item.note,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const createdOrder = new this.orderModel({
      orderNo,
      status: OrderStatus.PENDING,
      items,
      totalAmount,
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      remark: createOrderDto.remark,
      tableNumber: createOrderDto.tableNumber,
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          timestamp: new Date(),
        },
      ],
    });

    const savedOrder = await createdOrder.save();

    const productIds = createOrderDto.items.map((item) => item.productId);
    const quantities = createOrderDto.items.map((item) => item.quantity);
    await this.productsService.incrementSales(productIds, quantities);

    this.orderGateway.emitOrderCreated(savedOrder);

    return savedOrder;
  }

  async findAll(status?: OrderStatus): Promise<Order[]> {
    const query = status ? { status } : {};
    return this.orderModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }

  async updateStatus(id: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (!OrderStateMachine.canTransition(order.status, newStatus)) {
      throw new BadRequestException(
        `状态不允许从 ${order.status} 转换到 ${newStatus}`,
      );
    }

    if (order.status === newStatus) {
      return order;
    }

    order.status = newStatus;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
    });

    const updatedOrder = await order.save();

    this.orderGateway.emitOrderStatusChanged(updatedOrder);

    return updatedOrder;
  }

  async markAsPrinted(id: string): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { isPrinted: true }, { new: true })
      .exec();

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    this.orderGateway.emitOrderPrinted(order);

    return order;
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('订单不存在');
    }
  }

  async findByDateRange(start: Date, end: Date): Promise<Order[]> {
    return this.orderModel
      .find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
      })
      .sort({ createdAt: 1 })
      .exec();
  }
}
