'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { Product } from '@/lib/types';
import { productService } from '@/lib/services/productService';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ProductBadgeTag, AgeBadge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/product/ProductCard';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Truck,
  RotateCcw,
  CheckCircle2,
  Minus,
  Plus,
  ArrowLeft,
  ChevronRight,
  Leaf,
  Layers,
  Ruler,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      const found = await productService.getProductBySlug(slug);
      if (found) {
        setProduct(found);
        const related = await productService.getRelatedProducts(found.id, found.categorySlug, 4);
        setRelatedProducts(related);
      }
      setLoading(false);
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E76F51] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-black text-stone-900 mb-2">Toy Not Found</h2>
        <p className="text-sm text-stone-500 mb-6">
          This piece might have been retired or moved to another playroom shelf.
        </p>
        <Link href="/shop">
          <Button variant="primary">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, true);
  };

  return (
    <div className="min-h-screen py-8 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-8">
          <Link href="/" className="hover:text-stone-700 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-stone-700 transition">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/shop?category=${product.categorySlug}`}
            className="hover:text-stone-700 transition"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-stone-800 line-clamp-1">{product.name}</span>
        </nav>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white rounded-[2.5rem] p-6 sm:p-10 border border-stone-200/80 shadow-sm">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-100 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Floating badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                {product.badges.map((b) => (
                  <ProductBadgeTag key={b} badge={b} />
                ))}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition shadow-md ${
                  wishlisted
                    ? 'bg-rose-50 text-rose-500 ring-2 ring-rose-200'
                    : 'bg-white/95 text-stone-600 hover:text-rose-500'
                }`}
                aria-label="Wishlist toggle"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                      selectedImage === idx
                        ? 'border-[#E76F51] shadow-md ring-2 ring-[#FED3C7]'
                        : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Category & Age */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <Link
                  href={`/shop?category=${product.categorySlug}`}
                  className="text-xs font-bold text-[#D65A3B] uppercase tracking-wider hover:underline"
                >
                  {product.category}
                </Link>
                <AgeBadge age={product.ageGroup} />
              </div>

              {/* Title & Tagline */}
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-sm font-medium text-stone-500 mt-2">
                {product.tagline}
              </p>

              {/* Star Rating */}
              <div className="flex items-center gap-2 mt-4 pb-5 border-b border-stone-100">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-stone-800">{product.rating}</span>
                <span className="text-xs text-stone-400">
                  ({product.reviewCount} verified parent reviews)
                </span>
                <span className="text-xs text-emerald-600 font-semibold ml-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock & Ready to Ship
                </span>
              </div>

              {/* Pricing */}
              <div className="py-5 flex items-baseline gap-3">
                <span className="text-3xl font-black text-stone-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-stone-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>

              {/* Features List */}
              <div className="mt-6 space-y-2">
                <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Developmental Highlights:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#E76F51] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials & Specs */}
              <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 font-medium block">Crafted From:</span>
                  <span className="font-bold text-stone-800 mt-0.5 block">
                    {product.materials.join(', ')}
                  </span>
                </div>
                {product.dimensions && (
                  <div>
                    <span className="text-stone-400 font-medium block">Dimensions:</span>
                    <span className="font-bold text-stone-800 mt-0.5 block">
                      {product.dimensions}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Quantity & Add to Cart */}
            <div className="mt-8 pt-6 border-t border-stone-100 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 shadow-lg shadow-[#E76F51]/25"
                  leftIcon={<ShoppingBag className="w-5 h-5" />}
                >
                  Add to Toy Basket • {formatPrice(product.price * quantity)}
                </Button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-3 text-center text-[11px] text-stone-500 font-medium border-t border-stone-100">
                <div className="flex items-center justify-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-stone-400" />
                  <span>Free US shipping over $75</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                  <span>100-Day Playroom trial</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Non-Toxic & Lead Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-stone-900">
                  Complementary Play Companions
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  More favorites from the {product.category} collection
                </p>
              </div>
              <Link
                href={`/shop?category=${product.categorySlug}`}
                className="text-xs font-bold text-[#E76F51] hover:underline"
              >
                View collection
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
