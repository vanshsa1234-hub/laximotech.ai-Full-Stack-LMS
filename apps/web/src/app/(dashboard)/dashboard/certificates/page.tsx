'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Award, Download, Share2, Linkedin, ExternalLink } from 'lucide-react';
import { useMyCertificates } from '@/hooks/use-queries';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

export default function CertificatesPage() {
  const { data: res, isLoading } = useMyCertificates();
  const certs = (res as any) ?? [];

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`https://laximotech.ai/verify/${id}`);
    toast.success('Link copied!');
  };

  return (
    <main className="min-h-screen bg-brand-ice pt-6 pb-24 md:pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading font-bold text-gray-900 text-2xl mb-2">My Certificates</h1>
        <p className="text-gray-500 text-sm mb-8">All earned certificates — LinkedIn-verifiable</p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        ) : certs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certs.map((cert: any, i: number) => (
              <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-purple-900 p-8 text-white text-center relative">
                  <div className="absolute inset-3 border border-white/20 rounded-lg pointer-events-none" />
                  <Award size={32} className="mx-auto mb-3 text-brand-orange" />
                  <div className="font-heading font-bold text-lg leading-snug mb-2">{cert.course?.title}</div>
                  {cert.finalScore && <div className="text-brand-orange text-sm font-semibold">Score: {cert.finalScore}%</div>}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs text-gray-400">Issued on</div>
                      <div className="font-semibold text-gray-900">{formatDate(cert.issuedAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Certificate ID</div>
                      <div className="font-mono text-xs text-gray-700">{cert.certificateNo}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=https://laximotech.ai/verify/${cert.certificateNo}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#0077B5] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity">
                      <Linkedin size={13} /> LinkedIn
                    </a>
                    <button onClick={() => copyLink(cert.certificateNo)}
                      className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      <Share2 size={13} /> Share
                    </button>
                    {cert.pdfUrl && (
                      <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <Download size={13} /> PDF
                      </a>
                    )}
                    <Link href={`/verify/${cert.certificateNo}`}
                      className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      <ExternalLink size={13} /> Verify
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-card">
            <Award size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-gray-700 text-lg mb-2">No certificates yet</h3>
            <p className="text-gray-400 text-sm mb-6">Complete a course to earn your first certificate</p>
            <Link href="/courses" className="btn-primary inline-flex">Browse Courses</Link>
          </div>
        )}
      </div>
    </main>
  );
}
