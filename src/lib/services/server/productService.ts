import { createClient } from '@/lib/supabase/server';
import { Product, Category, PaginatedProducts, ProductVariant, Review } from '@/lib/types';
import { PostgrestError } from '@supabase/supabase-js';

export interface ProductQueryOptions {
  categorySlug?: string;
  ageGroup?: string;
  sortBy?: string;
  search?: string;
  limit?: number;
  page?: number;
  featuredOnly?: boolean;
  inStockOnly?: boolean;
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

  const badges: string[] = [];
  if (row.is_featured) badges.push('Bestseller');
  if (row.compare_at_price && Number(row.compare_at_price) > Number(row.price)) badges.push('Sale');
  if (row.age_group === '0-12m') badges.push('Eco-Friendly');
  if (badges.length === 0) badges.push('Heirloom');

  const variants: ProductVariant[] = (row.product_variants || []).map((v: any) => ({
    id: v.id,
    productId: v.product_id,
    name: v.name,
    sku: v.sku,
    price: Number(v.price),
    stockQuantity: Number(v.stock_quantity),
    attributes: v.attributes,
  }));

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
    ageGroup: (row.age_group || '1-2y'),
    materials: ['Natural Solid Beechwood', 'Organic Cotton', 'Non-Toxic Plant Stains'],
    rating: 4.9, // Default fallback, normally calculated from reviews
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
    variants,
  };
}

export async function getProducts(options?: ProductQueryOptions): Promise<PaginatedProducts> {
  try {
    const supabase = await createClient();
    
    // Always enforce is_active = true for customers
    let query = supabase
      .from('products')
      .select('*, categories(*), product_images(*), product_variants(*)', { count: 'exact' })
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

    if (options?.inStockOnly) {
      query = query.gt('stock_quantity', 0);
    }

    if (options?.minPrice !== undefined) {
      query = query.gte('price', options.minPrice);
    }
    if (options?.maxPrice !== undefined) {
      query = query.lte('price', options.maxPrice);
    }

    if (options?.search) {
      // Use full text search or ilike for partial matching
      const searchTerm = `%${options.search}%`;
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    if (options?.sortBy) {
      if (options.sortBy === 'price-low') {
        query = query.order('price', { ascending: true });
      } else if (options.sortBy === 'price-high') {
        query = query.order('price', { ascending: false });
      } else if (options.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('is_featured', { ascending: false });
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const page = Math.max(1, options?.page || 1);
    const limit = options?.limit || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error in getProducts:', error);
      throw error;
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      products: (data || []).map(mapDbProductToProduct),
      total: totalCount,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  } catch (err) {
    console.error('Error fetching products from Supabase server:', err);
    return { products: [], total: 0, page: 1, totalPages: 0, hasMore: false };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), product_images(*), product_variants(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error(`Product slug ${slug} not found or error:`, error?.message);
      return null;
    }

    return mapDbProductToProduct(data);
  } catch (err) {
    console.error(`Exception fetching product by slug ${slug}:`, err);
    return null;
  }
}

export async function getRelatedProducts(productId: string, categorySlug: string, limit = 4): Promise<Product[]> {
  try {
    const result = await getProducts({ categorySlug, limit: limit + 1 });
    return result.products.filter(p => p.id !== productId).slice(0, limit);
  } catch {
    return [];
  }
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
      
    if (error || !data) return [];
    
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
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (error || !data) return [];
    
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      tagline: c.description?.substring(0, 50) || 'Discover beautiful heirloom toys',
      description: c.description || '',
      iconName: 'Sparkles',
      image: c.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=80',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-800',
      itemCount: 0,
      isFeatured: !!c.is_featured
    }));
  } catch {
    return [];
  }
}
