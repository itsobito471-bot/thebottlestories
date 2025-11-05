'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminProducts, deleteAdminProduct } from '@/lib/appService';
import { Product } from '@/lib/types';
import AdminNav from '@/components/admin/AdminNav';
import ProductForm from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, ImageOff } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Swal from 'sweetalert2';

// --- 1. NEW IMPORTS ---
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
// --- END NEW IMPORTS ---

// --- 2. SKELETON COMPONENT ---
// A professional loading state that mimics the card layout
const ProductsSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <AdminNav />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Skeleton for the header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-48 mt-3" />
        </div>
        <Skeleton className="h-10 w-full md:w-32" />
      </div>
      {/* Skeleton for the grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden shadow-sm">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-5 w-1/4" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-4 w-1/4 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  </div>
);
// --- END SKELETON COMPONENT ---

// --- 3. ANIMATION VARIANTS ---
const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Each card animates 0.05s after the previous
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 }, // Start invisible and 20px down
  show: { opacity: 1, y: 0 },    // Animate to visible and 0px
};
// --- END ANIMATION VARIANTS ---

export default function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAdminProducts();
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      if (error.message.includes('401')) {
        router.push('/admin/login');
      }
    } finally {
      // Add small delay to prevent skeleton flashing
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    try {
      await deleteAdminProduct(deleteProduct._id);
      await fetchProducts(); // Re-fetch to update list
      setDeleteProduct(null);
      Swal.fire('Deleted!', 'The product has been deleted.', 'success');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      Swal.fire('Error', error.message || 'Failed to delete product.', 'error');
    }
  };

  // --- 4. USE SKELETON COMPONENT ---
  if (loading) {
    return <ProductsSkeleton />;
  }
  // --- END SKELETON USAGE ---

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- 5. RESPONSIVE HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Products</h2>
            <p className="text-slate-600 mt-2">Manage your product inventory</p>
          </div>
          <Button onClick={handleAddProduct} className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
        {/* --- END RESPONSIVE HEADER --- */}

        {products.length === 0 ? (
          <Card>
            {/* ... (empty state content is unchanged) ... */}
          </Card>
        ) : (
          // --- 6. ADD ANIMATION ---
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={gridVariants}
            initial="hidden"
            animate="show"
          >
            {/* We are mapping all products, no pagination */}
            {products.map((product) => (
              <motion.div key={product._id} variants={cardVariants}>
                {/* h-full and flex-col ensure cards are same height */}
                <Card className="overflow-hidden shadow-sm h-full flex flex-col">
                  
                  <div className="aspect-video bg-slate-100 relative">
                    {/* ... (Your carousel logic is unchanged) ... */}
                    {!product.images || product.images.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageOff className="w-12 h-12" />
                      </div>
                    ) : product.images.length === 1 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Carousel className="w-full h-full">
                        <CarouselContent>
                          {product.images.map((url, index) => (
                            <CarouselItem key={index}>
                              <img
                                src={url}
                                alt={`${product.name} image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-2 bg-white/50 hover:bg-white text-black" />
                        <CarouselNext className="absolute right-2 bg-white/50 hover:bg-white text-black" />
                      </Carousel>
                    )}
                    {product.tag && (
                      <Badge variant="default" className="absolute top-3 right-3">
                        {product.tag}
                      </Badge>
                    )}
                  </div>
                  
                  {/* flex-1 makes this content block grow */}
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <Badge variant={product.is_active ? 'secondary' : 'destructive'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {/* flex-grow allows the description to push buttons down */}
                    <p className="text-sm text-slate-600 mb-3 truncate flex-grow">
                      {product.description || 'No description'}
                    </p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-slate-900">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-md text-slate-500 line-through">
                          ₹{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-4">
                      Stock: <span className="font-medium text-slate-700">{product.stock_quantity}</span>
                    </p>
                    
                    {/* mt-auto pushes buttons to the bottom of the card */}
                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteProduct(product)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          // --- END ANIMATION & GRID ---
        )}
      </main>

      <ProductForm
        product={selectedProduct}
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          fetchProducts();
        }}
      />

      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
         <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteProduct?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}