'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Product } from '@/lib/types';
import { saveCart, mergeCart } from '@/lib/appService';

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selectedFragrances?: string[]; 
  customMessage?: string;
}

interface CartContextType {
  cart: CartItem[];
  // Updated: quantity is now optional (defaults to 1)
  addToCart: (product: Product, quantity?: number, options?: { fragrances?: string[], message?: string }) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, change: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track if we should sync to DB (prevent syncing on initial load)
  const shouldSyncToDb = useRef(false);

  // 1. INITIAL LOAD & MERGE STRATEGY
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const savedCartStr = localStorage.getItem('thebottlestories_cart');
      let localCart: CartItem[] = [];

      if (savedCartStr) {
        try { localCart = JSON.parse(savedCartStr); } catch (e) {}
      }

      const initializeCart = async () => {
        if (token) {
          // USER LOGGED IN:
          if (localCart.length > 0) {
            // Case A: Has local items -> Merge with DB
            try {
              const mergedItems = await mergeCart(localCart);
              // Backend returns standardized items, might need formatting to match CartItem
              const formatted = formatBackendItems(mergedItems as any[]);
              setCart(formatted);
              // Clear local storage now that it's in DB
              localStorage.removeItem('thebottlestories_cart'); 
            } catch (e) {
              console.error("Merge failed", e);
              setCart(localCart); // Fallback
            }
          } else {
            // Case B: No local items -> Just fetch DB cart
            try {
              const dbItems = await mergeCart([]); // Reuse merge endpoint to get current
              setCart(formatBackendItems(dbItems as any[]));
            } catch (e) { console.error(e); }
          }
        } else {
          // GUEST: Just load local cart
          setCart(localCart);
        }
        setIsInitialized(true);
        // Enable syncing for future changes
        setTimeout(() => { shouldSyncToDb.current = true; }, 500);
      };

      initializeCart();
    }
  }, []);

  // 2. PERSIST: Save to LocalStorage (Guest) OR Database (User)
  useEffect(() => {
    if (!isInitialized) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
      // Logged In: Save to DB (Debounce could be added here for performance)
      if (shouldSyncToDb.current) {
        saveCart(cart).catch(err => console.error("Auto-save failed", err));
      }
    } else {
      // Guest: Save to LocalStorage
      localStorage.setItem('thebottlestories_cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // --- Helpers ---
  
  // Format backend response (which has nested product object) back to flat CartItem
  const formatBackendItems = (backendItems: any[]): CartItem[] => {
    return backendItems.map((item: any) => ({
      ...item.product, // Spread product details
      cartId: item._id || Math.random().toString(), // Use DB ID or random
      quantity: item.quantity,
      selectedFragrances: item.selected_fragrances,
      customMessage: item.custom_message
    }));
  };

  // --- Actions ---

  // Updated implementation: quantity defaults to 1
  const addToCart = (product: Product, quantity: number = 1, options: { fragrances?: string[], message?: string } = {}) => {
    setCart((prev) => {
      // Check if an IDENTICAL item already exists (same product + same options)
      const existingIndex = prev.findIndex((item) => {
        const isSameProduct = item._id === product._id;
        
        // Compare sorted arrays to ensure order doesn't matter
        const currentFragrances = JSON.stringify(item.selectedFragrances?.sort() || []);
        const newFragrances = JSON.stringify(options.fragrances?.sort() || []);
        const isSameFragrances = currentFragrances === newFragrances;
        
        const isSameMessage = (item.customMessage || '') === (options.message || '');

        return isSameProduct && isSameFragrances && isSameMessage;
      });

      if (existingIndex > -1) {
        // If exact item exists, just update quantity
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

      // Else add new item with a unique cartId
      const newItem: CartItem = {
        ...product,
        cartId: `${product._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('thebottlestories_cart');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
}