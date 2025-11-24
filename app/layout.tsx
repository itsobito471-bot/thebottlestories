import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CartProvider } from '../app/context/CartContext'; // <-- 1. Import the Provider

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Bottle Stories',
  description: 'Crafting Scents, Creating Memories',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={inter.className}>
        {/* 2. Wrap children with CartProvider */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}