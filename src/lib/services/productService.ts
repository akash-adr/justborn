import { Product, Category, FilterState } from '../types';
import { PRODUCTS, CATEGORIES } from '../mock-data';

export interface ProductQueryOptions {
  categorySlug?: string;
  ageGroup?: string;
  search?: string;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  limit?: number;
  featuredOnly?: boolean;
  bestsellerOnly?: boolean;
  newArrivalOnly?: boolean;
}

/**
 * Product Service
 * Currently backed by verified in-memory mock data.
 * Architecture is 100% prepared to swap in Supabase client queries:
 * e.g., const { data, error } = await supabase.from('products').select('*')
 */
export const productService = {
  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    // Simulated async network resolution
    await new Promise((r) => setTimeout(r, 60));
    let result = [...PRODUCTS];

    if (options?.categorySlug && options.categorySlug !== 'all') {
      result = result.filter((p) => p.categorySlug === options.categorySlug);
    }

    if (options?.ageGroup && options.ageGroup !== 'all') {
      result = result.filter((p) => p.ageGroup === options.ageGroup);
    }

    if (options?.featuredOnly) {
      result = result.filter((p) => p.isFeatured);
    }

    if (options?.bestsellerOnly) {
      result = result.filter((p) => p.isBestSeller);
    }

    if (options?.newArrivalOnly) {
      result = result.filter((p) => p.isNewArrival);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.materials.some((m) => m.toLowerCase().includes(q))
      );
    }

    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'price-low':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
          break;
        default:
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    await new Promise((r) => setTimeout(r, 60));
    const found = PRODUCTS.find((p) => p.slug === slug);
    return found || null;
  },

  async getCategories(): Promise<Category[]> {
    await new Promise((r) => setTimeout(r, 50));
    return CATEGORIES;
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    await new Promise((r) => setTimeout(r, 50));
    return CATEGORIES.find((c) => c.slug === slug) || null;
  },

  async getRelatedProducts(productId: string, categorySlug: string, limit = 4): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 60));
    return PRODUCTS
      .filter((p) => p.id !== productId && p.categorySlug === categorySlug)
      .slice(0, limit);
  },
};
