'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, MousePointerClick } from 'lucide-react';

// react-three-fiber renders to <canvas> via WebGL and touches `window`/`document`
// immediately on import — it cannot be server-rendered. Loading it with
// next/dynamic + ssr:false keeps all of three.js/rapier out of the server
// bundle and out of the initial page JS entirely, only fetching it in the
// browser once this component actually mounts.
const Lanyard = dynamic(() => import('./Lanyard'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
    </div>
  ),
});

interface StudentIdCardProps {
  name: string;
  email: string;
  photoUrl?: string | null;
  role?: string;
  joinedAt?: string | Date | null;
  studentId: string;
  coursesEnrolled: number;
  certificatesEarned: number;
}

function formatJoinDate(date?: string | Date | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/** Rounded-rect helper — canvas has no built-in one. */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draws the "back of the ID card" — the student's real details, rendered
 * as an actual image (not HTML) since it needs to be baked onto the 3D
 * card's texture. Returns a data URL.
 */
function drawCardBack(data: StudentIdCardProps): string {
  // Logical layout stays at 640x968 (every coordinate/font-size below is
  // unchanged) — SCALE renders that layout onto a much bigger actual pixel
  // buffer via ctx.scale(), so this image is downscaled (crisp) rather than
  // upscaled (blurry) once it lands on the card's texture, which has more
  // physical pixels in the front-face region than a plain 640x968 image did.
  const W = 640, H = 968;
  const SCALE = 3;
  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);

  // Background — brand navy gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f1729');
  bg.addColorStop(0.55, '#1F4E79');
  bg.addColorStop(1, '#2d1b69');
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, W, H, 28);
  ctx.fill();

  // Subtle inner border
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  roundRect(ctx, 14, 14, W - 28, H - 28, 20);
  ctx.stroke();

  // Brand header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FF6B00';
  ctx.font = '700 26px system-ui, -apple-system, sans-serif';
  ctx.fillText('laximotech.ai', W / 2, 90);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText('VERIFIED STUDENT ID', W / 2, 118);

  // Divider
  ctx.strokeStyle = 'rgba(255,107,0,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 60, 138);
  ctx.lineTo(W / 2 + 60, 138);
  ctx.stroke();

  // Name
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 40px Georgia, serif';
  const name = data.name.length > 22 ? data.name.slice(0, 21) + '…' : data.name;
  ctx.fillText(name, W / 2, 205);

  // Email
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '400 19px system-ui, sans-serif';
  const email = data.email.length > 30 ? data.email.slice(0, 29) + '…' : data.email;
  ctx.fillText(email, W / 2, 236);

  // Field grid
  const fields: [string, string][] = [
    ['STUDENT ID', data.studentId],
    ['ROLE', (data.role ?? 'Student').toUpperCase()],
    ['MEMBER SINCE', formatJoinDate(data.joinedAt)],
    ['COURSES ENROLLED', String(data.coursesEnrolled)],
    ['CERTIFICATES EARNED', String(data.certificatesEarned)],
  ];

  let y = 320;
  const rowH = 108;
  fields.forEach(([label, value]) => {
    // Row background
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    roundRect(ctx, 60, y, W - 120, rowH - 20, 14);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText(label, 90, y + 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 26px system-ui, sans-serif';
    ctx.fillText(value, 90, y + 68);

    y += rowH;
  });

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '400 13px system-ui, sans-serif';
  ctx.fillText('Scan the front to verify this student at laximotech.ai/verify', W / 2, H - 36);

  return canvas.toDataURL('image/png');
}

export function StudentIdCard(props: StudentIdCardProps) {
  const [detailsImage, setDetailsImage] = useState<string | null>(null);

  // Canvas drawing is a browser-only API — generate the details face texture
  // once mounted, and whenever the underlying student data changes.
  useEffect(() => {
    setDetailsImage(drawCardBack(props));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.name, props.email, props.photoUrl, props.role, props.joinedAt, props.studentId, props.coursesEnrolled, props.certificatesEarned]);

  const photoImage = useMemo(() => props.photoUrl || null, [props.photoUrl]);
  const [flipTrigger, setFlipTrigger] = useState(0);

  return (
    <div className="relative">
      <div className="h-[420px] sm:h-[480px] rounded-2xl overflow-hidden bg-gradient-to-b from-brand-blue/5 to-transparent dark:from-white/[0.03]">
        {detailsImage && (
          <Lanyard
            position={[0, 0, 20]}
            gravity={[0, -40, 0]}
            frontImage={detailsImage}
            backImage={photoImage}
            imageFit="cover"
            flipTrigger={flipTrigger}
          />
        )}
      </div>

      {/* Explicit controls, since not everyone will think to drag-rotate a 3D object */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <p className="flex items-center gap-1.5 text-xs text-gray-400">
          <MousePointerClick size={13} /> Drag the card to spin it
        </p>
        <span className="text-gray-300 dark:text-gray-700">•</span>
        <button
          type="button"
          onClick={() => setFlipTrigger(n => n + 1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:text-brand-orange-light transition-colors"
        >
          <RefreshCw size={13} /> Flip to see photo
        </button>
      </div>
    </div>
  );
}