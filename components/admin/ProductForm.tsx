'use client';

import { useState, useEffect } from 'react';
import { Product, Tag, Fragrance, BottleConfig } from '@/lib/types'; // Added BottleConfig
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
// Added Plus and Trash2 icons
import { Loader2, X as XIcon, Check, ChevronDown, AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';

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
    // --- NEW: Bottle Config State ---
    bottleConfig: [] as BottleConfig[],
  });

  // --- Selection State ---
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedFragrance, setSelectedFragrance] = useState<string | null>(null);

  // --- Data Source State ---
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [availableFragrances, setAvailableFragrances] = useState<Fragrance[]>([]);

  // Pagination State
  const [tagsPage, setTagsPage] = useState(1);
  const [tagsHasMore, setTagsHasMore] = useState(false);
  const [fragrancesPage, setFragrancesPage] = useState(1);
  const [fragrancesHasMore, setFragrancesHasMore] = useState(false);

  // --- Image State ---
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // --- UI State ---
  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMoreTags, setLoadingMoreTags] = useState(false);
  const [loadingMoreFragrances, setLoadingMoreFragrances] = useState(false);
  const [error, setError] = useState('');

  // --- Alert Dialog State ---
  const [alertState, setAlertState] = useState<{
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
    } catch (err: any) {
      console.error("Failed to load tags/fragrances", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLoadMoreTags = async () => {
    if (loadingMoreTags || !tagsHasMore) return;
    setLoadingMoreTags(true);
    try {
      const nextPage = tagsPage + 1;
      const res = await getTags(nextPage, 10);
      setAvailableTags(prev => [...prev, ...res.data]);
      setTagsPage(nextPage);
      setTagsHasMore(res.hasMore);
    } catch (err) { console.error(err); } finally { setLoadingMoreTags(false); }
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
    } catch (err) { console.error(err); } finally { setLoadingMoreFragrances(false); }
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
          // --- Populate Config ---
          bottleConfig: product.bottleConfig || [],
        });
        setCurrentImageUrls(product.images || []);

        if (product.tags && product.tags.length > 0) {
          const firstTag: any = product.tags[0];
          const tagId = (typeof firstTag === 'object' && firstTag !== null) ? firstTag._id : firstTag;
          setSelectedTag(tagId);
        } else {
          setSelectedTag("");
        }

        const existingFragrances = product.available_fragrances?.map((frag: any) => {
          return (typeof frag === 'object' && frag !== null) ? frag._id : frag;
        }) || [];
        // Enforce single selection from existing
        setSelectedFragrance(existingFragrances.length > 0 ? existingFragrances[0] : null);

      } else {
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: 0,
          originalPrice: 0,
          features: '',
          stock_quantity: 0,
          is_active: true,
          allow_custom_message: false,
          bottleConfig: [],
        });
        setCurrentImageUrls([]);
        setSelectedTag("");
        setSelectedFragrance(null);
      }
      setPendingFiles([]);
      setError('');
    }
  }, [product, open]);

  // --- Image Helpers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]);
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
    if (selectedTag === tagId) setSelectedTag(""); else setSelectedTag(tagId);
  };
  const selectFragrance = (fragranceId: string) => {
    setSelectedFragrance(prev => prev === fragranceId ? null : fragranceId);
  };

  // --- NEW: Bottle Configuration Handlers ---
  const addBottleSlot = () => {
    setFormData(prev => ({
      ...prev,
      bottleConfig: [...prev.bottleConfig, { quantity: 1, size: '' }]
    }));
  };

  const removeBottleSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bottleConfig: prev.bottleConfig.filter((_, i) => i !== index)
    }));
  };

  const handleBottleChange = (index: number, field: keyof BottleConfig, value: string | number) => {
    setFormData(prev => {
      const newConfig = [...prev.bottleConfig];
      newConfig[index] = { ...newConfig[index], [field]: value };
      return { ...prev, bottleConfig: newConfig };
    });
  };
  // ------------------------------------------

  // --- Alert Helper ---
  const handleAlertClose = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
    if (alertState.type === 'success') {
      onSuccess();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      let finalImageUrls: string[] = [...currentImageUrls];

      // Upload Pending Files
      if (pendingFiles.length > 0) {
        const uploadFormData = new FormData();
        pendingFiles.forEach(file => {
          uploadFormData.append('images', file);
        });
        const uploadResponse = await uploadAdminImages(uploadFormData);
        finalImageUrls.push(...uploadResponse.urls);
      }

      // Prepare Product Data
      const productData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || undefined,
        stock_quantity: Number(formData.stock_quantity),
        features: formData.features.split('\n').filter(f => f.trim() !== ''),
        images: finalImageUrls,
        tags: (selectedTag ? [selectedTag] : []) as unknown as Tag[],
        available_fragrances: selectedFragrance ? [selectedFragrance] : [],
        // bottleConfig is already in formData
      };

      if (product) {
        await updateAdminProduct(product._id, productData);
      } else {
        await createAdminProduct(productData);
      }

      setAlertState({
        isOpen: true,
        title: 'Success!',
        description: `Product ${product ? 'updated' : 'created'} successfully.`,
        type: 'success'
      });

    } catch (err: any) {
      console.error('Failed to save product:', err);
      setError(err.message || 'Failed to save product.');
      setAlertState({
        isOpen: true,
        title: 'Error',
        description: err.message || 'An unexpected error occurred.',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {product ? 'Update product information' : 'Fill in the details to add a new product'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Basic Info */}
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

            {/* 2. Price & Stock */}
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

            {/* --- NEW SECTION: Bottle Configuration --- */}
            <div className="space-y-3 border p-4 rounded-lg bg-slate-50">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-base font-semibold">Bottle Configuration</Label>
                  <p className="text-xs text-slate-500">Define the size and quantity of bottles.</p>
                </div>
                <Button type="button" size="sm" variant="secondary" onClick={addBottleSlot} disabled={uploading}>
                  <Plus className="w-3 h-3 mr-1" /> Add Size
                </Button>
              </div>

              {formData.bottleConfig.length === 0 ? (
                <div className="text-sm text-slate-400 italic text-center py-2 border border-dashed rounded bg-white/50">
                  No bottle sizes configured yet. Click "Add Size" to start.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-10 gap-2 text-xs font-medium text-slate-500 uppercase px-1">
                    <div className="col-span-3">Qty</div>
                    <div className="col-span-6">Size (e.g. 100ml)</div>
                    <div className="col-span-1"></div>
                  </div>
                  {formData.bottleConfig.map((config, index) => (
                    <div key={index} className="grid grid-cols-10 gap-2 items-center">
                      <div className="col-span-3">
                        <Input
                          type="number"
                          min="1"
                          value={config.quantity}
                          onChange={(e) => handleBottleChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="bg-white h-9"
                        />
                      </div>
                      <div className="col-span-6">
                        <Input
                          type="text"
                          placeholder="e.g. 100ml"
                          value={config.size}
                          onChange={(e) => handleBottleChange(index, 'size', e.target.value)}
                          className="bg-white h-9"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => removeBottleSlot(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* ------------------------------------------ */}

            {/* 3. Features */}
            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea id="features" value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} rows={4} disabled={uploading} />
            </div>

            {/* 4. Tags */}
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
                          className={`cursor-pointer px-3 py-1 text-sm transition-colors ${isSelected ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100'
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

            {/* 5. Fragrances - SINGLE SELECT */}
            <div className="space-y-3 border p-4 rounded-lg bg-slate-50">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Fragrance Profile</Label>
                <span className="text-xs text-slate-500">Select one</span>
              </div>
              {loadingData ? (
                <p className="text-sm text-slate-500">Loading fragrances...</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                    {availableFragrances.map((frag) => {
                      const isSelected = selectedFragrance === frag._id;
                      return (
                        <div
                          key={frag._id}
                          className={`flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${isSelected ? 'border-slate-800 bg-white shadow-sm ring-1 ring-slate-800' : 'border-slate-200 bg-transparent hover:bg-slate-100'}`}
                          onClick={() => selectFragrance(frag._id)}
                        >
                          <div className="flex items-center gap-2 pointer-events-none">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-slate-900' : 'border-slate-300'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                            </div>
                            <Label className="cursor-pointer font-normal text-sm">{frag.name}</Label>
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

            {/* 6. Toggles */}
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

            {/* 7. Images */}
            <div className="space-y-2">
              <Label>Images</Label>
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
                  {/* Saved Images */}
                  {currentImageUrls.map((url) => (
                    <div key={url} className="relative group">
                      <img src={url} alt="Product" className="w-full h-24 object-cover rounded-md border border-slate-200" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeCurrentImage(url)} disabled={uploading}>
                          <XIcon className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">Saved</div>
                    </div>
                  ))}
                  {/* New Images */}
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

      {/* Result Alert Dialog */}
      <AlertDialog open={alertState.isOpen} onOpenChange={(open) => {
        if (!open) handleAlertClose();
      }}>
        <AlertDialogContent className="max-w-md text-center">
          <AlertDialogHeader className="flex flex-col items-center gap-2">
            {alertState.type === 'success' ? (
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            )}
            <AlertDialogTitle className={`text-xl ${alertState.type === 'error' ? 'text-red-600' : 'text-slate-900'}`}>
              {alertState.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-600">
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              onClick={handleAlertClose}
              className={`w-full sm:w-auto ${alertState.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900'}`}
            >
              {alertState.type === 'success' ? 'Continue' : 'Close'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}