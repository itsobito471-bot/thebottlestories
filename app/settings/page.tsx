'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getUserProfileData, 
  updateUserProfileData, 
  addUserAddress, 
  deleteUserAddress,
  uploadUserProfilePicture // Import this
} from '@/lib/appService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Plus, Trash2, Calendar, Phone, Save, 
  Loader2, Home, Building, CheckCircle2, AlertCircle, Briefcase, Camera 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UserSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false); // New state for image upload
  
  // --- Alert State ---
  const [alertState, setAlertState] = useState<{
    isOpen: boolean; title: string; message: string; type: 'success' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

  // Forms State
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', dob: '' });
  const [addressForm, setAddressForm] = useState({
    label: 'Home', street: '', city: '', state: '', zip: '', country: 'India', isDefault: false
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const showAlert = (type: 'success' | 'error', title: string, message: string) => {
    setAlertState({ isOpen: true, type, title, message });
  };

  const closeAlert = () => setAlertState(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getUserProfileData();
      setUserData(res.user);
      setAddresses(res.addresses);
      setProfileForm({
        name: res.user.name || '',
        phone: res.user.phone || '',
        dob: res.user.dob ? res.user.dob.split('T')[0] : ''
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Handle Image Upload ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('image', file);

      setUploading(true);
      try {
        const updatedUser: any = await uploadUserProfilePicture(formData);
        setUserData(updatedUser); // Update local state immediately
        
        // Update localStorage so Navbar updates too
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        showAlert('success', 'Looking Good!', 'Profile picture updated successfully.');
      } catch (error) {
        showAlert('error', 'Upload Failed', 'Could not upload image. Try a smaller file.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfileData(profileForm);
      showAlert('success', 'Profile Updated', 'Your details have been saved.');
      fetchData(); 
    } catch (error) {
      showAlert('error', 'Update Failed', 'Could not update profile.');
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUserAddress(addressForm);
      showAlert('success', 'Address Added', 'New address saved to your book.');
      setIsAddingAddress(false);
      setAddressForm({ label: 'Home', street: '', city: '', state: '', zip: '', country: 'India', isDefault: false });
      fetchData(); 
    } catch (error) {
      showAlert('error', 'Error', 'Failed to add address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteUserAddress(id);
      setAddresses(prev => prev.filter(a => a._id !== id));
      showAlert('success', 'Deleted', 'Address removed.');
    } catch (error) {
      showAlert('error', 'Error', 'Failed to delete address.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Alert Dialog */}
      <AlertDialog open={alertState.isOpen} onOpenChange={(open) => !open && closeAlert()}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${alertState.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                {alertState.type === 'success' ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />}
              </div>
              <AlertDialogTitle className="text-xl">{alertState.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600">{alertState.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeAlert} className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl">Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40">
        
        {/* --- Profile Header --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12 text-center md:text-left"
        >
           {/* --- AVATAR SECTION --- */}
           <div className="relative group">
             <div className="w-24 h-24 rounded-full bg-slate-100 p-1 shadow-lg ring-4 ring-white relative overflow-hidden">
                {userData?.profilePicture ? (
                  <img 
                    src={userData.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <span className="text-3xl font-bold text-slate-500">
                      {userData?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Upload Loading State */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
             </div>

             {/* Camera Button Overlay */}
             <label 
               htmlFor="avatar-upload" 
               className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full shadow-md cursor-pointer hover:bg-slate-800 hover:scale-110 transition-all border-2 border-white"
             >
               <Camera className="w-4 h-4" />
               <input 
                 id="avatar-upload" 
                 type="file" 
                 className="hidden" 
                 accept="image/*"
                 onChange={handleAvatarChange}
                 disabled={uploading}
               />
             </label>
           </div>
           
           <div className="flex-1 space-y-1 mt-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{userData?.name || 'Welcome'}</h1>
              <p className="text-slate-500 font-medium">{userData?.email}</p>
              <div className="pt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  Member
                </span>
              </div>
           </div>
        </motion.div>

        {/* --- Tabs & Content (Same as before) --- */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start bg-slate-50/50 p-1 rounded-2xl border border-slate-100 mb-8 overflow-x-auto flex-nowrap">
            <TabsTrigger value="profile" className="rounded-xl flex-1 md:flex-none px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 font-medium">Profile Details</TabsTrigger>
            <TabsTrigger value="addresses" className="rounded-xl flex-1 md:flex-none px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 font-medium">Address Book</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                  <p className="text-sm text-slate-500">Update your contact details for a better experience.</p>
                </div>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                      <Input id="name" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700">Phone Number</Label>
                      <Input id="phone" type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 transition-all" placeholder="+91..." />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-slate-700">Date of Birth</Label>
                    <div className="relative max-w-sm">
                      <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <Input id="dob" type="date" value={profileForm.dob} onChange={e => setProfileForm({...profileForm, dob: e.target.value})} className="pl-12 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 transition-all" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">We'll send you a special surprise on your birthday!</p>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all">
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </TabsContent>

          {/* Addresses Tab (Same as before) */}
          <TabsContent value="addresses">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <button onClick={() => setIsAddingAddress(true)} className="h-full min-h-[200px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all group">
                    <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center mb-3 transition-colors shadow-sm"><Plus className="w-6 h-6" /></div>
                    <span className="font-medium">Add New Address</span>
                 </button>
                 {addresses.map((addr) => (
                   <div key={addr._id} className="relative p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                              {addr.label.toLowerCase().includes('office') ? <Briefcase className="w-5 h-5"/> : <Home className="w-5 h-5"/>}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">{addr.label}</h3>
                              <p className="text-xs text-slate-400 font-medium">SAVED ADDRESS</p>
                            </div>
                         </div>
                         <button onClick={() => handleDeleteAddress(addr._id)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="text-sm text-slate-600 leading-relaxed space-y-1">
                        <p className="font-medium text-slate-900">{addr.street}</p>
                        <p>{addr.city}, {addr.state}</p>
                        <p>{addr.zip}, {addr.country}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <AnimatePresence>
                {isAddingAddress && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-8">
                    <div className="max-w-2xl bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100">
                       <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-slate-900">Add New Address</h3>
                          <Button variant="ghost" size="sm" onClick={() => setIsAddingAddress(false)}>Cancel</Button>
                       </div>
                       <form onSubmit={handleAddressSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2"><Label>Label</Label><Input required placeholder="e.g. Home, Office" value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})} className="bg-white border-transparent" /></div>
                             <div className="space-y-2"><Label>Street Address</Label><Input required placeholder="Flat / House No / Street" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="bg-white border-transparent" /></div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                             <div className="space-y-2"><Label>City</Label><Input required placeholder="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="bg-white border-transparent" /></div>
                             <div className="space-y-2"><Label>State</Label><Input required placeholder="State" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="bg-white border-transparent" /></div>
                             <div className="space-y-2 col-span-2 md:col-span-1"><Label>Zip Code</Label><Input required placeholder="Zip" value={addressForm.zip} onChange={e => setAddressForm({...addressForm, zip: e.target.value})} className="bg-white border-transparent" /></div>
                          </div>
                          <div className="pt-2"><Button type="submit" className="w-full md:w-auto bg-slate-900 text-white rounded-xl h-11 px-8">Save Address</Button></div>
                       </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}