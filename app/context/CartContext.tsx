'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Product } from '@/lib/types';
import { saveCart, mergeCart } from '@/lib/appService';
import { useRouter } from 'next/navigation';

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selectedFragrances?: string[]; 
  customMessage?: string;
}

interface CartContextType {
  cart: CartItem[];
  directCart: CartItem[]; // <--- NEW: Separate cart for "Buy Now" / "Order Again"
  
  // Updated: quantity is now optional (defaults to 1)
  addToCart: (product: Product, quantity?: number, options?: { fragrances?: string[], message?: string }) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, change: number) => void;
  clearCart: () => void;
  
  // --- NEW FUNCTIONS ---
  startDirectCheckout: (items: CartItem[]) => void;
  clearDirectCart: () => void;
  
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [directCart, setDirectCart] = useState<CartItem[]>([]); // <--- NEW STATE
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  
  const shouldSyncToDb = useRef(false);

  // 1. LOAD: Check localStorage for both carts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const savedCartStr = localStorage.getItem('thebottlestories_cart');
      const savedDirectCartStr = localStorage.getItem('thebottlestories_direct'); // <--- LOAD DIRECT CART

      let localCart: CartItem[] = [];

      if (savedCartStr) {
        try { localCart = JSON.parse(savedCartStr); } catch (e) { console.error("Error parsing cart", e); }
      }
      
      if (savedDirectCartStr) {
        try { setDirectCart(JSON.parse(savedDirectCartStr)); } catch (e) { console.error("Error parsing direct cart", e); }
      }

      const initializeCart = async () => {
        if (token) {
          // USER LOGGED IN:
          if (localCart.length > 0) {
            // Case A: Has local items -> Merge with DB
            try {
              const mergedItems = await mergeCart(localCart);
              const formatted = formatBackendItems(mergedItems as any[]);
              setCart(formatted);
              localStorage.removeItem('thebottlestories_cart'); 
            } catch (e) {
              console.error("Merge failed", e);
              setCart(localCart); // Fallback
            }
          } else {
            // Case B: No local items -> Just fetch DB cart
            try {
              const dbItems = await mergeCart([]); 
              setCart(formatBackendItems(dbItems as any[]));
            } catch (e) { console.error(e); }
          }
        } else {
          // GUEST: Just load local cart
          setCart(localCart);
        }
        setIsInitialized(true);
        setTimeout(() => { shouldSyncToDb.current = true; }, 500);
      };

      initializeCart();
    }
  }, []);

  // 2. SAVE: Persist both carts
  useEffect(() => {
    if (isInitialized) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Main Cart Logic
      if (token && shouldSyncToDb.current) {
        saveCart(cart).catch(err => console.error("Auto-save failed", err));
      } else {
        localStorage.setItem('thebottlestories_cart', JSON.stringify(cart));
      }

      // Direct Cart Logic (Always Local is fine for temporary flow)
      localStorage.setItem('thebottlestories_direct', JSON.stringify(directCart));
    }
  }, [cart, directCart, isInitialized]);

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

  // --- Actions ---

  const addToCart = (product: Product, quantity: number = 1, options: { fragrances?: string[], message?: string } = {}) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => {
        const isSameProduct = item._id === product._id;
        const currentFragrances = JSON.stringify(item.selectedFragrances?.sort() || []);
        const newFragrances = JSON.stringify(options.fragrances?.sort() || []);
        const isSameFragrances = currentFragrances === newFragrances;
        const isSameMessage = (item.customMessage || '') === (options.message || '');

        return isSameProduct && isSameFragrances && isSameMessage;
      });

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

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
    if (typeof window !== 'undefined') localStorage.removeItem('thebottlestories_cart');
  };

  // --- NEW ACTIONS ---
  const startDirectCheckout = (items: CartItem[]) => {
    setDirectCart(items);
  };

  const clearDirectCart = () => {
    setDirectCart([]);
    if (typeof window !== 'undefined') localStorage.removeItem('thebottlestories_direct');
  };

  // --- Calculations ---
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, directCart, 
      addToCart, removeFromCart, updateQuantity, clearCart, 
      startDirectCheckout, clearDirectCart, 
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