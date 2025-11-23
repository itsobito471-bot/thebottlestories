'use client';

import { useEffect, useState } from 'react';
import { getFragrances, createFragrance, deleteFragrance, updateFragranceStock } from '@/lib/appService';
import { Fragrance } from '@/lib/types';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  FlaskConical, 
  Loader2, 
  Wind, 
  Flower2, 
  Mountain 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

export default function AdminFragrances() {
  const [fragrances, setFragrances] = useState<Fragrance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [form, setForm] = useState({ 
    name: '', 
    topNotes: '', 
    middleNotes: '', 
    baseNotes: '', 
    in_stock: true 
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchFragrances();
  }, []);

  const fetchFragrances = async () => {
    try {
      const res = await getFragrances(1, 100); 
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
      await createFragrance(form as any); 
      setForm({ name: '', topNotes: '', middleNotes: '', baseNotes: '', in_stock: true });
      setShowModal(false);
      fetchFragrances();
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Fragrance profile created.',
        timer: 1500,
        showConfirmButton: false
      });
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
        confirmButtonColor: '#1f2937',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: 'Yes, delete it'
      });

      if (result.isConfirmed) {
        await deleteFragrance(id);
        fetchFragrances();
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const toggleStock = async (fragrance: Fragrance) => {
    try {
      const updatedStatus = !fragrance.in_stock;
      // Optimistic UI update
      setFragrances(prev => prev.map(f => f._id === fragrance._id ? { ...f, in_stock: updatedStatus } : f));
      await updateFragranceStock(fragrance._id, updatedStatus);
    } catch (error) {
      console.error("Failed to update stock", error);
      fetchFragrances(); // Revert on error
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Fragrance Library</h2>
            <p className="text-slate-500 mt-2 text-sm">Manage scent profiles, notes, and availability.</p>
          </div>
          <Button 
            onClick={() => setShowModal(true)} 
            className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all rounded-full px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Scent
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-sm text-slate-400">Loading scents...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {fragrances.map((frag) => (
              <motion.div
                key={frag._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden h-full flex flex-col group">
                  
                  {/* Card Header */}
                  <div className="p-6 pb-4 flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${frag.in_stock ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <FlaskConical className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                          {frag.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          frag.in_stock 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${frag.in_stock ? 'bg-green-500' : 'bg-slate-400'}`} />
                          {frag.in_stock ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 -mr-2 -mt-2 transition-colors"
                      onClick={() => handleDelete(frag._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Olfactory Pyramid (Notes) */}
                  <CardContent className="px-6 py-2 flex-1 space-y-3">
                    
                    {/* Top Notes - Light & Airy */}
                    <div className="bg-sky-50/50 rounded-xl p-3 border border-sky-100/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Wind className="w-3.5 h-3.5 text-sky-500" />
                        <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">Top Notes</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {frag.notes?.top?.length > 0 ? (
                          frag.notes.top.map((note, i) => (
                            <span key={i} className="px-2 py-1 bg-white rounded-md text-xs text-sky-900 border border-sky-100 shadow-sm">
                              {note}
                            </span>
                          ))
                        ) : <span className="text-xs text-sky-300 italic pl-1">No top notes defined</span>}
                      </div>
                    </div>

                    {/* Middle Notes - Floral & Heart */}
                    <div className="bg-pink-50/50 rounded-xl p-3 border border-pink-100/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Flower2 className="w-3.5 h-3.5 text-pink-500" />
                        <span className="text-xs font-bold text-pink-700 uppercase tracking-wide">Heart Notes</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {frag.notes?.middle?.length > 0 ? (
                          frag.notes.middle.map((note, i) => (
                            <span key={i} className="px-2 py-1 bg-white rounded-md text-xs text-pink-900 border border-pink-100 shadow-sm">
                              {note}
                            </span>
                          ))
                        ) : <span className="text-xs text-pink-300 italic pl-1">No heart notes defined</span>}
                      </div>
                    </div>

                    {/* Base Notes - Deep & Lasting */}
                    <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Mountain className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Base Notes</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {frag.notes?.base?.length > 0 ? (
                          frag.notes.base.map((note, i) => (
                            <span key={i} className="px-2 py-1 bg-white rounded-md text-xs text-amber-900 border border-amber-100 shadow-sm">
                              {note}
                            </span>
                          ))
                        ) : <span className="text-xs text-amber-300 italic pl-1">No base notes defined</span>}
                      </div>
                    </div>

                  </CardContent>

                  {/* Footer Actions */}
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <Label htmlFor={`stock-${frag._id}`} className="text-xs font-semibold text-slate-500 cursor-pointer uppercase tracking-wide">
                      Active Status
                    </Label>
                    <Switch 
                      id={`stock-${frag._id}`}
                      checked={frag.in_stock}
                      onCheckedChange={() => toggleStock(frag)}
                      className="data-[state=checked]:bg-slate-900"
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
            
            {/* Empty State Card (Create New) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <button 
                onClick={() => setShowModal(true)}
                className="w-full h-full min-h-[300px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer p-8"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-white group-hover:shadow-md flex items-center justify-center transition-all">
                  <Plus className="w-8 h-8 text-slate-400 group-hover:text-slate-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-700 group-hover:text-slate-900">Create New Profile</h3>
                  <p className="text-sm text-slate-400 mt-1">Add another scent to the collection</p>
                </div>
              </button>
            </motion.div>
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl">
          <div className="bg-slate-900 p-6 text-white">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              New Fragrance Profile
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-1">
              Define the olfactory structure for this new scent.
            </DialogDescription>
          </div>
          
          <form onSubmit={handleCreate} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-slate-700">Fragrance Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Midnight Jasmine" 
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                required 
                className="h-11"
              />
            </div>
            
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="top" className="text-xs uppercase text-sky-600 font-bold flex items-center gap-1.5">
                  <Wind className="w-3 h-3" /> Top Notes
                </Label>
                <Input 
                  id="top" 
                  placeholder="e.g. Citrus, Bergamot, Green Apple" 
                  value={form.topNotes}
                  onChange={(e) => setForm({...form, topNotes: e.target.value})}
                  className="bg-white border-slate-200"
                />
                <p className="text-[10px] text-slate-400">Comma separated (15-30 mins duration)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="middle" className="text-xs uppercase text-pink-600 font-bold flex items-center gap-1.5">
                  <Flower2 className="w-3 h-3" /> Heart Notes
                </Label>
                <Input 
                  id="middle" 
                  placeholder="e.g. Rose, Lavender, Spices" 
                  value={form.middleNotes}
                  onChange={(e) => setForm({...form, middleNotes: e.target.value})}
                  className="bg-white border-slate-200"
                />
                <p className="text-[10px] text-slate-400">Comma separated (30-60 mins duration)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base" className="text-xs uppercase text-amber-600 font-bold flex items-center gap-1.5">
                  <Mountain className="w-3 h-3" /> Base Notes
                </Label>
                <Input 
                  id="base" 
                  placeholder="e.g. Vanilla, Musk, Sandalwood" 
                  value={form.baseNotes}
                  onChange={(e) => setForm({...form, baseNotes: e.target.value})}
                  className="bg-white border-slate-200"
                />
                <p className="text-[10px] text-slate-400">Comma separated (6+ hours duration)</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor="new-stock" className="text-sm font-bold text-slate-700">Available in Stock</Label>
                <p className="text-xs text-slate-500">Can this be added to hampers immediately?</p>
              </div>
              <Switch 
                id="new-stock"
                checked={form.in_stock}
                onCheckedChange={(checked) => setForm({...form, in_stock: checked})}
                className="data-[state=checked]:bg-slate-900"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="h-11 px-6">Cancel</Button>
              <Button type="submit" disabled={creating} className="h-11 px-6 bg-slate-900 hover:bg-slate-800">
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {creating ? 'Creating...' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}