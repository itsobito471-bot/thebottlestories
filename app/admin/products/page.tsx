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

// --- 1. Updated Imports ---
import { Plus, Edit, Trash2, Package, ImageOff } from 'lucide-react'; // Added ImageOff
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'; // Added Carousel
// --- End Updated Imports ---

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
      setLoading(false);
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
      await fetchProducts();
      setDeleteProduct(null);
      Swal.fire('Deleted!', 'The product has been deleted.', 'success');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      Swal.fire('Error', error.message || 'Failed to delete product.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Products</h2>
            <p className="text-slate-600 mt-2">Manage your product inventory</p>
          </div>
          <Button onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700">No Products Yet</h3>
              <p className="text-slate-500 mt-2 mb-6">Get started by adding your first product.</p>
              <Button onClick={handleAddProduct}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="overflow-hidden shadow-sm">
                
                {/* --- 2. Updated JSX for Image/Carousel --- */}
                <div className="aspect-video bg-slate-100 relative">
                  {!product.images || product.images.length === 0 ? (
                    // Case 1: No Images
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageOff className="w-12 h-12" />
                    </div>
                  ) : product.images.length === 1 ? (
                    // Case 2: Single Image
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Case 3: Multiple Images (Carousel)
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
                  {/* Show tag */}
                  {product.tag && (
                    <Badge variant="default" className="absolute top-3 right-3">
                      {product.tag}
                    </Badge>
                  )}
                </div>
                {/* --- End Updated JSX --- */}

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                    <Badge variant={product.is_active ? 'secondary' : 'destructive'}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 truncate">
                    {product.description || 'No description'}
                  </p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-slate-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-md text-slate-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    Stock: <span className="font-medium text-slate-700">{product.stock_quantity}</span>
                  </p>
                  
                  <div className="flex gap-2">
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
            ))}
          </div>
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