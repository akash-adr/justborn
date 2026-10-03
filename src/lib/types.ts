export type AgeGroup = '0-12m' | '1-2y' | '3-4y' | '5-7y' | '8+y';

export type ProductBadge = 'Bestseller' | 'New' | 'Eco-Friendly' | 'Heirloom' | 'Sale' | 'Montessori';

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  price: number;
  stockQuantity: number;
  attributes?: Record<string, any>;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug: string;
  ageGroup: AgeGroup | string;
  materials: string[];
  rating: number;
  reviewCount: number;
  images: string[];
  badges: ProductBadge[] | string[];
  inStock: boolean;
  stockCount: number;
  dimensions?: string;
  careInstructions?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  brand?: string;
  sku?: string;
  variants?: ProductVariant[];
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  image: string;
  bgColor: string;
  textColor: string;
  itemCount: number;
}

export interface Review {
  id: string;
  productId?: string;
  authorName: string;
  authorRole: string; // e.g. "Mom of 2, Brooklyn"
  verifiedPurchase: boolean;
  rating: number;
  title: string;
  content: string;
  date: string;
  productName?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  variantId?: string | null;
  variant?: ProductVariant | null;
}

export interface CartCalculationResult {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  discountAmount: number;
  itemCount: number;
  total: number;
  stockIssues?: Array<{
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableStock: number;
    adjustedQuantity: number;
  }>;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
}

export interface CustomerAddress {
  id: string;
  userId?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  role?: 'customer' | 'admin' | string;
  childrenAges?: string[];
  savedAddresses?: Array<{
    id: string;
    isDefault: boolean;
    label: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>;
}

export interface FilterState {
  category: string;
  ageGroup: string;
  priceRange: [number, number];
  sort: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  inStockOnly: boolean;
  searchQuery: string;
}
