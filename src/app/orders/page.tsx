'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order } from '@/lib/types';
import { orderService } from '@/lib/services/orderService';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await orderService.getOrders();
      setOrders(data);
      setLoading(false);
    }
    load();
  }, []);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            <Truck className="w-3.5 h-3.5" /> In Transit
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Hand-Packing
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E76F51] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen py-16 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-4">
          <EmptyState
            iconType="orders"
            title="No Playroom Orders Yet"
            description="When you order keepsake toys from Just Born, your tracking updates and digital receipts will live right here."
            actionLabel="Explore Collections"
            actionHref="/shop"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-[#FDFBF7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">
              Order History & Tracking
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Review past keepsake purchases, track deliveries, and request exchanges.
            </p>
          </div>
          <Link href="/shop">
            <Button size="sm" variant="outline">
              Shop More
            </Button>
          </Link>
        </div>

        {/* Orders Stack */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-stone-900">
                      Order #{order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-stone-400">Order Total</p>
                  <p className="text-lg font-black text-stone-900">{formatPrice(order.total)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 rounded-2xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">{item.productName}</h4>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Qty: {item.quantity} • {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-extrabold text-stone-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tracking & Shipping Details */}
              <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/70 -mx-6 -mb-6 p-6 rounded-b-3xl text-xs text-stone-600">
                <div>
                  <span className="text-stone-400 font-medium">Delivered to: </span>
                  <span className="font-semibold text-stone-900">
                    {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state}
                  </span>
                  {order.trackingNumber && (
                    <div className="text-stone-500 mt-0.5">
                      Tracking: <strong className="font-mono text-stone-800">{order.trackingNumber}</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-stone-400">100-Day Playroom Protection Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
