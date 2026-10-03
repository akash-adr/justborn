import { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/services/server/productService';
import ShopClient from './ShopClient';

export const revalidate = 60; // Cache for 60s

export default async function ShopPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await props.searchParams;

  const page = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const categorySlug = typeof sp.category === 'string' ? sp.category : 'all';
  const search = typeof sp.search === 'string' ? sp.search : undefined;
  const sortBy = typeof sp.sortBy === 'string' ? sp.sortBy : 'featured';
  const ageGroup = typeof sp.age === 'string' ? sp.age : 'all';
  const minPrice = typeof sp.min === 'string' ? parseInt(sp.min, 10) : undefined;
  const maxPrice = typeof sp.max === 'string' ? parseInt(sp.max, 10) : undefined;
  const inStockOnly = sp.inStock === 'true';

  const [paginatedData, categoriesData] = await Promise.all([
    getProducts({
      page,
      limit: 12,
      categorySlug,
      search,
      sortBy,
      ageGroup,
      minPrice,
      maxPrice,
      inStockOnly
    }),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <ShopClient 
        initialData={paginatedData} 
        categories={categoriesData}
        searchParams={sp}
      />
    </div>
  );
}
