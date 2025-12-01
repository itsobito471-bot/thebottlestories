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
// --- ADDED: AlertCircle, CheckCircle2 ---
import { Plus, Edit, Trash2, Package, ImageOff, Loader2, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

// --- SKELETON COMPONENT ---
const ProductsSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <AdminNav />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-48 mt-3" />
        </div>
        <Skeleton className="h-10 w-full md:w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden shadow-sm border-none">
            <Skeleton className="h-56 w-full" />
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex items-baseline gap-2 pt-2">
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="flex gap-2 pt-2">
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

// --- ANIMATION VARIANTS ---
const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const router = useRouter();

  // --- Alert Result State ---
  const [resultAlert, setResultAlert] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'success',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const res = await getAdminProducts(1, 10);
      setProducts(res.data || []);
      setHasMore(res.hasMore);
      setPage(1);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      if (error.message?.includes('401')) {
        router.push('/admin/login');
      }
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getAdminProducts(nextPage, 10);
      
      setProducts(prev => [...prev, ...res.data]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
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
      
      setDeleteProduct(null);
      
      setResultAlert({
        isOpen: true,
        title: 'Deleted!',
        description: 'The product has been successfully removed from inventory.',
        type: 'success'
      });
      
      loadInitialData();
      
    } catch (error: any) {
      console.error('Error deleting product:', error);
      
      setDeleteProduct(null);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product.';

      setResultAlert({
        isOpen: true,
        title: 'Cannot Delete Product',
        description: errorMessage,
        type: 'error'
      });
    }
  };

  if (loading) {
    return <ProductsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Product Inventory</h2>
            <p className="text-slate-500 mt-1">Manage your catalogue, prices, and stock.</p>
          </div>
          <Button onClick={handleAddProduct} className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 shadow-lg transition-all rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>

        {products.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700">No Products Found</h3>
              <p className="text-slate-500 mt-2 mb-6">Get started by adding your first product.</p>
              <Button onClick={handleAddProduct}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={gridVariants}
              initial="hidden"
              animate="show"
            >
              {products.map((product) => (
                <motion.div key={product._id} variants={cardVariants}>
                  <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1 bg-white">
                    
                    {/* --- IMAGE CONTAINER --- */}
                    <div className="h-56 w-full relative bg-slate-100">
                      {!product.images || product.images.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageOff className="w-10 h-10" />
                        </div>
                      ) : product.images.length === 1 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Carousel className="w-full h-full">
                          <CarouselContent className="ml-0">
                            {product.images.map((url, index) => (
                              <CarouselItem key={index} className="pl-0">
                                <div className="h-56 w-full">
                                  <img
                                    src={url}
                                    alt={`${product.name} image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white border-none" />
                          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white border-none" />
                        </Carousel>
                      )}

                      {/* Tag Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        {Array.isArray(product.tags) && product.tags.map((t: any, idx) => (
                          <Badge 
                            key={idx} 
                            className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur-sm shadow-sm border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide"
                          >
                            {typeof t === 'object' ? t.name : 'Tag'}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <CardContent className="p-5 flex flex-col flex-1">
                      {/* Title & Status */}
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1" title={product.name}>
                          {product.name}
                        </h3>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          product.is_active 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                          {product.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-grow">
                        {product.description || 'No description provided.'}
                      </p>

                      {/* Price & Stock */}
                      <div className="flex items-end justify-between mb-4 pb-4 border-b border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-medium uppercase">Price</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-slate-900">
                              ₹{product.price.toFixed(2)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-slate-400 line-through decoration-slate-300">
                                ₹{product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 font-medium uppercase">Stock</span>
                          <p className="font-semibold text-slate-700">{product.stock_quantity} <span className="text-xs font-normal text-slate-400">units</span></p>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 mt-auto">
                        <Button
                          variant="outline"
                          className="flex-1 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteProduct(product)}
                          className="border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* --- Load More Button --- */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore} 
                  disabled={loadingMore}
                  className="px-8 py-6 rounded-full border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Load More Products
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <ProductForm
        product={selectedProduct}
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          loadInitialData();
        }}
      />

      {/* --- 1. Delete Confirmation Dialog --- */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
         <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteProduct?.name}"</span>? 
              This action cannot be undone and will remove it from the store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700 border-none">
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- 2. Result (Success/Error) Dialog WITH ICONS --- */}
      <AlertDialog open={resultAlert.isOpen} onOpenChange={(open) => {
        if (!open) setResultAlert(prev => ({ ...prev, isOpen: false }));
      }}>
         <AlertDialogContent className="max-w-md text-center">
          <AlertDialogHeader className="flex flex-col items-center gap-2">
            
            {/* ICON LOGIC */}
            {resultAlert.type === 'success' ? (
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            )}

            <AlertDialogTitle className={`text-xl ${resultAlert.type === 'error' ? 'text-red-600' : 'text-slate-900'}`}>
              {resultAlert.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-600">
              {resultAlert.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction 
              onClick={() => setResultAlert(prev => ({ ...prev, isOpen: false }))}
              className={`w-full sm:w-auto ${resultAlert.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900'}`}
            >
              {resultAlert.type === 'error' ? 'Close' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}