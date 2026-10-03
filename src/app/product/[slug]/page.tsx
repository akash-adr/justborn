import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts, getProductReviews } from '@/lib/services/server/productService';
import ProductClient from './ProductClient';

export const revalidate = 60; // Cache for 60s

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts, initialReviews] = await Promise.all([
    getRelatedProducts(product.id, product.categorySlug),
    getProductReviews(product.id)
  ]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <ProductClient 
        product={product} 
        relatedProducts={relatedProducts} 
        initialReviews={initialReviews} 
      />
    </div>
  );
}
