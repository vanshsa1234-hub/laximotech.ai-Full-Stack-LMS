'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar }  from '@/components/layout/navbar';
import { Footer }  from '@/components/layout/footer';
import { Award, CheckCircle, XCircle, Search, Share2, Linkedin, Download, Loader2 } from 'lucide-react';
import { certificatesApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function VerifyPage({ params }: { params: { id: string } }) {
  const [certId,   setCertId]   = useState(params.id ?? '');
  const [result,   setResult]   = useState<any>(null);
  const [loading,  setLoading]  = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Auto-verify if ID from URL
  useEffect(() => {
    if (params.id) handleVerify(params.id);
  }, []);

  const handleVerify = async (id?: string) => {
    const idToCheck = id ?? certId;
    if (!idToCheck.trim()) return;
    setLoading(true); setNotFound(false); setResult(null);
    try {
      const res = await certificatesApi.verify(idToCheck.trim());
      const data = res.data;
      if (data.valid) setResult(data);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Verification link copied!');
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
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

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 mb-8">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={certId} onChange={e => setCertId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  placeholder="e.g. LXT-2025-001"
                  className="input pl-10 h-12" />
              </div>
              <button onClick={() => handleVerify()} disabled={!certId.trim() || loading}
                className="btn-primary px-6 h-12 disabled:opacity-60 flex-shrink-0">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Checking...</> : 'Verify'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">Certificate IDs are in the format: LXT-YYYY-XXXXXX</p>
          </motion.div>

          {/* Result — Valid */}
          {result?.valid && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-green-100 overflow-hidden">
              <div className="bg-gradient-to-r from-brand-green to-green-500 px-6 py-4 flex items-center gap-3">
                <CheckCircle size={22} className="text-white" />
                <span className="text-white font-bold">✅ This certificate is VALID and AUTHENTIC</span>
              </div>
              <div className="p-8">
                {/* The actual generated certificate PDF for this student — embedded
                    directly, not a decorative recreation. */}
                {result.pdfUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 mb-6 bg-gray-50">
                    <iframe src={result.pdfUrl} title="Certificate" className="w-full h-[480px]" />
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center mb-6">
                    <Loader2 size={24} className="text-gray-300 mx-auto mb-2 animate-spin" />
                    <p className="text-gray-500 text-sm">Certificate PDF is still being generated — refresh in a moment.</p>
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Certificate Holder', value: result.holderName },
                    { label: 'Course',             value: result.courseTitle },
                    { label: 'Issue Date',          value: result.issuedAt },
                    { label: 'Certificate ID',      value: result.certificateNo },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs text-gray-400 mb-1">{label}</div>
                      <div className="font-semibold text-gray-900 text-sm">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Share buttons */}
                <div className="flex flex-wrap gap-3">
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#0077B5] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                    <Linkedin size={15} /> Share on LinkedIn
                  </a>
                  {result.pdfUrl && (
                    <a href={result.pdfUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
                      <Download size={15} /> Download PDF
                    </a>
                  )}
                  <button onClick={copyLink}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
                    <Share2 size={15} /> Copy Link
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Not found */}
          {notFound && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-card">
              <XCircle size={40} className="text-red-400 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-gray-900 text-lg mb-2">Certificate Not Found</h3>
              <p className="text-gray-500 text-sm">No certificate found with ID <strong>{certId}</strong>. Please check and try again.</p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}