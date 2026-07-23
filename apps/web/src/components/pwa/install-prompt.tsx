'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [prompt,  setPrompt]  = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      // Show after 30 seconds on page
      setTimeout(() => setVisible(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem('pwa_dismissed', '1');
    setVisible(false);
  };

  if (installed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50"
        >
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-blue flex items-center justify-center flex-shrink-0">
                <Smartphone size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-bold text-gray-900 text-sm mb-0.5">
                  Install laximotech.ai
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Install the app — it works offline too. Faster, better experience.
                </p>
              </div>
              <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={install}
                className="flex-1 flex items-center justify-center gap-1.5 bg-brand-blue text-white font-semibold text-xs py-2.5 rounded-xl hover:bg-brand-blue-light transition-colors">
                <Download size={13} /> Install App
              </button>
              <button onClick={dismiss}
                className="flex-1 text-gray-500 font-semibold text-xs py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
