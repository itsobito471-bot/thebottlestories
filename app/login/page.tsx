'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// --- Shadcn/ui Components ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- Icons ---
import { Loader2, Chrome, Facebook, AlertCircle, CheckCircle2 } from 'lucide-react';

// --- API functions ---
import { registerUser, loginUser } from '@/lib/appService';

// --- Cart Context ---
import { useCart } from '@/app/context/CartContext';

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'register'>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<null | 'google' | 'facebook'>(null);
  
  // --- Alert Dialog State ---
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: 'success' | 'error';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'success',
  });

  const router = useRouter();
  const { syncCart } = useCart();

  // --- Helper to show Alert ---
  const showAlert = (title: string, description: string, variant: 'success' | 'error', onConfirm?: () => void) => {
    setAlertState({
      isOpen: true,
      title,
      description,
      variant,
      onConfirm
    });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    // Execute the confirm action if it exists when closing/clicking continue
    if (alertState.onConfirm) {
      alertState.onConfirm();
    }
  };

  const toggleView = () => {
    setView((prev) => (prev === 'login' ? 'register' : 'login'));
    setName('');
    setEmail('');
    setPassword('');
    setIsLoading(false);
    setIsSocialLoading(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (view === 'login') {
      // --- LOGIN LOGIC ---
      try {
        const data = await loginUser({ email, password });
        
        // Save session logic
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', data.token);
        storage.setItem('user', JSON.stringify(data.user)); 

        if (!rememberMe) {
            localStorage.setItem('token', data.token);
        }

        // Sync Cart Immediately
        await syncCart();

        // Show Success Alert
        showAlert(
          'Login Successful!',
          `Welcome back, ${data.user.name}!`,
          'success',
          () => {
            router.push('/'); 
            router.refresh(); 
          }
        );

      } catch (error: any) {
        console.error('Login error:', error);
        showAlert(
          'Login Failed',
          error.message || 'Invalid credentials. Please try again.',
          'error'
        );
        setIsLoading(false);
      }
    } else {
      // --- REGISTER LOGIC ---
      try {
        await registerUser({ name, email, password });

        // Show Success Alert
        showAlert(
          'Account Created!',
          'You can now log in with your new account.',
          'success',
          () => toggleView() // Switch to login view on confirm
        );

      } catch (error: any) {
        console.error('Register error:', error);
        showAlert(
          'Registration Failed',
          error.message || 'Please check your details and try again.',
          'error'
        );
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = () => {
    setIsSocialLoading('google');
    console.log('Redirecting to Google...');
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    setIsSocialLoading('facebook');
    console.log('Redirecting to Facebook...');
    // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto' },
    exit: { opacity: 0, y: -10, height: 0, transition: { duration: 0.2 } }
  } as const;
  
  const formItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  } as const;

  const imageVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  } as const;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-[#1C1C1C]">
      
      {/* --- Alert Dialog Component --- */}
      <AlertDialog open={alertState.isOpen} onOpenChange={(isOpen) => !isOpen && setAlertState(prev => ({ ...prev, isOpen: false }))}>
        <AlertDialogContent className="rounded-2xl border border-slate-100 shadow-2xl max-w-sm">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              alertState.variant === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {alertState.variant === 'success' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              {alertState.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base mt-2">
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-4 w-full">
            <AlertDialogAction 
              onClick={closeAlert}
              className={`w-full rounded-xl h-10 font-medium text-white ${
                alertState.variant === 'success' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {alertState.variant === 'success' ? 'Continue' : 'Try Again'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Left Side - Login/Register Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div
          className="w-full max-w-md"
          key={view} 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.div variants={formItemVariants}>
            <Image
              src="/logo.png" 
              alt="The Bottle Stories Logo"
              width={80}
              height={80}
              className="mb-6 rounded-full"
            />
          </motion.div>

          {/* Header */}
          <motion.div variants={formItemVariants} className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
              {view === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-gray-600 text-lg">
              {view === 'login'
                ? 'Please login to your account.'
                : 'Get started by creating your account.'}
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <AnimatePresence>
              {view === 'register' && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-2 overflow-hidden"
                >
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 h-12 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-[#222222] focus:border-transparent outline-none transition-all"
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={formItemVariants} className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 h-12 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-[#222222] focus:border-transparent outline-none transition-all"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div variants={formItemVariants} className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 h-12 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-[#222222] focus:border-transparent outline-none transition-all"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </motion.div>

            <AnimatePresence>
              {view === 'login' && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex items-center justify-between overflow-hidden"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                      disabled={isLoading}
                      className="h-4 w-4 data-[state=checked]:bg-[#1C1C1C] data-[state=checked]:border-[#1C1C1C]"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-700 font-normal">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-[#1C1C1C] hover:underline font-medium transition-colors">
                    Forgot password?
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={formItemVariants}>
              <Button
                type="submit"
                disabled={isLoading || !!isSocialLoading}
                className="w-full bg-[#1C1C1C] text-white py-3 h-12 text-base rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  view === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </motion.div>

            <motion.div variants={formItemVariants} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or {view === 'login' ? 'continue' : 'sign up'} with
                </span>
              </div>
            </motion.div>

            <motion.div variants={formItemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading || !!isSocialLoading}
                className="w-full flex items-center justify-center px-4 py-3 h-12 text-base border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isSocialLoading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Chrome className="w-5 h-5 mr-2" />
                    Google
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleFacebookLogin}
                disabled={isLoading || !!isSocialLoading}
                className="w-full flex items-center justify-center px-4 py-3 h-12 text-base border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isSocialLoading === 'facebook' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Facebook className="w-5 h-5 mr-2" fill="#1877F2" />
                    Facebook
                  </>
                )}
              </Button>
            </motion.div>

            <motion.p variants={formItemVariants} className="text-center text-sm text-gray-600 pt-4">
              {view === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={toggleView}
                className="text-[#1C1C1C] hover:underline font-bold transition-colors"
              >
                {view === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </motion.p>
          </form>
        </motion.div>
      </div>

      {/* --- Right Side - Image/Branding --- */}
      <motion.div 
        className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
        variants={imageVariants}
        initial="hidden"
        animate="visible"
      >
        <Image
          src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80"
          alt="Luxury perfume bottles"
          fill
          className="object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/60 z-10" />
        <motion.div 
          className="relative z-20 text-center max-w-md text-white"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={formItemVariants} className="mb-8">
            <Image
              src="/logo.png" 
              alt="The Bottle Stories Logo"
              width={120}
              height={120}
              className="mx-auto rounded-full shadow-2xl"
            />
          </motion.div>
          <motion.h2 variants={formItemVariants} className="text-4xl font-serif font-bold mb-4">
            Every bottle tells a story
          </motion.h2>
          <motion.p variants={formItemVariants} className="text-lg text-gray-200">
            Discover luxury perfume gift hampers that create unforgettable moments and lasting memories.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}