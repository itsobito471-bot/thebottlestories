'use client';

import { useEffect, useState } from 'react';
import { getAdminEnquiries, markEnquiryAsRead } from '@/lib/appService';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mail, Phone, Calendar, CheckCircle2, 
  MessageSquare, User, Clock, ChevronLeft, ChevronRight,
  Loader2, Trash2, Reply
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// --- Types ---
interface Enquiry {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// --- Skeleton Loader ---
const EnquirySkeleton = () => (
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
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    </main>
  </div>
);

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  // --- Load Data ---
  const loadData = async (pageNum: number) => {
    setLoading(true);
    try {
      const res: any = await getAdminEnquiries(pageNum, 10);
      setEnquiries(res.enquiries);
      setStats(res.stats);
      setTotalPages(res.pagination.totalPages);
      setPage(res.pagination.currentPage);
    } catch (error) {
      console.error("Failed to load enquiries", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  // --- Handlers ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadData(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMarkingId(id);
    try {
      await markEnquiryAsRead(id);
      // Optimistic Update
      setEnquiries(prev => prev.map(enq => 
        enq._id === id ? { ...enq, isRead: true } : enq
      ));
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (error) {
      console.error("Failed to mark as read");
    } finally {
      setMarkingId(null);
    }
  };

  if (loading && page === 1 && enquiries.length === 0) return <EnquirySkeleton />;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminNav />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header & Stats */}
        <div className="mb-8 space-y-6">
          <div className="flex justify-between items-end">
             <div>
               <h1 className="text-2xl font-bold text-slate-900">Customer Enquiries</h1>
               <p className="text-slate-500">Manage incoming messages from the contact form.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-white border-none shadow-sm p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Messages</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </Card>

            <Card className="bg-white border-none shadow-sm p-4 flex items-center gap-4">
              <div className={`p-3 rounded-full ${stats.unread > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {stats.unread > 0 ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Unread</p>
                <p className="text-2xl font-bold text-slate-900">{stats.unread}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {enquiries.map((enquiry) => (
              <motion.div
                key={enquiry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                layout
              >
                <Card className={`border-none shadow-sm transition-all hover:shadow-md ${!enquiry.isRead ? 'bg-white ring-1 ring-blue-100' : 'bg-slate-50/50'}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      
                      {/* Left: User Info */}
                      <div className="md:w-64 flex-shrink-0 space-y-3">
                        <div className="flex items-start justify-between md:block">
                          <div className="flex items-center gap-2 mb-1">
                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-500" />
                             </div>
                             <span className={`font-semibold ${!enquiry.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                               {enquiry.firstName} {enquiry.lastName}
                             </span>
                          </div>
                          {!enquiry.isRead && (
                            <Badge className="bg-blue-600 hover:bg-blue-700 md:hidden">New</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-slate-500 space-y-1">
                           <a href={`mailto:${enquiry.email}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                              <Mail className="w-3.5 h-3.5" /> {enquiry.email}
                           </a>
                           {enquiry.phone && (
                             <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> {enquiry.phone}
                             </div>
                           )}
                           <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(enquiry.createdAt), 'MMM dd, yyyy • h:mm a')}
                           </div>
                        </div>
                      </div>

                      {/* Right: Message & Actions */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="mb-4">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</h3>
                              {!enquiry.isRead && (
                                <Badge className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700">New</Badge>
                              )}
                           </div>
                           <p className={`text-sm leading-relaxed whitespace-pre-wrap ${!enquiry.isRead ? 'text-slate-800' : 'text-slate-500'}`}>
                             {enquiry.message}
                           </p>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100/50">
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="gap-2 text-xs h-8"
                             asChild
                           >
                             <a href={`mailto:${enquiry.email}?subject=Re: Enquiry from The Bottle Stories`}>
                               <Reply className="w-3 h-3" /> Reply
                             </a>
                           </Button>

                           {!enquiry.isRead ? (
                             <Button 
                               size="sm" 
                               onClick={(e) => handleMarkAsRead(enquiry._id, e)}
                               disabled={!!markingId}
                               className="gap-2 text-xs h-8 bg-slate-900 hover:bg-slate-800"
                             >
                               {markingId === enquiry._id ? (
                                 <Loader2 className="w-3 h-3 animate-spin" />
                               ) : (
                                 <CheckCircle2 className="w-3 h-3" />
                               )}
                               Mark Read
                             </Button>
                           ) : (
                             <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium ml-auto md:ml-0">
                               <CheckCircle2 className="w-3 h-3" /> Read
                             </div>
                           )}
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {enquiries.length === 0 && !loading && (
             <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-slate-900 font-medium">No enquiries yet</h3>
                <p className="text-slate-500 text-sm">Customer messages will appear here.</p>
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
    </div>
  );
}