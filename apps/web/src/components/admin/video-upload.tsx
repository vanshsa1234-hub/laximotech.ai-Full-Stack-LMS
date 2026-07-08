'use client';

import { useRef, useState } from 'react';
import { Upload, X, Loader2, Video as VideoIcon, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { storageApi } from '@/lib/api';

interface VideoUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onDurationDetected?: (seconds: number) => void;
  helpText?: string;
}

/**
 * Real video upload — local disk first, automatic AWS S3 fallback if
 * configured. Shows a progress bar since video files take real time to
 * transfer, unlike thumbnails. Falls back to a manual URL-paste option if
 * upload fails, matching ImageUpload's pattern. Also reads the real video
 * duration client-side so lesson completion tracking isn't left guessing.
 */
export function VideoUpload({ label, value, onChange, onDurationDetected, helpText }: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error('Please select a video file.'); return; }
    if (file.size > 300 * 1024 * 1024) { toast.error('Video must be under 300MB.'); return; }

    setUploading(true);
    setProgress(0);

    // Read the real duration straight from the file — removes the need to
    // guess it, which is what let lessons "complete" almost instantly
    // regardless of actual watch time when duration was left blank.
    if (onDurationDetected) {
      const tempUrl = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.onloadedmetadata = () => {
        if (isFinite(tempVideo.duration)) onDurationDetected(Math.round(tempVideo.duration));
        URL.revokeObjectURL(tempUrl);
      };
      tempVideo.src = tempUrl;
    }

    try {
      const { data } = await storageApi.uploadFile(file, 'videos', setProgress);
      onChange(data.url);
      toast.success('Video uploaded!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Upload failed. Please try again or paste a URL instead.');
      setShowUrlInput(true);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>

      {value && !uploading ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-black mb-2">
          <video src={value} controls className="w-full max-h-64" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 transition-colors z-10">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/50 flex flex-col items-center justify-center gap-2 mb-2 py-8">
          {uploading ? (
            <>
              <Loader2 size={24} className="text-brand-orange animate-spin" />
              <span className="text-gray-400 text-xs">Uploading... {progress}%</span>
              <div className="w-2/3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-brand-orange transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <VideoIcon size={24} className="text-gray-600" />
              <span className="text-gray-500 text-xs">No video set</span>
            </>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

      <div className="flex gap-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-white text-sm py-2 rounded-lg hover:border-brand-orange transition-colors disabled:opacity-60">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
        <button type="button" onClick={() => setShowUrlInput(s => !s)} disabled={uploading}
          className="flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-gray-400 text-sm px-3 py-2 rounded-lg hover:border-gray-600 transition-colors disabled:opacity-60">
          <LinkIcon size={14} />
        </button>
      </div>

      {showUrlInput && (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="https://... or videos/file.mp4 (paste video URL)"
          className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange" />
      )}
      {helpText && <p className="text-xs text-gray-500 mt-1.5">{helpText}</p>}
    </div>
  );
}
