'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// --- Updated Imports ---
import { getAdminProducts, deleteAdminProduct } from '@/lib/appService';
import { Product } from '@/lib/types';
import AdminNav from '@/components/admin/AdminNav';
import ProductForm from '@/components/admin/ProductForm';
// --- End Updated Imports ---
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
import Swal from 'sweetalert2';

export default function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Replaced checkAuth with a single fetch function
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAdminProducts();
      setProducts(data || []);
    } catch (error: any) {
      // If fetching fails (e.g., 401 Unauthorized), redirect to login
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

  // Updated to use the new API service
  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;

    try {
      await deleteAdminProduct(deleteProduct._id); // <-- Use _id
      await fetchProducts(); // Refresh list
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
            {/* ... (empty state JSX is unchanged) ... */}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* --- JSX Updated to use _id --- */}
            {products.map((product) => (
              <Card key={product._id} className="overflow-hidden"> 
                <div className="aspect-video bg-slate-200 relative">
                  {/* ... (image JSX is unchanged) ... */}
                </div>
                <CardContent className="p-4">
                  {/* ... (content JSX is unchanged) ... */}
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
            {/* --- End JSX Update --- */}
          </div>
        )}
      </main>

      <ProductForm
        product={selectedProduct}
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false); // Close form
          fetchProducts();    // Refresh list
        }}
      />

      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        {/* ... (AlertDialog JSX is unchanged) ... */}
      </AlertDialog>
    </div>
  );
}