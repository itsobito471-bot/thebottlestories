// components/admin/ProductForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { Product, Tag, Fragrance } from '@/lib/types';
import { 
  createAdminProduct, 
  updateAdminProduct, 
  uploadAdminImages,
  getTags,       
  getFragrances  
} from '@/lib/appService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, X as XIcon, Check, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';

interface ProductFormProps {
  product?: Product;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, open, onClose, onSuccess }: ProductFormProps) {
  // --- Form State ---
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    features: '', 
    stock_quantity: 0,
    is_active: true,
    allow_custom_message: false,
  });

  // --- Selection State ---
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedFragrances, setSelectedFragrances] = useState<string[]>([]);
  
  // --- Data Source State (Paginated) ---
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [availableFragrances, setAvailableFragrances] = useState<Fragrance[]>([]);
  
  // Pagination State
  const [tagsPage, setTagsPage] = useState(1);
  const [tagsHasMore, setTagsHasMore] = useState(false);
  const [fragrancesPage, setFragrancesPage] = useState(1);
  const [fragrancesHasMore, setFragrancesHasMore] = useState(false);

  // --- Image State ---
  // existing images from DB
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  // new files waiting to be uploaded
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); 

  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMoreTags, setLoadingMoreTags] = useState(false);
  const [loadingMoreFragrances, setLoadingMoreFragrances] = useState(false);
  const [error, setError] = useState('');

  // --- 1. Initial Data Load ---
  useEffect(() => {
    if (open) {
      setTagsPage(1);
      setFragrancesPage(1);
      loadInitialData();
    }
  }, [open]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [tagsRes, fragrancesRes] = await Promise.all([
        getTags(1, 10),
        getFragrances(1, 10)
      ]);

      setAvailableTags(tagsRes.data || []);
      setTagsHasMore(tagsRes.hasMore);

      setAvailableFragrances(fragrancesRes.data || []);
      setFragrancesHasMore(fragrancesRes.hasMore);

    } catch (err) {
      console.error("Failed to load tags/fragrances", err);
    } finally {
      setLoadingData(false);
    }
  };

  // --- Load More Handlers ---
  const handleLoadMoreTags = async () => {
    if (loadingMoreTags || !tagsHasMore) return;
    setLoadingMoreTags(true);
    try {
      const nextPage = tagsPage + 1;
      const res = await getTags(nextPage, 10);
      setAvailableTags(prev => [...prev, ...res.data]);
      setTagsPage(nextPage);
      setTagsHasMore(res.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMoreTags(false);
    }
  };

  const handleLoadMoreFragrances = async () => {
    if (loadingMoreFragrances || !fragrancesHasMore) return;
    setLoadingMoreFragrances(true);
    try {
      const nextPage = fragrancesPage + 1;
      const res = await getFragrances(nextPage, 10);
      setAvailableFragrances(prev => [...prev, ...res.data]);
      setFragrancesPage(nextPage);
      setFragrancesHasMore(res.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMoreFragrances(false);
    }
  };

  // --- 2. Populate Form ---
  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || 0,
          originalPrice: product.originalPrice || 0,
          features: product.features?.join('\n') || '',
          stock_quantity: product.stock_quantity || 0,
          is_active: product.is_active ?? true,
          allow_custom_message: product.allow_custom_message ?? false,
        });
        setCurrentImageUrls(product.images || []);
        if (product.tags && product.tags.length > 0) {
          setSelectedTag(product.tags[0]); 
        } else {
          setSelectedTag("");
        }
        setSelectedFragrances(product.available_fragrances || []);
      } else {
        setFormData({
          name: '',
          description: '',
          price: 0,
          originalPrice: 0,
          features: '',
          stock_quantity: 0,
          is_active: true,
          allow_custom_message: false,
        });
        setCurrentImageUrls([]);
        setSelectedTag("");
        setSelectedFragrances([]);
      }
      setPendingFiles([]); // Clear pending files on open
      setError('');
    }
  }, [product, open]);

  // --- Image Helpers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Append new files to the existing pending list
      setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      // Reset input value so the same file can be selected again if needed
      e.target.value = ""; 
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeCurrentImage = (urlToRemove: string) => {
    setCurrentImageUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSelectTag = (tagId: string) => {
    if (selectedTag === tagId) {
      setSelectedTag("");
    } else {
      setSelectedTag(tagId);
    }
  };

  const toggleFragrance = (fragranceId: string) => {
    setSelectedFragrances(prev => 
      prev.includes(fragranceId) ? prev.filter(id => id !== fragranceId) : [...prev, fragranceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      let finalImageUrls: string[] = [...currentImageUrls];

      // 1. Upload Pending Files
      if (pendingFiles.length > 0) {
        const uploadFormData = new FormData();
        pendingFiles.forEach(file => {
          uploadFormData.append('images', file);
        });
        
        const uploadResponse = await uploadAdminImages(uploadFormData);
        
        // Add the new URLs to our list
        finalImageUrls.push(...uploadResponse.urls);
      }

      // 2. Prepare Product Data
      const productData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || undefined,
        stock_quantity: Number(formData.stock_quantity),
        features: formData.features.split('\n').filter(f => f.trim() !== ''),
        images: finalImageUrls,
        tags: selectedTag ? [selectedTag] : [],
        available_fragrances: selectedFragrances,
      };

      // 3. Save
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
      setError(err.message || 'Failed to save product.');
      Swal.fire('Error', err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update product information' : 'Fill in the details to add a new product'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ... (Inputs: Name, Desc, Price, Stock, Features - Unchanged) ... */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={uploading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} disabled={uploading} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} required disabled={uploading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input id="originalPrice" type="number" step="0.01" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })} disabled={uploading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Qty</Label>
              <Input id="stock_quantity" type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })} required disabled={uploading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea id="features" value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} rows={4} disabled={uploading} />
          </div>

          {/* --- Tags with Pagination --- */}
          <div className="space-y-3 border p-4 rounded-lg bg-slate-50">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Product Tag</Label>
              <span className="text-xs text-slate-500">Select one</span>
            </div>
            {loadingData ? (
              <p className="text-sm text-slate-500">Loading tags...</p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTag === tag._id;
                    return (
                      <Badge
                        key={tag._id}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1 text-sm transition-colors ${
                          isSelected ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100'
                        }`}
                        onClick={() => handleSelectTag(tag._id)}
                      >
                        {tag.name}
                        {isSelected && <Check className="w-3 h-3 ml-1" />}
                      </Badge>
                    );
                  })}
                </div>
                {tagsHasMore && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleLoadMoreTags} disabled={loadingMoreTags} className="self-start mt-2 text-xs text-blue-600">
                    {loadingMoreTags ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                    Load More Tags
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* --- Fragrances with Pagination --- */}
          <div className="space-y-3 border p-4 rounded-lg bg-slate-50">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Available Fragrances</Label>
              <span className="text-xs text-slate-500">Select all that apply</span>
            </div>
            {loadingData ? (
              <p className="text-sm text-slate-500">Loading fragrances...</p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                  {availableFragrances.map((frag) => {
                    const isSelected = selectedFragrances.includes(frag._id);
                    return (
                      <div key={frag._id} className={`flex items-center justify-between p-2 rounded border transition-all ${isSelected ? 'border-slate-800 bg-white shadow-sm' : 'border-slate-200 bg-transparent'}`}>
                        <div className="flex items-center gap-2">
                          <Checkbox id={`frag-${frag._id}`} checked={isSelected} onCheckedChange={() => toggleFragrance(frag._id)} />
                          <Label htmlFor={`frag-${frag._id}`} className="cursor-pointer font-normal text-sm">{frag.name}</Label>
                        </div>
                        <div className="flex items-center gap-1" title={frag.in_stock ? "In Stock" : "Out of Stock"}>
                          <span className={`w-2 h-2 rounded-full ${frag.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {fragrancesHasMore && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleLoadMoreFragrances} disabled={loadingMoreFragrances} className="self-start mt-2 text-xs text-blue-600">
                    {loadingMoreFragrances ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                    Load More Fragrances
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* --- Toggles --- */}
          <div className="flex flex-col gap-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active (Visible to customers)</Label>
              <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} disabled={uploading} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="custom_msg">Allow Custom Message</Label>
                <p className="text-xs text-slate-500">User can write a note for the hamper</p>
              </div>
              <Switch id="custom_msg" checked={formData.allow_custom_message} onCheckedChange={(checked) => setFormData({ ...formData, allow_custom_message: checked })} disabled={uploading} />
            </div>
          </div>

          {/* --- Image Upload Section (Updated) --- */}
          <div className="space-y-2">
            <Label>Images</Label>
            
            {/* File Input */}
            <div className="flex items-center gap-4">
              <Input 
                id="image" 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileSelect} 
                disabled={uploading} 
                className="flex-1" 
              />
              <span className="text-sm text-slate-500">
                {pendingFiles.length} file(s) selected
              </span>
            </div>

            {/* Preview Grid */}
            {(currentImageUrls.length > 0 || pendingFiles.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                
                {/* 1. Existing Images from DB */}
                {currentImageUrls.map((url) => (
                  <div key={url} className="relative group">
                    <img src={url} alt="Product" className="w-full h-24 object-cover rounded-md border border-slate-200" />
                    {/* Overlay for Delete */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeCurrentImage(url)} disabled={uploading}>
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">Saved</div>
                  </div>
                ))}

                {/* 2. New Pending Images */}
                {pendingFiles.map((file, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img src={URL.createObjectURL(file)} alt="New Upload" className="w-full h-24 object-cover rounded-md border border-green-200 ring-2 ring-green-500/20" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                      <Button type="button" variant="destructive" size="sm" onClick={() => removePendingFile(index)} disabled={uploading}>
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute top-1 left-1 bg-green-600 text-white text-[10px] px-1 rounded">New</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="flex justify-end gap-3 pt-4 border-t">
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
                product ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}