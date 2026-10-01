import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Just Born | Premium, Playful & Heirloom Toys for Curious Minds',
  description:
    'A luxury, joyful toy store crafting timeless wooden Montessori toys, organic linen plushies, and sensory treasures designed for children and parents.',
  keywords: [
    'wooden toys',
    'Montessori',
    'heirloom toy store',
    'non-toxic toys',
    'Just Born',
    'sustainable toys',
    'organic plush',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#26221F] font-sans antialiased selection:bg-[#FED3C7] selection:text-[#9A3412]">
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
