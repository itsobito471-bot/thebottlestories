// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// export interface AdminUser {
//   id: string;
//   email: string;
//   full_name: string;
//   created_at: string;
// }

// export interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   category: string;
//   image_url: string | null;
//   stock_quantity: number;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export interface Order {
//   id: string;
//   customer_name: string;
//   customer_email: string;
//   customer_phone: string;
//   customer_address: string;
//   total_amount: number;
//   status: 'pending' | 'approved' | 'rejected' | 'completed';
//   created_at: string;
//   updated_at: string;
// }

// export interface OrderItem {
//   id: string;
//   order_id: string;
//   product_id: string;
//   quantity: number;
//   price_at_time: number;
//   created_at: string;
// }

// export interface OrderWithItems extends Order {
//   items: (OrderItem & { product: Product })[];
// }
