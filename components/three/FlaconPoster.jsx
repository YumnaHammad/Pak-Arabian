'use client';
import { useId } from 'react';
import { juiceFor } from './juice';
import { cn } from '@/lib/utils';

/**
 * The non-WebGL flacon.
 *
 * Drawn as SVG with layered gradients and specular highlights so it holds its
 * own next to the rendered version. Shown on reduced-motion, on devices without
 * WebGL, and on very constrained hardware. No animation, no canvas, no cost.
 */
export default function FlaconPoster({ category = 'signature', className = '' }) {
  const uid = useId().replace(/:/g, '');
  const juice = juiceFor(category);

  return (
    <div className={cn('flex h-full w-full items-center justify-center', className)}>
      <svg
        viewBox="0 0 260 420"
        className="h-full max-h-[68vh] w-auto"
        role="img"
        aria-label="Azwah eau de parfum flacon"
      >
        <defs>
          {/* Glass body: bright edges, darker centre — reads as curvature */}
          <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F4F1EA" stopOpacity="0.30" />
            <stop offset="16%" stopColor="#FFFFFF" stopOpacity="0.62" />
            <stop offset="42%" stopColor="#C8CBC8" stopOpacity="0.14" />
            <stop offset="72%" stopColor="#FFFFFF" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#8E938E" stopOpacity="0.22" />
          </linearGradient>

          <linearGradient id={`juice-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={juice} stopOpacity="0.72" />
            <stop offset="30%" stopColor={juice} stopOpacity="0.95" />
            <stop offset="62%" stopColor={juice} stopOpacity="0.78" />
            <stop offset="100%" stopColor="#2A1A08" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0%" stopColor="#8C6B2F" />
            <stop offset="22%" stopColor="#C9A227" />
            <stop offset="46%" stopColor="#E9DCB4" />
            <stop offset="70%" stopColor="#C9A227" />
            <stop offset="100%" stopColor="#7A5C28" />
          </linearGradient>

          <radialGradient id={`halo-${uid}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#C9A227" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#C9A227" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`shadow-${uid}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* The flacon silhouette, reused as a clip for the juice */}
          <clipPath id={`body-${uid}`}>
            <path d="M74 168 Q74 152 86 142 L104 126 Q110 120 110 112 L110 92 L150 92 L150 112 Q150 120 156 126 L174 142 Q186 152 186 168 L186 352 Q186 366 172 366 L88 366 Q74 366 74 352 Z" />
          </clipPath>
        </defs>

        {/* Ambient halo */}
        <ellipse cx="130" cy="230" rx="128" ry="150" fill={`url(#halo-${uid})`} />

        {/* Cast shadow */}
        <ellipse cx="130" cy="374" rx="86" ry="15" fill={`url(#shadow-${uid})`} />

        {/* Juice, clipped to the body, filled to the shoulder line */}
        <g clipPath={`url(#body-${uid})`}>
          <rect x="70" y="196" width="120" height="176" fill={`url(#juice-${uid})`} />
          {/* Meniscus */}
          <rect x="70" y="196" width="120" height="2.5" fill="#E9DCB4" opacity="0.34" />
        </g>

        {/* Glass shell */}
        <path
          d="M74 168 Q74 152 86 142 L104 126 Q110 120 110 112 L110 92 L150 92 L150 112 Q150 120 156 126 L174 142 Q186 152 186 168 L186 352 Q186 366 172 366 L88 366 Q74 366 74 352 Z"
          fill={`url(#glass-${uid})`}
          stroke="#E9DCB4"
          strokeOpacity="0.32"
          strokeWidth="1"
        />

        {/* Specular strips */}
        <rect x="86" y="176" width="7" height="172" rx="3.5" fill="#FFFFFF" opacity="0.3" />
        <rect x="99" y="188" width="3" height="140" rx="1.5" fill="#FFFFFF" opacity="0.16" />
        <rect x="168" y="182" width="4" height="150" rx="2" fill="#FFFFFF" opacity="0.12" />

        {/* Neck */}
        <rect x="110" y="86" width="40" height="26" fill={`url(#glass-${uid})`} stroke="#E9DCB4" strokeOpacity="0.28" />

        {/* Collar */}
        <rect x="106" y="74" width="48" height="16" rx="2" fill={`url(#gold-${uid})`} />
        <rect x="106" y="81" width="48" height="1.4" fill="#3A2C12" opacity="0.45" />

        {/* Stopper */}
        <path d="M110 74 L110 44 Q110 34 122 32 L138 32 Q150 34 150 44 L150 74 Z" fill={`url(#gold-${uid})`} />
        <ellipse cx="130" cy="33" rx="20" ry="5" fill="#E9DCB4" opacity="0.8" />

        {/* Label */}
        <rect
          x="96" y="222" width="68" height="80"
          fill="none" stroke="#E9DCB4" strokeOpacity="0.5" strokeWidth="0.9"
        />
        <text
          x="130" y="256"
          textAnchor="middle"
          fill="#F0E8D0"
          fillOpacity="0.92"
          style={{ fontFamily: 'Georgia, serif', fontSize: 19, letterSpacing: 1.5 }}
        >
          AZWAH
        </text>
        <line x1="112" y1="266" x2="148" y2="266" stroke="#E9DCB4" strokeOpacity="0.45" strokeWidth="0.8" />
        <text
          x="130" y="282"
          textAnchor="middle"
          fill="#E9DCB4"
          fillOpacity="0.7"
          style={{ fontFamily: 'Georgia, serif', fontSize: 7, letterSpacing: 2.4 }}
        >
          EAU DE PARFUM
        </text>
      </svg>
    </div>
  );
}
