'use client';

import { useEffect, useState } from 'react';
import { getFragrances, createFragrance, deleteFragrance, updateFragranceStock } from '@/lib/appService';
import { Fragrance } from '@/lib/types';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Wind, Loader2, FlaskConical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Swal from 'sweetalert2';

export default function AdminFragrances() {
  const [fragrances, setFragrances] = useState<Fragrance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [form, setForm] = useState({ name: '', description: '', in_stock: true });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchFragrances();
  }, []);

  const fetchFragrances = async () => {
    try {
      const res = await getFragrances(1, 100); // Fetch all
      setFragrances(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createFragrance(form);
      setForm({ name: '', description: '', in_stock: true }); // Reset form
      setShowModal(false);
      fetchFragrances();
      Swal.fire('Success', 'Fragrance added successfully', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Fragrance?',
        text: "This cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Delete'
      });

      if (result.isConfirmed) {
        await deleteFragrance(id);
        fetchFragrances();
        Swal.fire('Deleted', '', 'success');
      }
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const toggleStock = async (fragrance: Fragrance) => {
    try {
      // Optimistic update
      const updatedStatus = !fragrance.in_stock;
      setFragrances(prev => prev.map(f => f._id === fragrance._id ? { ...f, in_stock: updatedStatus } : f));
      
      await updateFragranceStock(fragrance._id, updatedStatus);
    } catch (error) {
      console.error("Failed to update stock", error);
      fetchFragrances(); // Revert on error
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Fragrances</h2>
            <p className="text-slate-600 mt-2">Manage scents and their stock availability</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Fragrance
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fragrances.map((frag) => (
              <Card key={frag._id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-full">
                        <FlaskConical className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{frag.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-2 h-2 rounded-full ${frag.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-xs text-slate-500 font-medium">
                            {frag.in_stock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-400 hover:text-red-600"
                      onClick={() => handleDelete(frag._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg mb-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Scent Notes / Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {frag.description || "No notes added."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Label htmlFor={`stock-${frag._id}`} className="text-sm text-slate-600">Available for hampers?</Label>
                    <Switch 
                      id={`stock-${frag._id}`}
                      checked={frag.in_stock}
                      onCheckedChange={() => toggleStock(frag)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {fragrances.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-500">No fragrances found. Add one to get started.</div>
            )}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Fragrance</DialogTitle>
            <DialogDescription>Define the scent profile and availability.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Fragrance Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Vanilla Bean, Ocean Breeze" 
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Scent Notes / Description</Label>
              <Textarea 
                id="notes" 
                placeholder="Describe the scent (e.g. Top notes of citrus, base of musk...)" 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="new-stock">In Stock?</Label>
              <Switch 
                id="new-stock"
                checked={form.in_stock}
                onCheckedChange={(checked) => setForm({...form, in_stock: checked})}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Fragrance'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}