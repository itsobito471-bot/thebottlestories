'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFragranceById } from '@/lib/appService';
import { Fragrance } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FlaskConical, Wind, Flower2, Mountain, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FragranceDetails() {
    const params = useParams();
    const router = useRouter();
    const [fragrance, setFragrance] = useState<Fragrance | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadFragrance(params.id as string);
        }
    }, [params.id]);

    const loadFragrance = async (id: string) => {
        try {
            const res = await getFragranceById(id);
            setFragrance(res);
        } catch (error) {
            console.error('Failed to load fragrance', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!fragrance) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <p className="text-xl text-slate-500">Fragrance not found.</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="mb-8">
                    <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-full text-sm font-medium text-slate-700 transition-colors duration-200">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Product
                    </button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 shadow-2xl"
                    >
                        {fragrance.image ? (
                            <img
                                src={fragrance.image}
                                alt={fragrance.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                <FlaskConical className="w-24 h-24 mb-4" />
                                <span className="text-lg font-medium">No Image Available</span>
                            </div>
                        )}
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold tracking-wider uppercase mb-4">
                                Premium Scent Profile
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 font-serif">
                                {fragrance.name}
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                {fragrance?.description || "A meticulously crafted fragrance designed to evoke detailed olfactory memories and experiences."}
                            </p>
                        </div>

                        {/* Olfactory Pyramid */}
                        <div className="space-y-6 bg-slate-50 p-8 rounded-2xl border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 font-serif">Olfactory Pyramid</h3>

                            <div className="space-y-6">
                                {/* Top Notes */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                                        <Wind className="w-6 h-6 text-sky-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-sky-800 uppercase tracking-wide mb-1">Top Notes</h4>
                                        <p className="text-slate-700">
                                            {fragrance.notes?.top?.join(', ') || 'Fresh, Citrusy Accords'}
                                        </p>
                                    </div>
                                </div>

                                {/* Heart Notes */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                                        <Flower2 className="w-6 h-6 text-pink-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-pink-800 uppercase tracking-wide mb-1">Heart Notes</h4>
                                        <p className="text-slate-700">
                                            {fragrance.notes?.middle?.join(', ') || 'Floral, Spicy Core'}
                                        </p>
                                    </div>
                                </div>

                                {/* Base Notes */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        <Mountain className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-1">Base Notes</h4>
                                        <p className="text-slate-700">
                                            {fragrance.notes?.base?.join(', ') || 'Woody, Gourmand Foundation'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <p className="text-sm text-slate-400 italic">
                                * Note composition may vary slightly based on raw material availability.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
