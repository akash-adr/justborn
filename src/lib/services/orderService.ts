import { Order, OrderItem } from '../types';
import { MOCK_ORDERS } from '../mock-data';

let memoryOrders = [...MOCK_ORDERS];

export interface CreateOrderParams {
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: Order['shippingAddress'];
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...memoryOrders];
  },

  async getOrderById(id: string): Promise<Order | null> {
    await new Promise((r) => setTimeout(r, 60));
    return memoryOrders.find((o) => o.id === id || o.orderNumber === id) || null;
  },

  async createOrder(params: CreateOrderParams): Promise<Order> {
    await new Promise((r) => setTimeout(r, 100));
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `JB-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      status: 'processing',
      items: params.items,
      subtotal: params.subtotal,
      shippingFee: params.shippingFee,
      total: params.total,
      shippingAddress: params.shippingAddress,
      trackingNumber: `JB-TRK-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    memoryOrders = [newOrder, ...memoryOrders];
    return newOrder;
  },
};
