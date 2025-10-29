'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminAuth } from '@/lib/admin-auth';
import { supabase, Product } from '@/lib/supabase';
import AdminNav from '@/components/admin/AdminNav';
import ProductForm from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
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

export default function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      router.push('/admin/login');
      return;
    }
    await fetchProducts();
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
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
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteProduct.id);

      if (error) throw error;

      await fetchProducts();
      setDeleteProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
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
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-slate-600 text-lg mb-4">No products yet</p>
              <Button onClick={handleAddProduct}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video bg-slate-200 relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                    <span className="text-sm text-slate-600">Stock: {product.stock_quantity}</span>
                  </div>
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
        onSuccess={fetchProducts}
      />

      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteProduct?.name}? This action cannot be undone.
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
