'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface MediaLightboxProps {
  media: { url: string; type: string } | null;
  onClose: () => void;
}

export function MediaLightbox({ media, onClose }: MediaLightboxProps) {
  return (
    <AnimatePresence>
      {media && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 z-[70] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X size={28} />
          </button>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            {media.type === 'VIDEO' ? (
              <video src={media.url} controls autoPlay className="max-w-[92vw] max-h-[88vh] rounded-lg" />
            ) : (
              <img src={media.url} alt="" className="max-w-[92vw] max-h-[88vh] rounded-lg object-contain" />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}