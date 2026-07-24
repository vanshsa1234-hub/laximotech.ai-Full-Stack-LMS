'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Award, Search, ArrowRight } from 'lucide-react';

export default function VerifyIndexPage() {
  const router = useRouter();
  const [certId, setCertId] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (certId.trim()) router.push(`/verify/${certId.trim()}`);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center mx-auto mb-4 shadow-blue">
              <Award size={32} className="text-white" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="font-heading font-bold text-gray-900 text-3xl mb-2">
              Certificate Verification
            </motion.h1>
            <p className="text-gray-500">Enter a certificate ID to verify its authenticity</p>
          </div>

          <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={certId} onChange={e => setCertId(e.target.value)}
                  placeholder="e.g. LXT-2025-001" className="input pl-10 h-12" autoFocus />
              </div>
              <button type="submit" disabled={!certId.trim()}
                className="btn-primary px-6 h-12 disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0">
                Verify <ArrowRight size={15} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Certificate IDs are issued automatically when a student completes a course and passes the final exam.
            </p>
          </motion.form>
        </div>
      </main>
      <Footer />
    </>
  );
}
