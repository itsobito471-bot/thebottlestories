'use client';

import { useEffect, useState } from 'react';
import { getAdminTestimonials, approveTestimonial, deleteTestimonial } from '@/lib/appService';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Star, Quote, Calendar, CheckCircle2, 
  MessageSquare, User, Clock, ChevronLeft, ChevronRight,
  Loader2, Trash2, ShieldCheck, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- Types ---
interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  isApproved: boolean;
  image: string;
  createdAt: string;
}

// --- Skeleton Loader ---
const TestimonialSkeleton = () => (
  <div className="min-h-screen bg-slate-50/50">
    <AdminNav />
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
      </div>
    </main>
  </div>
);

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0 });
  
  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved'
  
  // Action States
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  // --- Load Data ---
  const loadData = async (pageNum: number) => {
    setLoading(true);
    try {
      const res: any = await getAdminTestimonials(pageNum, 10, statusFilter);
      setTestimonials(res.testimonials);
      setStats(res.stats);
      setTotalPages(res.pagination.totalPages);
      setPage(res.pagination.currentPage);
    } catch (error) {
      console.error("Failed to load testimonials", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [statusFilter]);

  // --- Handlers ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadData(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveTestimonial(id);
      // Optimistic Update
      setTestimonials(prev => prev.map(t => 
        t._id === id ? { ...t, isApproved: true } : t
      ));
      setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
    } catch (error) {
      console.error("Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteTestimonial(deleteConfirm.id);
      setTestimonials(prev => prev.filter(t => t._id !== deleteConfirm.id));
      setStats(prev => ({ ...prev, total: prev.total - 1 })); // Approximate stat update
      setDeleteConfirm({ open: false, id: null });
    } catch (error) {
      console.error("Failed to delete");
    }
  };

  if (loading && page === 1 && testimonials.length === 0) return <TestimonialSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminNav />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header & Stats */}
        <div className="mb-8 space-y-6">
          <div className="flex justify-between items-end">
             <div>
               <h1 className="text-2xl font-bold text-slate-900">Testimonials</h1>
               <p className="text-slate-500">Manage customer reviews and approvals.</p>
             </div>
             
             {/* Filter Tabs */}
             <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                {['all', 'pending', 'approved'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                      statusFilter === status 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-white border-none shadow-sm p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <Quote className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Reviews</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </Card>

            <Card className="bg-white border-none shadow-sm p-4 flex items-center gap-4">
              <div className={`p-3 rounded-full ${stats.pending > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {stats.pending > 0 ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Approval</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card className={`border-none shadow-sm transition-all hover:shadow-md ${!testimonial.isApproved ? 'bg-white ring-1 ring-amber-100' : 'bg-slate-50/50'}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      
                      {/* Left: User Info & Image */}
                      <div className="md:w-56 flex-shrink-0 space-y-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                        <div className="flex items-center gap-3">
                           {testimonial.image ? (
                             <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                           ) : (
                             <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                               <User className="w-6 h-6 text-slate-500" />
                             </div>
                           )}
                           <div>
                             <p className="font-bold text-slate-900 leading-tight">{testimonial.name}</p>
                             <p className="text-xs text-slate-500">{testimonial.role}</p>
                           </div>
                        </div>
                        
                        <div className="space-y-2">
                           {!testimonial.isApproved ? (
                             <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 w-full justify-center py-1">Pending Approval</Badge>
                           ) : (
                             <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 w-full justify-center py-1">Live on Site</Badge>
                           )}
                           
                           <div className="flex items-center justify-center gap-1 bg-slate-100 py-1.5 rounded-md">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                              ))}
                           </div>
                        </div>

                        <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                           <Calendar className="w-3 h-3" />
                           {format(new Date(testimonial.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>

                      {/* Right: Content & Actions */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="mb-4 relative">
                           <Quote className="w-8 h-8 text-slate-100 absolute -top-2 -left-2 -z-10" />
                           <p className="text-slate-700 leading-relaxed italic relative z-10">
                             "{testimonial.content}"
                           </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100/50">
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="gap-2 text-xs h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                             onClick={() => setDeleteConfirm({ open: true, id: testimonial._id })}
                           >
                             <Trash2 className="w-3.5 h-3.5" /> Delete
                           </Button>

                           {!testimonial.isApproved && (
                             <Button 
                               size="sm" 
                               onClick={() => handleApprove(testimonial._id)}
                               disabled={actionLoading === testimonial._id}
                               className="gap-2 text-xs h-9 bg-slate-900 hover:bg-slate-800"
                             >
                               {actionLoading === testimonial._id ? (
                                 <Loader2 className="w-3.5 h-3.5 animate-spin" />
                               ) : (
                                 <ShieldCheck className="w-3.5 h-3.5" />
                               )}
                               Approve & Publish
                             </Button>
                           )}
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {testimonials.length === 0 && !loading && (
             <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-slate-900 font-medium">No testimonials found</h3>
                <p className="text-slate-500 text-sm">Adjust filters or wait for new submissions.</p>
             </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <span className="text-sm font-medium text-slate-600">
               Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, id: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove this review from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}