'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
      <div className="text-center text-white max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
          <WifiOff size={36} className="text-white/70" />
        </div>
        <h1 className="font-heading font-bold text-3xl mb-3">You're Offline</h1>
        <p className="text-white/60 mb-8 leading-relaxed">
          Internet connection nahi hai. App install karke offline bhi padh sakte hain — 
          downloaded lessons available rahenge.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-brand-orange text-white font-bold px-6 py-3 rounded-full shadow-orange hover:bg-brand-orange-light transition-all">
            <RefreshCw size={16} /> Try Again
          </button>
          <Link href="/dashboard"
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/20 transition-all">
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
