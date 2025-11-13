'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// --- Shadcn/ui Components ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// --- Icons ---
import { Loader2, Chrome, Facebook, Sparkles } from 'lucide-react';

// --- API Functions (Uncomment when ready) ---
// import { loginAdmin } from '@/lib/appService';
// import { loginWithGoogle, loginWithFacebook } from '@/lib/appService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<null | 'google' | 'facebook'>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // --- UNCOMMENT YOUR LOGIN LOGIC ---
      // await loginAdmin({ email, password });
      // router.push('/admin/dashboard');

      // --- Mock Logic ---
      console.log('Login attempt:', { email, password, rememberMe });
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/');
      // --- End Mock Logic ---

    } catch (error) {
      console.error('Login error:', error);
      // Here you would show a Toast or Error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsSocialLoading('google');
    // --- UNCOMMENT YOUR GOOGLE LOGIN ---
    // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    console.log('Redirecting to Google...');
  };

  const handleFacebookLogin = () => {
    setIsSocialLoading('facebook');
    // --- UNCOMMENT YOUR FACEBOOK LOGIN ---
    // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
    console.log('Redirecting to Facebook...');
  };

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen flex bg-white text-[#1C1C1C]">
      {/* --- Left Side - Login Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.div variants={itemVariants}>
            <Image
              src="/logo.png" // <-- UPDATE THIS TO YOUR LOGO PATH
              alt="The Bottle Stories Logo"
              width={80}
              height={80}
              className="mb-6 rounded-full"
            />
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg">Please login to your account.</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
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

            <motion.div variants={itemVariants} className="space-y-2">
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

            <motion.div variants={itemVariants} className="flex items-center justify-between">
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

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                disabled={isLoading || !!isSocialLoading}
                className="w-full bg-[#1C1C1C] text-white py-3 h-12 text-base rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <motion.p variants={itemVariants} className="text-center text-sm text-gray-600 pt-4">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#1C1C1C] hover:underline font-bold transition-colors">
                Sign up
              </Link>
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
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80" // A beautiful, relevant image
          alt="Luxury perfume bottles"
          fill
          className="object-cover z-0"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/60 z-10" />

        {/* Content */}
        <motion.div 
          className="relative z-20 text-center max-w-md text-white"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <Image
              src="/logo.png" // <-- UPDATE THIS (must be a white/light version or have a clear background)
              alt="The Bottle Stories Logo"
              width={120}
              height={120}
              className="mx-auto rounded-full shadow-2xl"
            />
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-4xl font-serif font-bold mb-4">
            Every bottle tells a story
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-gray-200">
            Discover luxury perfume gift hampers that create unforgettable moments and lasting memories.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}