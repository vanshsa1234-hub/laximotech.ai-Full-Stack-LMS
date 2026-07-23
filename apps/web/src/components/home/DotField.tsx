'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import './DotField.css';

export interface DotFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  cursorForce?: number;
  bulgeOnly?: boolean;
  bulgeStrength?: number;
  glowRadius?: number;
  waveAmplitude?: number;
  sparkle?: boolean;

  // Theme-aware color presets
  darkGradientFrom?: string;
  darkGradientTo?: string;
  darkGlowColor?: string;
  lightGradientFrom?: string;
  lightGradientTo?: string;
  lightGlowColor?: string;
}

function lerpColor(from: string, to: string, t: number): string {
  const f = parseInt(from.slice(1), 16);
  const tt = parseInt(to.slice(1), 16);
  const fr = (f >> 16) & 255, fg = (f >> 8) & 255, fb = f & 255;
  const tr = (tt >> 16) & 255, tg = (tt >> 8) & 255, tb = tt & 255;
  const r = Math.round(fr + (tr - fr) * t);
  const g = Math.round(fg + (tg - fg) * t);
  const b = Math.round(fb + (tb - fb) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

interface Dot {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  color: string;
  sparklePhase: number;
  sparkleSpeed: number;
}

const DotField = forwardRef<HTMLDivElement, DotFieldProps>(function DotField(
  {
    dotRadius = 1.6,
    dotSpacing = 32,
    cursorRadius = 140,
    cursorForce = 0.18,
    bulgeOnly = false,
    bulgeStrength = 14,
    glowRadius = 160,
    waveAmplitude = 0,
    sparkle = false,
    darkGradientFrom = '#000000',
    darkGradientTo = '#000000',
    darkGlowColor = '#ffffff',
    lightGradientFrom = '#a855f7',
    lightGradientTo = '#b497cf',
    lightGlowColor = '#120f17',
    className,
    ...rest
  },
  ref,
) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const gradientFrom = isDark ? darkGradientFrom : lightGradientFrom;
  const gradientTo = isDark ? darkGradientTo : lightGradientTo;
  const glowColor = isDark ? darkGlowColor : lightGlowColor;

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const glowRef    = useRef<SVGCircleElement>(null);
  const glowIdRef  = useRef(`dotfield-glow-${Math.random().toString(36).slice(2)}`);
  const dotsRef    = useRef<Dot[]>([]);
  const mouseRef   = useRef({ x: -9999, y: -9999, active: false });
  const animIdRef  = useRef<number>(0);
  const rebuildRef = useRef<() => void>();
  const timeRef    = useRef(0);

  // Draw loop reads current prop values from a ref so it doesn't have to
  // re-attach event listeners every time a slider value changes.
  const propsRef = useRef({
    dotRadius, cursorRadius, cursorForce, bulgeOnly, bulgeStrength,
    waveAmplitude, sparkle, gradientFrom, gradientTo,
  });
  useEffect(() => {
    propsRef.current = {
      dotRadius, cursorRadius, cursorForce, bulgeOnly, bulgeStrength,
      waveAmplitude, sparkle, gradientFrom, gradientTo,
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const buildGrid = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const cols = Math.ceil(canvas.width  / dotSpacing) + 1;
      const rows = Math.ceil(canvas.height / dotSpacing) + 1;
      const dots: Dot[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * dotSpacing;
          const y = row * dotSpacing;
          const t = canvas.width > 0 ? x / canvas.width : 0;
          dots.push({
            baseX: x,
            baseY: y,
            x,
            y,
            color: lerpColor(propsRef.current.gradientFrom, propsRef.current.gradientTo, t),
            sparklePhase: Math.random() * Math.PI * 2,
            sparkleSpeed: 0.5 + Math.random() * 1.5,
          });
        }
      }
      dotsRef.current = dots;
    };

    buildGrid();
    rebuildRef.current = buildGrid;

    const handleResize = () => buildGrid();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      mouseRef.current = { x, y, active: inside };

      const glow = glowRef.current;
      if (glow) {
        glow.setAttribute('cx', String(x));
        glow.setAttribute('cy', String(y));
        glow.style.opacity = inside ? '0.9' : '0';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      const {
        dotRadius, cursorRadius, cursorForce, bulgeOnly,
        bulgeStrength, waveAmplitude, sparkle,
      } = propsRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my, active } = mouseRef.current;
      timeRef.current += 0.016;

      for (const dot of dotsRef.current) {
        let targetX = dot.baseX;
        let targetY = dot.baseY;
        let radius  = dotRadius;

        // Idle wave motion — only runs when bulgeOnly is off and amplitude > 0
        if (!bulgeOnly && waveAmplitude > 0) {
          targetY += Math.sin(timeRef.current + dot.baseX * 0.05) * waveAmplitude;
          targetX += Math.cos(timeRef.current + dot.baseY * 0.05) * waveAmplitude * 0.5;
        }

        // Cursor-driven bulge
        if (active) {
          const dx = dot.baseX - mx;
          const dy = dot.baseY - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cursorRadius && dist > 0.01) {
            const factor = 1 - dist / cursorRadius;
            targetX += (dx / dist) * factor * bulgeStrength;
            targetY += (dy / dist) * factor * bulgeStrength;
            radius  = dotRadius * (1 + factor * 0.9);
          }
        }

        // cursorForce is the per-frame easing rate — how "stiffly" a dot
        // chases its target. Low = floaty, high = snappy.
        dot.x += (targetX - dot.x) * cursorForce;
        dot.y += (targetY - dot.y) * cursorForce;

        let alpha = 1;
        if (sparkle) {
          const s = Math.sin(timeRef.current * dot.sparkleSpeed + dot.sparklePhase);
          alpha = 0.5 + 0.5 * s;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = dot.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animIdRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dotSpacing]);

  // Rebuild grid when colors/theme or dot sizing change
  useEffect(() => {
    rebuildRef.current?.();
  }, [gradientFrom, gradientTo, dotRadius, dotSpacing]);

  return (
    <div ref={ref} className={`dot-field-container ${className ?? ''}`} {...rest}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <svg
        ref={svgRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <defs>
          <radialGradient id={glowIdRef.current}>
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle
          ref={glowRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill={`url(#${glowIdRef.current})`}
          style={{ opacity: 0, willChange: 'opacity', transition: 'opacity 0.3s ease' }}
        />
      </svg>
    </div>
  );
});

DotField.displayName = 'DotField';

export default DotField;