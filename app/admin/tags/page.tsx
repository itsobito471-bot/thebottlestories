'use client';

import { useEffect, useState } from 'react';
import { getTags, createTag, deleteTag } from '@/lib/appService';
import { Tag } from '@/lib/types';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  Tag as TagIcon, 
  Loader2, 
  Search, 
  Hash, 
  LayoutGrid 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      // Fetching with a large limit to see all tags for client-side filtering
      const res = await getTags(1, 200);
      setTags(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    
    setCreating(true);
    try {
      await createTag({ name: newTagName });
      setNewTagName('');
      setShowModal(false);
      fetchTags();
      Swal.fire({
        icon: 'success',
        title: 'Tag Created',
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
        title: 'Delete Tag?',
        text: "This tag will be removed from all products.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1f2937',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: 'Yes, delete it'
      });

      if (result.isConfirmed) {
        await deleteTag(id);
        fetchTags();
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

  // Client-side filtering
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Tags & Categories</h2>
            <p className="text-slate-500 mt-2 text-sm">Organize your products with custom labels.</p>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all rounded-full px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Tag
          </Button>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 px-2">
            <LayoutGrid className="w-4 h-4" />
            <span>{filteredTags.length} {filteredTags.length === 1 ? 'Tag' : 'Tags'} found</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-sm text-slate-400">Loading tags...</p>
            </div>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {filteredTags.map((tag) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={tag._id}
                >
                  <Card className="group relative overflow-hidden border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-300 bg-white">
                    <div className="p-4 flex flex-col items-center text-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <Hash className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <span className="font-semibold text-slate-700 group-hover:text-slate-900 truncate w-full px-2">
                        {tag.name}
                      </span>
                    </div>
                    
                    {/* Hover Action - Delete */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(tag._id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredTags.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TagIcon className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No tags found</h3>
                <p className="text-slate-500 text-sm mt-1">
                  {searchQuery ? `No results for "${searchQuery}"` : "Get started by adding a new tag."}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Tag</DialogTitle>
            <DialogDescription>
              Add a label to categorize your products.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-6 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Tag Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Best Seller" 
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                required 
                className="h-11"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="h-11 px-6">Cancel</Button>
              <Button type="submit" disabled={creating} className="h-11 px-6 bg-slate-900 hover:bg-slate-800">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Tag'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}