// components/admin/ProductForm.tsx

'use client';

import { useState, useEffect } from 'react';
// --- Updated Imports ---
import { Product } from '@/lib/types';
import { createAdminProduct, updateAdminProduct, uploadAdminImages } from '@/lib/appService';
// --- End Updated Imports ---

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface ProductFormProps {
  product?: Product;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, open, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    features: '', 
    tag: '',
    stock_quantity: 0,
    is_active: true,
  });
  
  // Changed from imageFile (singular)
  const [imageFiles, setImageFiles] = useState<FileList | null>(null); 
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        features: product.features?.join('\n') || '',
        tag: product.tag || '',
        stock_quantity: product.stock_quantity || 0,
        is_active: product.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        features: '',
        tag: '',
        stock_quantity: 0,
        is_active: true,
      });
    }
    // Clear file input and errors when dialog opens/closes
    setImageFiles(null);
    setError('');
  }, [product, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(e.target.files);
    }
  };

  // --- Reworked HandleSubmit (No Supabase) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      let finalImageUrls: string[] = product?.images || [];

      // 1. Upload new images (if any) to your Node.js server
      if (imageFiles && imageFiles.length > 0) {
        const uploadFormData = new FormData();
        Array.from(imageFiles).forEach(file => {
          uploadFormData.append('images', file); // 'images' must match backend 'upload.array('images')'
        });

        const uploadResponse = await uploadAdminImages(uploadFormData);
        finalImageUrls = uploadResponse.urls; // Overwrite old images
      }

      // 2. Prepare product data for MongoDB
      const productData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || undefined,
        stock_quantity: Number(formData.stock_quantity),
        features: formData.features.split('\n').filter(f => f.trim() !== ''),
        images: finalImageUrls, // Use the URLs from your server
      };

      // 3. Use appService to create or update
      if (product) {
        await updateAdminProduct(product._id, productData);
      } else {
        await createAdminProduct(productData);
      }
      
      Swal.fire('Success!', `Product ${product ? 'updated' : 'created'} successfully.`, 'success');
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error('Failed to save product:', err);
      const errorMessage = err.message || 'Failed to save product. Check server logs.';
      setError(errorMessage);
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setUploading(false);
    }
  };
  // --- End Reworked HandleSubmit ---

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update product information' : 'Fill in the details to add a new product'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              disabled={uploading}
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label htmlFor="features">Features</Label>
            <Textarea
              id="features"
              placeholder="Enter one feature per line..."
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows={4}
              disabled={uploading}
            />
          </div>

          {/* Price & Original Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                disabled={uploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price (Optional)</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                placeholder="e.g., 299"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                disabled={uploading}
              />
            </div>
          </div>

          {/* Stock & Tag */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                required
                disabled={uploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">Tag / Category</Label>
              <Input
                id="tag"
                placeholder="e.g., Premium, On Sale"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                disabled={uploading}
              />
            </div>
          </div>

          {/* Image Field */}
          <div className="space-y-2">
            <Label htmlFor="image">Product Images</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                multiple // Allow multiple files
                onChange={handleImageChange}
                disabled={uploading}
                className="flex-1"
              />
              {imageFiles && (
                <span className="text-sm text-green-600 flex items-center">
                  <Upload className="w-4 h-4 mr-1" />
                  {imageFiles.length} file(s) selected
                </span>
              )}
            </div>
            {product?.images && product.images.length > 0 && !imageFiles && (
              <p className="text-sm text-slate-600">
                Current images will be kept. Upload new files to replace them.
              </p>
            )}
          </div>

          {/* Active Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={uploading}
            />
            <Label htmlFor="is_active">Active (visible to customers)</Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                product ? 'Update Product' : 'Add Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}