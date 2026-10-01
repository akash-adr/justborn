import React from 'react';
import { productService } from '@/lib/services/productService';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { NewArrivals } from '@/components/home/NewArrivals';
import { BestSellers } from '@/components/home/BestSellers';
import { PromoBanner } from '@/components/home/PromoBanner';
import { WhyJustBorn } from '@/components/home/WhyJustBorn';
import { CustomerReviews } from '@/components/home/CustomerReviews';
import { NewsletterSection } from '@/components/home/NewsletterSection';

export const revalidate = 60; // Ready for Supabase cache revalidation

export default async function HomePage() {
  const products = await productService.getProducts();

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Featured Categories */}
      <FeaturedCategories />

      {/* 3. Featured Products */}
      <FeaturedProducts products={products} />

      {/* 4. New Arrivals */}
      <NewArrivals products={products} />

      {/* 5. Promotional Banner */}
      <PromoBanner />

      {/* 6. Best Sellers */}
      <BestSellers products={products} />

      {/* 7. Why Just Born (Value propositions) */}
      <WhyJustBorn />

      {/* 8. Customer Reviews */}
      <CustomerReviews />

      {/* 9. Newsletter Section */}
      <NewsletterSection />
      {/* 10. Footer is rendered by layout.tsx */}
    </div>
  );
}
