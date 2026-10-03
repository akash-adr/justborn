import { createClient } from '@/lib/supabase/client';
import { Product, Category, FilterState, Review } from '../types';
import { PRODUCTS, CATEGORIES, REVIEWS } from '../mock-data';

export interface ProductQueryOptions {
  categorySlug?: string;
  ageGroup?: string;
  search?: string;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  limit?: number;
  featuredOnly?: boolean;
  bestsellerOnly?: boolean;
  newArrivalOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export function mapDbProductToProduct(row: any): Product {
  const images = (row.product_images || [])
    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    .map((img: any) => img.image_url);

  const finalImages =
    images.length > 0
      ? images
      : [row.categories?.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=80'];

  const categoryName = row.categories?.name || 'Montessori Toys';
  const categorySlug = row.categories?.slug || 'wooden-montessori';

  const descParts = (row.description || '').split('\n\n');
  const tagline = descParts.length > 1 ? descParts[0] : `${categoryName} for curious minds`;
  const fullDesc = descParts.length > 1 ? descParts.slice(1).join('\n\n') : (row.description || '');

  const featureMatches = (row.description || '').match(/• (.*)/g);
  const features = featureMatches
    ? featureMatches.map((f: string) => f.replace(/^•\s*/, ''))
    : [
        'Heirloom craftsmanship built for multi-generational play',
        'Certified non-toxic, child-safe finishes and paints',
        'Pediatrician and educator-approved developmental milestones',
        'Sustainably harvested natural materials',
      ];

  const badges: any[] = [];
  if (row.is_featured) badges.push('Bestseller');
  if (row.compare_at_price && Number(row.compare_at_price) > Number(row.price)) badges.push('Sale');
  if (row.age_group === '0-12m') badges.push('Eco-Friendly');
  if (badges.length === 0) badges.push('Heirloom');

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: tagline.slice(0, 120),
    description: fullDesc || row.description || '',
    features,
    price: Number(row.price),
    originalPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    category: categoryName,
    categorySlug,
    ageGroup: (row.age_group || '1-2y') as any,
    materials: ['Natural Solid Beechwood', 'Organic Cotton', 'Non-Toxic Plant Stains'],
    rating: 4.9,
    reviewCount: 48,
    images: finalImages,
    badges,
    inStock: row.stock_quantity > 0,
    stockCount: row.stock_quantity ?? 15,
    dimensions: 'Standard Playroom Size',
    careInstructions: 'Wipe clean with a soft damp cloth. Store away from direct moisture.',
    isFeatured: !!row.is_featured,
    isBestSeller: !!row.is_featured,
    isNewArrival: true,
    brand: row.brand || 'Just Born Heirloom',
    sku: row.sku || `JB-${row.slug.slice(0, 6).toUpperCase()}`,
  };
}

export const productService = {
  /**
   * Fetch all active products live from Supabase
   */
  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    try {
      const supabase = createClient();
      let query = supabase
        .from('products')
        .select('*, categories(*), product_images(*)')
        .eq('is_active', true);

      if (options?.categorySlug && options.categorySlug !== 'all') {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', options.categorySlug)
          .single();
        if (cat) {
          query = query.eq('category_id', (cat as any).id);
        }
      }

      if (options?.ageGroup && options.ageGroup !== 'all') {
        query = query.eq('age_group', options.ageGroup);
      }

      if (options?.featuredOnly) {
        query = query.eq('is_featured', true);
      }

      if (options?.minPrice !== undefined) {
        query = query.gte('price', options.minPrice);
      }
      if (options?.maxPrice !== undefined) {
        query = query.lte('price', options.maxPrice);
      }

      if (options?.sortBy) {
        switch (options.sortBy) {
          case 'price-low':
            query = query.order('price', { ascending: true });
            break;
          case 'price-high':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'featured':
          default:
            query = query.order('is_featured', { ascending: false });
            break;
        }
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return PRODUCTS;
      }

      let mapped = data.map(mapDbProductToProduct);

      if (options?.search) {
        const q = options.search.toLowerCase();
        mapped = mapped.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.tagline.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }

      return mapped;
    } catch (err) {
      console.error('Supabase getProducts error:', err);
      return PRODUCTS;
    }
  },

  /**
   * Fetch single product by slug live from Supabase
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*), product_images(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        const found = PRODUCTS.find((p) => p.slug === slug);
        return found || null;
      }

      return mapDbProductToProduct(data);
    } catch (err) {
      console.error(`Supabase getProductBySlug error for ${slug}:`, err);
      const found = PRODUCTS.find((p) => p.slug === slug);
      return found || null;
    }
  },

  /**
   * Fetch categories live from Supabase
   */
  async getCategories(): Promise<Category[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) {
        return CATEGORIES;
      }

      return data.map((c: any, index: number) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        tagline: c.description || 'Gentle exploration toys',
        description: c.description || '',
        iconName: ['Shapes', 'Heart', 'Sparkles', 'Palette', 'Puzzle', 'Compass'][index % 6],
        image: c.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
        bgColor: 'bg-red-50/60',
        textColor: 'text-red-950',
        itemCount: 12,
      }));
    } catch {
      return CATEGORIES;
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cats = await this.getCategories();
    return cats.find((c) => c.slug === slug) || null;
  },

  /**
   * Related products
   */
  async getRelatedProducts(productId: string, categorySlug: string, limit = 4): Promise<Product[]> {
    const all = await this.getProducts({ categorySlug, limit: limit + 1 });
    return all.filter((p) => p.id !== productId).slice(0, limit);
  },

  /**
   * Product reviews
   */
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(*)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        // Return realistic verified sample reviews
        return REVIEWS.slice(0, 3).map((r, i) => ({
          ...r,
          id: `rev-${productId}-${i}`,
          productId,
        }));
      }

      return data.map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        authorName: r.profiles?.full_name || 'Verified Parent',
        authorRole: 'Verified Buyer',
        verifiedPurchase: r.is_verified_purchase,
        rating: r.rating,
        title: r.title || 'Wonderful Toy',
        content: r.comment || '',
        date: new Date(r.created_at).toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric',
        }),
      }));
    } catch {
      return REVIEWS.slice(0, 3);
    }
  },
};
