'use client';

import { FileText, Download } from 'lucide-react';

interface LessonDocument {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
}

interface LessonDocumentsProps {
  documents: LessonDocument[];
}

/**
 * Read-only list of a lesson's optional downloadable material (notes,
 * slides, PDFs, etc). Each document gets its own download button — a
 * lesson may have any number of these, or none at all.
 */
export function LessonDocuments({ documents }: LessonDocumentsProps) {
  if (!documents?.length) {
    return <p className="text-gray-500 text-sm">No documents have been added for this lesson yet.</p>;
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div key={doc.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
          <FileText size={18} className="text-brand-orange flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{doc.title}</div>
            <div className="text-gray-500 text-xs uppercase">{doc.fileType}</div>
          </div>
          <a href={doc.fileUrl} download target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 flex-shrink-0 bg-gray-800 hover:bg-brand-blue text-gray-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            <Download size={13} /> Download
          </a>
        </div>
      ))}
    </div>
  );
}
