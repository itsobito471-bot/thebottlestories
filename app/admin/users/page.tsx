'use client';

import { useEffect, useState } from 'react';
import { getAdminUsers, User } from '@/lib/appService';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, ChevronDown, Loader2, User as UserIcon, 
  MapPin, Phone, Mail, Cake, Briefcase, Crown, Home, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- Helpers ---
const formatDate = (dateString?: string, formatStr = 'PP') => {
  if (!dateString) return 'N/A';
  try { return format(new Date(dateString), formatStr); } 
  catch (e) { return 'Invalid Date'; }
};

const getRoleBadge = (role: string) => {
  const styles: Record<string, string> = {
    admin: "bg-purple-50 text-purple-700 border-purple-200",
    worker: "bg-blue-50 text-blue-700 border-blue-200",
    customer: "bg-slate-50 text-slate-700 border-slate-200",
  };
  const Icon = role === 'admin' ? Crown : role === 'worker' ? Briefcase : UserIcon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role] || styles.customer}`}>
      <Icon className="w-3 h-3" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [birthdayMode, setBirthdayMode] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    loadUsers(1, true);
  }, [debouncedSearch, birthdayMode]);

  const loadUsers = async (pageNum: number, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      // API Call
      const data = await getAdminUsers(pageNum, 10, debouncedSearch, birthdayMode);

      if (reset) setUsers(data.users);
      else setUsers(prev => [...prev, ...data.users]);

      if (data.pagination) {
        setStats({ total: data.pagination.total });
        setHasMore(data.pagination.hasMore);
      } else {
        setHasMore(false);
      }
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) loadUsers(page + 1, false);
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 space-y-8">
        <AdminNav />
        <div className="max-w-7xl mx-auto space-y-4">
           <Skeleton className="h-12 w-64" />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              User Management
              {birthdayMode && (
                <span className="text-xs font-semibold bg-pink-100 text-pink-700 px-2 py-1 rounded-full animate-pulse border border-pink-200">
                  🎉 Birthday Mode
                </span>
              )}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Total Users: <span className="font-semibold text-slate-700">{stats.total}</span>
            </p>
          </div>
          
          <Button
            onClick={() => setBirthdayMode(!birthdayMode)}
            className={`transition-all duration-300 ${
              birthdayMode 
              ? "bg-pink-600 hover:bg-pink-700 text-white shadow-pink-200 ring-2 ring-pink-100" 
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {birthdayMode ? (
              <><UserIcon className="w-4 h-4 mr-2" /> Show All Users</>
            ) : (
              <><Cake className="w-4 h-4 mr-2 text-pink-500" /> Upcoming Birthdays</>
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by Name or Email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-slate-200 focus:ring-slate-900 max-w-md shadow-sm"
          />
        </div>

        {/* Users Grid */}
        <div className="space-y-4">
          <AnimatePresence mode='popLayout'>
            {users.length > 0 ? users.map((user) => (
              <motion.div
                key={user._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <Card 
                  className={`group border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white overflow-hidden
                    ${birthdayMode ? "ring-1 ring-pink-200 bg-gradient-to-r from-pink-50/30 to-white" : ""}
                  `}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex flex-col sm:flex-row items-center p-4 gap-4 sm:gap-6">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                        ) : <UserIcon className="w-6 h-6 text-slate-400" />}
                      </div>
                      {birthdayMode && (
                        <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-sm text-pink-500 ring-1 ring-pink-100">
                          <Cake className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 text-center sm:text-left space-y-1 w-full min-w-0">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 truncate">{user.name}</h3>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="text-sm text-slate-500 flex flex-col sm:flex-row gap-x-4 gap-y-1 items-center sm:items-start">
                        <span className="flex items-center gap-1 truncate max-w-full">
                          <Mail className="w-3.5 h-3.5 shrink-0" /> {user.email}
                        </span>
                        {/* Show count of addresses found */}
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> {user.addressDetails?.length || 0} Saved
                        </span>
                      </div>
                    </div>

                    {/* Right Side Info */}
                    <div className="shrink-0 text-center sm:text-right border-t sm:border-0 border-slate-100 pt-3 sm:pt-0 w-full sm:w-auto">
                      {birthdayMode ? (
                        <div className="bg-white/60 rounded-lg p-2 border border-pink-100 inline-block sm:block">
                           <p className="text-[10px] font-bold text-pink-500 uppercase tracking-wide">Birthday</p>
                           <p className="text-lg font-bold text-slate-800 leading-none mt-1">
                             {user.dob ? format(new Date(user.dob), 'MMM do') : 'N/A'}
                           </p>
                           <p className="text-[10px] text-pink-600 font-medium mt-1">
                             {user.daysUntilBirthday === 0 ? "Today!" : `In ${Math.floor(user.daysUntilBirthday || 0)} days`}
                           </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Joined</p>
                          <p className="text-sm font-medium text-slate-900">{formatDate(user.createdAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500">No users found matching your criteria.</p>
              </div>
            )}
          </AnimatePresence>

          {hasMore && (
            <div className="flex justify-center py-6">
              <Button variant="ghost" onClick={handleLoadMore} disabled={loadingMore} className="rounded-full px-6">
                {loadingMore ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <ChevronDown className="w-4 h-4 mr-2"/>} Load More
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* --- User Details Modal --- */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>User ID: <span className="font-mono text-xs">{selectedUser?._id}</span></DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 pt-4">
              
              {/* Profile Header */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                    {selectedUser.profilePicture ? (
                      <img src={selectedUser.profilePicture} className="w-full h-full object-cover" />
                    ) : <UserIcon className="w-8 h-8 text-slate-300" />}
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-900">{selectedUser.name}</h3>
                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                 </div>
                 <div className="ml-auto">
                   {getRoleBadge(selectedUser.role)}
                 </div>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 border rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Phone</p>
                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                 </div>
                 <div className="p-3 border rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Date of Birth</p>
                    <p className="font-medium flex items-center gap-2">
                       {selectedUser.dob ? formatDate(selectedUser.dob) : 'Not provided'}
                       {selectedUser.dob && <Cake className="w-3.5 h-3.5 text-pink-400" />}
                    </p>
                 </div>
              </div>

              {/* --- NEW: Address List Display --- */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> 
                  Saved Addresses ({selectedUser.addressDetails?.length || 0})
                </h4>
                
                <div className="grid gap-3">
                  {selectedUser.addressDetails && selectedUser.addressDetails.length > 0 ? (
                    selectedUser.addressDetails.map((addr, i) => (
                      <div key={addr._id} className="bg-white p-3 rounded-lg border border-slate-200 text-sm hover:border-slate-300 transition-colors relative overflow-hidden">
                        
                        {/* Header: Label + Default Badge */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded uppercase text-[10px] tracking-wide">
                              {addr.label || "Address"}
                            </span>
                            {addr.isDefault && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                <CheckCircle2 className="w-3 h-3" /> Default
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Address Details */}
                        <div className="text-slate-600 space-y-0.5">
                          <p className="text-slate-900 font-medium">{addr.street}</p>
                          <p>{addr.city}, {addr.state} {addr.zip}</p>
                          <p className="text-slate-400 text-xs">{addr.country}</p>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed">
                       <Home className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                       <p className="text-slate-500 text-sm">No addresses found for this user.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}