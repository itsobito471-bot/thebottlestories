'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { Product } from '@/lib/types';
import { saveCart, mergeCart, fetchCart } from '@/lib/appService';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams

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
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, change: number) => void;
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
  
  // Ref to prevent auto-save loops
  const isSyncing = useRef(false);

  // --- Helpers ---
  const formatBackendItems = (backendItems: any[]): CartItem[] => {
    return backendItems.map((item: any) => ({
      ...item.product, 
      cartId: item._id || Math.random().toString(), 
      quantity: item.quantity,
      selectedFragrances: item.selected_fragrances,
      customMessage: item.custom_message
    }));
  };

  // --- SYNC FUNCTION ---
  const syncCart = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    isSyncing.current = true; 
    const token = localStorage.getItem('token');
    
    // Load local cart strictly for merging purposes
    const savedCartStr = localStorage.getItem('thebottlestories_cart');
    let localCart: CartItem[] = savedCartStr ? JSON.parse(savedCartStr) : [];

    try {
      if (token) {
        // --- LOGGED IN USER ---
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
        // --- GUEST ---
        setCart(localCart);
      }
    } catch (e) {
      console.error("Cart Sync Failed", e);
    } finally {
      setIsInitialized(true);
      setTimeout(() => { isSyncing.current = false; }, 500);
    }
  }, []);

  // --- 1. INITIALIZE & CHECK FOR SOCIAL LOGIN TOKEN ---
  useEffect(() => {
    const initialize = async () => {
      // A. Check for Direct Cart
      const savedDirectCartStr = localStorage.getItem('thebottlestories_direct');
      if (savedDirectCartStr) {
          try { setDirectCart(JSON.parse(savedDirectCartStr)); } catch (e) { console.error(e); }
      }

      // B. SOCIAL LOGIN HANDLER (New Logic)
      // Check if we just came back from Google with a token in URL
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        const urlUser = params.get('user'); // Optional: if backend sends user string

        if (urlToken) {
           console.log("Social Login Detected: Syncing...");
           // 1. Save Token
           localStorage.setItem('token', urlToken);
           if (urlUser) localStorage.setItem('user', urlUser);

           // 2. Clean URL (Remove token from address bar for security/cleanliness)
           window.history.replaceState({}, document.title, window.location.pathname);
           
           // 3. Force Sync Immediately
           await syncCart();
           return; // Sync is done, exit
        }
      }

      // C. Normal Load (If no social login happened)
      syncCart();
    };

    initialize();
  }, [syncCart]);

  // --- 2. AUTO-SAVE ---
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

      localStorage.setItem('thebottlestories_direct', JSON.stringify(directCart));
    }
  }, [cart, directCart, isInitialized]);

  // --- Actions ---
  const addToCart = (product: Product, quantity: number = 1, options: { fragrances?: string[], message?: string } = {}) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => {
        const isSameProduct = item._id === product._id;
        const currentFragrances = JSON.stringify(item.selectedFragrances?.sort() || []);
        const newFragrances = JSON.stringify(options.fragrances?.sort() || []);
        return isSameProduct && currentFragrances === newFragrances;
      });

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

      const newItem: CartItem = {
        ...product,
        cartId: `${product._id}-${Date.now()}`,
        quantity,
        selectedFragrances: options.fragrances || [],
        customMessage: options.message || ''
      };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, change: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
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
      addToCart, removeFromCart, updateQuantity, clearCart, 
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