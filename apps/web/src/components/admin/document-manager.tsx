'use client';

import { useRef, useState } from 'react';
import { Upload, X, Loader2, FileText, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { storageApi, coursesApi } from '@/lib/api';

interface LessonDocument {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  order: number;
}

interface DocumentManagerProps {
  lessonId: string;
  documents: LessonDocument[];
  onChange: (documents: LessonDocument[]) => void;
}

const EXT_BY_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

/**
 * Manages the optional, per-lesson document list (notes, slides, PDFs, etc).
 * Independent of the lesson video — a lesson can have zero, one, or many.
 * Only usable once the lesson has been saved (needs a real lessonId), since
 * documents are persisted immediately via their own endpoint rather than
 * being buffered in the lesson form state.
 */
export function DocumentManager({ lessonId, documents, onChange }: DocumentManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileType = EXT_BY_MIME[file.type];
    if (!fileType) { toast.error('Please select a PDF, PPT, or Word document.'); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error('Document must be under 20MB.'); return; }
    if (!title.trim()) { toast.error('Give this document a title first (e.g. "Lecture Notes").'); return; }

    setUploading(true);
    try {
      const { data: uploaded } = await storageApi.uploadFile(file, 'documents');
      const { data: created } = await coursesApi.addLessonDocument(lessonId, {
        title: title.trim(), fileUrl: uploaded.url, fileType, order: documents.length,
      });
      onChange([...documents, created]);
      setTitle('');
      toast.success('Document added!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeDocument = async (documentId: string) => {
    try {
      await coursesApi.deleteLessonDocument(documentId);
      onChange(documents.filter(d => d.id !== documentId));
      toast.success('Document removed');
    } catch {
      toast.error('Failed to remove document.');
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5">
        Documents <span className="text-gray-600 font-normal">(optional — notes, slides, PDFs)</span>
      </label>

      {documents.length > 0 && (
        <div className="space-y-2 mb-2">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
              <FileText size={14} className="text-brand-orange flex-shrink-0" />
              <span className="text-sm text-white truncate flex-1">{doc.title}</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded flex-shrink-0">{doc.fileType}</span>
              <button type="button" onClick={() => removeDocument(doc.id)}
                className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Title, e.g. "Lecture Notes"'
          disabled={uploading}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange disabled:opacity-60" />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading || !title.trim()}
          className="flex items-center justify-center gap-1.5 bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg hover:border-brand-orange transition-colors disabled:opacity-40 whitespace-nowrap">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {uploading ? 'Uploading...' : 'Add'}
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" onChange={handleFileSelect} className="hidden" />
      <p className="text-xs text-gray-500 mt-1.5">PDF, PPT, or Word — up to 20MB each. Type a title, then choose a file to upload it.</p>
    </div>
  );
}
