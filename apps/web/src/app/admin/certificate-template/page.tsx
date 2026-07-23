'use client';

import { useState, useEffect } from 'react';
import { Award, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminSiteContent, useUpdateSiteContent, useResetSiteContent, useRegenerateCertificates } from '@/hooks/use-queries';
import { CertificateTemplateEditor } from '@/components/admin/certificate-template-editor';

export default function CertificateTemplatePage() {
  const { data: all, isLoading } = useAdminSiteContent();
  const updateContent = useUpdateSiteContent();
  const resetContent  = useResetSiteContent();
  const regenerate    = useRegenerateCertificates();

  const entry = (all as any[])?.find(c => c.key === 'certificate-template');
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => { if (entry) setDraft(entry.data); }, [entry?.key, all]);

  const handleSave = () => {
    updateContent.mutate({ key: 'certificate-template', data: draft }, {
      onSuccess: () => toast.success('Saved! New certificates will use this design.'),
      onError:   () => toast.error('Failed to save.'),
    });
  };

  const handleReset = () => {
    if (!confirm('Reset to the built-in default certificate design? Your custom layout will be lost.')) return;
    resetContent.mutate('certificate-template', { onSuccess: () => toast.success('Reset to default design.') });
  };

  const handleRegenerate = () => {
    if (!confirm('Re-render every already-issued certificate with this design? This may take a moment.')) return;
    regenerate.mutate(undefined, {
      onSuccess: (res: any) => toast.success(`Updated ${res.succeeded}/${res.total} certificates with the new design.`),
      onError:   () => toast.error('Failed to regenerate certificates.'),
    });
  };

  if (isLoading || !draft) {
    return <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-white text-2xl flex items-center gap-2">
          <Award size={22} className="text-brand-orange" /> Certificate Design
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload your own certificate background and position where the student's name, course, and other details appear.
          Leave the background empty to keep using the built-in default design. This is the site-wide default — individual
          courses can override it from their own builder page's Certificate tab.
        </p>
      </div>

      <CertificateTemplateEditor
        data={draft}
        onChange={setDraft}
        onSave={handleSave}
        saving={updateContent.isPending}
        onReset={handleReset}
        resetting={resetContent.isPending}
        showReset={!!entry?.isCustomized}
        onRegenerate={handleRegenerate}
        regenerating={regenerate.isPending}
        regenerateNote="A certificate's PDF is only generated once, when it's first issued. After saving a new design, use this to re-render every certificate students already earned — otherwise they'll keep the design that was live when they were issued."
      />
    </div>
  );
}
