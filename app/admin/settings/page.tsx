'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// You need to create these API functions in your service
import { getStoreSettings, updateStoreSettings } from '@/lib/appService';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Save, Loader2, MapPin, Phone, Mail, Building, 
  Globe, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Types ---
interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface StoreSettings {
  contact_email: string;
  contact_phone: string;
  address: Address;
}

// --- Skeleton Component ---
const SettingsSkeleton = () => (
  <div className="min-h-screen bg-slate-50/50">
    <AdminNav />
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </main>
  </div>
);

export default function AdminSettings() {
  const router = useRouter();

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<StoreSettings>({
    contact_email: '',
    contact_phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    }
  });

  // --- Load Data ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getStoreSettings();
        if (data) setFormData(data);
      } catch (err) {
        console.error("Failed to load settings", err);
        // Optional: Redirect to login if 401
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (success) setSuccess(false); // Reset success message on edit
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value }
    }));
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateStoreSettings(formData);
      setSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminNav />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit}>
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>
              <p className="text-slate-500 mt-1">Manage your contact details and business location.</p>
            </div>
            
            <Button 
              type="submit" 
              disabled={saving}
              className={`min-w-[140px] transition-all ${success ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900'}`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="space-y-6">
            
            {/* --- Section 1: Contact Information --- */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900">Contact Information</CardTitle>
                      <CardDescription>How customers can reach you.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-slate-600">Support Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        id="contact_email"
                        name="contact_email"
                        type="email" 
                        placeholder="support@store.com"
                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        value={formData.contact_email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone" className="text-slate-600">Support Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        id="contact_phone"
                        name="contact_phone"
                        type="tel" 
                        placeholder="+91 99999 99999"
                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>

            {/* --- Section 2: Physical Address --- */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Building className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900">Business Address</CardTitle>
                      <CardDescription>Used for invoices and shipping returns.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-slate-600">Street Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                          id="street"
                          name="street"
                          placeholder="123 Market St, Floor 2"
                          className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
                          value={formData.address.street}
                          onChange={handleAddressChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-slate-600">City</Label>
                        <Input 
                          id="city"
                          name="city"
                          placeholder="Kozhikode"
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                          value={formData.address.city}
                          onChange={handleAddressChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-slate-600">State / Province</Label>
                        <Input 
                          id="state"
                          name="state"
                          placeholder="Kerala"
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                          value={formData.address.state}
                          onChange={handleAddressChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zip" className="text-slate-600">Postal Code</Label>
                        <Input 
                          id="zip"
                          name="zip"
                          placeholder="673001"
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                          value={formData.address.zip}
                          onChange={handleAddressChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-slate-600">Country</Label>
                        <Input 
                          id="country"
                          name="country"
                          placeholder="India"
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                          value={formData.address.country}
                          onChange={handleAddressChange}
                        />
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>

          </div>
        </form>
      </main>
    </div>
  );
}