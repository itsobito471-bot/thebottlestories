'use client';

import { useEffect, useState } from 'react';
import { getTags, createTag, deleteTag } from '@/lib/appService';
import { Tag } from '@/lib/types';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Tag as TagIcon, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Swal from 'sweetalert2';

export default function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      // Fetching with a large limit to see all tags
      const res = await getTags(1, 100);
      setTags(res.data || []);
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
      await createTag({ name: newTagName });
      setNewTagName('');
      setShowModal(false);
      fetchTags();
      Swal.fire('Success', 'Tag created successfully', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This will remove the tag from all products.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await deleteTag(id);
        fetchTags();
        Swal.fire('Deleted!', 'Tag has been deleted.', 'success');
      }
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Tags</h2>
            <p className="text-slate-600 mt-2">Manage product categories and filters</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tag
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TagIcon className="w-5 h-5" />
                Available Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <div 
                    key={tag._id} 
                    className="flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-4 pr-2 py-2 shadow-sm group hover:border-slate-400 transition-colors"
                  >
                    <span className="font-medium text-slate-700">{tag.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(tag._id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {tags.length === 0 && <p className="text-slate-500">No tags created yet.</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tag Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Best Seller, Summer Collection" 
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                required 
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Tag'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}