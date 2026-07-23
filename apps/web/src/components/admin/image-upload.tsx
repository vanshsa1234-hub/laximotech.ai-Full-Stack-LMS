'use client';

import { useRef, useState } from 'react';
import { Upload, X, Loader2, ImageIcon, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { storageApi } from '@/lib/api';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: 'thumbnails' | 'certificate-bg';
  aspectClassName?: string; // e.g. 'aspect-video' for course cards, 'aspect-square' for avatars
  helpText?: string;
}

/**
 * Real file upload straight to this server's local disk — no AWS account
 * needed. Falls back to a manual URL-paste option if the upload ever fails.
 * Used anywhere admins attach an image: course thumbnails, blog covers,
 * career-path icons, instructor photos.
 */
export function ImageUpload({ label, value, onChange, folder = 'thumbnails', aspectClassName = 'aspect-video', helpText }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return; }

    setUploading(true);
    try {
      const { data } = await storageApi.uploadFile(file, folder);
      onChange(data.url);
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Upload failed. Please try again or paste a URL instead.');
      setShowUrlInput(true);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>

      {value ? (
        <div className={`relative ${aspectClassName} rounded-xl overflow-hidden border border-gray-700 bg-gray-800 mb-2`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 transition-colors">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className={`${aspectClassName} rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/50 flex flex-col items-center justify-center gap-2 mb-2`}>
          <ImageIcon size={24} className="text-gray-600" />
          <span className="text-gray-500 text-xs">No image set</span>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <div className="flex gap-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-white text-sm py-2 rounded-lg hover:border-brand-orange transition-colors disabled:opacity-60">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        <button type="button" onClick={() => setShowUrlInput(s => !s)}
          className="flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-gray-400 text-sm px-3 py-2 rounded-lg hover:border-gray-600 transition-colors">
          <LinkIcon size={14} />
        </button>
      </div>

      {showUrlInput && (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="https://... (paste image URL)"
          className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange" />
      )}
      {helpText && <p className="text-xs text-gray-500 mt-1.5">{helpText}</p>}
    </div>
  );
}
