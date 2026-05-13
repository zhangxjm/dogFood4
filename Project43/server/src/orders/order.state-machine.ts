import { OrderStatus } from './schemas/order.schema';

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PREPARING],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.PENDING],
  [OrderStatus.READY]: [OrderStatus.PREPARING],
};

export class OrderStateMachine {
  static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    if (from === to) return true;
    const allowedTransitions = STATUS_TRANSITIONS[from];
    return allowedTransitions?.includes(to) ?? false;
  }

  static getNextStatuses(current: OrderStatus): OrderStatus[] {
    return STATUS_TRANSITIONS[current] ?? [];
  }
}
