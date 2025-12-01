'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { Product } from '@/lib/types';
import { saveCart, mergeCart, fetchCart } from '@/lib/appService';
import { useRouter } from 'next/navigation';

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selectedFragrances?: string[]; 
  customMessage?: string;
}

interface CartContextType {
  cart: CartItem[];
  directCart: CartItem[];
  addToCart: (product: Product, quantity?: number, options?: { fragrances?: string[], message?: string }) => void;
  // --- FIX: Added addToDirectCart to type definition ---
  addToDirectCart: (product: Product, quantity?: number, options?: { fragrances?: string[], message?: string }) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, change: number) => void;
  updateItemMetaData: (cartId: string, updates: { selectedFragrances?: string[], customMessage?: string }) => void;
  clearCart: () => void;
  startDirectCheckout: (items: CartItem[]) => void;
  clearDirectCart: () => void;
  syncCart: () => Promise<void>; 
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [directCart, setDirectCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
   
  const isSyncing = useRef(false);

  const formatBackendItems = (backendItems: any[]): CartItem[] => {
    return backendItems.map((item: any) => ({
      ...item.product, 
      cartId: item._id || `${item.product._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      quantity: item.quantity,
      selectedFragrances: item.selected_fragrances,
      customMessage: item.custom_message
    }));
  };

  const syncCart = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    isSyncing.current = true; 
    const token = localStorage.getItem('token');
    
    const savedCartStr = localStorage.getItem('thebottlestories_cart');
    let localCart: CartItem[] = savedCartStr ? JSON.parse(savedCartStr) : [];

    try {
      if (token) {
        if (localCart.length > 0) {
          console.log("Merging local cart with DB...");
          const mergedItems = await mergeCart(localCart);
          setCart(formatBackendItems(mergedItems as any[]));
          localStorage.removeItem('thebottlestories_cart'); 
        } else {
          console.log("Fetching DB cart...");
          const dbItems = await fetchCart(); 
          setCart(formatBackendItems(dbItems as any[]));
        }
      } else {
        setCart(localCart);
      }
    } catch (e) {
      console.error("Cart Sync Failed", e);
    } finally {
      setIsInitialized(true);
      setTimeout(() => { isSyncing.current = false; }, 500);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const savedDirectCartStr = localStorage.getItem('thebottlestories_direct');
      if (savedDirectCartStr) {
          try { setDirectCart(JSON.parse(savedDirectCartStr)); } catch (e) { console.error(e); }
      }

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        const urlUser = params.get('user');

        if (urlToken) {
           localStorage.setItem('token', urlToken);
           if (urlUser) localStorage.setItem('user', urlUser);
           window.history.replaceState({}, document.title, window.location.pathname);
           await syncCart();
           return;
        }
      }

      syncCart();
    };

    initialize();
  }, [syncCart]);

  // --- AUTO-SAVE EFFECT ---
  useEffect(() => {
    if (isInitialized && !isSyncing.current) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (token) {
        if (cart.length > 0 || isInitialized) { 
           saveCart(cart).catch(err => console.error("Auto-save failed", err));
        }
      } else {
        localStorage.setItem('thebottlestories_cart', JSON.stringify(cart));
      }

      // Save direct cart to local storage so it persists across the redirect
      localStorage.setItem('thebottlestories_direct', JSON.stringify(directCart));
    }
  }, [cart, directCart, isInitialized]);

  // --- ACTIONS ---

  const addToCart = (product: Product, quantity: number = 1, options: { fragrances?: string[], message?: string } = {}) => {
    setCart((prev) => {
      const uniqueCartId = `${product._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newItem: CartItem = {
        ...product,
        cartId: uniqueCartId,
        quantity, 
        selectedFragrances: options.fragrances || [],
        customMessage: options.message || ''
      };
      return [...prev, newItem];
    });
  };

  // --- FIX: ADDED addToDirectCart ---
  const addToDirectCart = (product: Product, quantity: number = 1, options: { fragrances?: string[], message?: string } = {}) => {
    setDirectCart((prev) => {
      const uniqueCartId = `${product._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newItem: CartItem = {
        ...product,
        cartId: uniqueCartId,
        quantity, 
        selectedFragrances: options.fragrances || [],
        customMessage: options.message || ''
      };
      // We append to allow multiple distinct items (different scents)
      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, change: number) => {
    // Helper to update distinct list
    const updater = (list: CartItem[]) => list.map((item) => {
        if (item.cartId === cartId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
    });

    setCart(prev => updater(prev));
    setDirectCart(prev => updater(prev));
  };

  const updateItemMetaData = (cartId: string, updates: { selectedFragrances?: string[], customMessage?: string }) => {
    const updater = (prev: CartItem[]) => prev.map((item) => {
      if (item.cartId === cartId) {
        return { ...item, ...updates };
      }
      return item;
    });

    setCart(updater);
    setDirectCart(updater);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('thebottlestories_cart');
  };

  const startDirectCheckout = (items: CartItem[]) => setDirectCart(items);
  
  const clearDirectCart = () => {
    setDirectCart([]);
    localStorage.removeItem('thebottlestories_direct');
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, directCart, 
      addToCart, addToDirectCart, removeFromCart, updateQuantity, updateItemMetaData, clearCart, 
      startDirectCheckout, clearDirectCart, 
      syncCart, 
      cartTotal, cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
}