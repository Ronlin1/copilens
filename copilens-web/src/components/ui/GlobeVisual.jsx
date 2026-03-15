import { motion } from 'framer-motion';

const LAT_LINES = [-60, -40, -20, 0, 20, 40, 60];
const LON_LINES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const R = 240; // radius
const CX = 300; // center x
const CY = 300; // center y

export function GlobeVisual() {
  return (
    // Absolutely positioned, centered, large — bottom half visible above dashboard
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[-180px] md:bottom-[-220px] w-[600px] h-[600px] md:w-[900px] md:h-[900px] pointer-events-none z-0">
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="gGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%"   stopColor="#9333ea" stopOpacity="0.9" />
            <stop offset="40%"  stopColor="#6366f1" stopOpacity="0.7" />
            <stop offset="80%"  stopColor="#1e1b4b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0f0a1e" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="gShine" cx="32%" cy="28%" r="38%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <clipPath id="gClip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
          <filter id="gGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer glow ring */}
        <circle cx={CX} cy={CY} r={R + 8} fill="none" stroke="#7c3aed" strokeOpacity="0.25" strokeWidth="16" />

        {/* Base sphere */}
        <circle cx={CX} cy={CY} r={R} fill="url(#gGrad)" />

        {/* Grid lines */}
        <g clipPath="url(#gClip)" fill="none" stroke="#a78bfa" strokeOpacity="0.25" strokeWidth="1">
          {LAT_LINES.map((lat) => {
            const ry = Math.abs(Math.cos((lat * Math.PI) / 180) * R);
            const cy = CY + Math.sin((lat * Math.PI) / 180) * R;
            return <ellipse key={`lat-${lat}`} cx={CX} cy={cy} rx={R} ry={ry * 0.28} />;
          })}
          {LON_LINES.map((lon) => {
            const angle = (lon * Math.PI) / 180;
            const rx = Math.max(Math.abs(Math.cos(angle)) * R, 4);
            return (
              <ellipse key={`lon-${lon}`} cx={CX} cy={CY} rx={rx} ry={R} transform={`rotate(${lon} ${CX} ${CY})`} />
            );
          })}
        </g>

        {/* Shine */}
        <circle cx={CX} cy={CY} r={R} fill="url(#gShine)" />

        {/* Edge ring */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#7c3aed" strokeOpacity="0.6" strokeWidth="1.5" />

        {/* Pulsing location dots */}
        {[
          { cx: 240, cy: 260 }, { cx: 340, cy: 230 }, { cx: 390, cy: 300 },
          { cx: 260, cy: 330 }, { cx: 310, cy: 370 }, { cx: 200, cy: 310 },
        ].map((p, i) => (
          <motion.circle
            key={i} cx={p.cx} cy={p.cy} r="4"
            fill="#c4b5fd"
            filter="url(#gGlow)"
            animate={{ opacity: [0.2, 1, 0.2], r: [3, 5, 3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.45 }}
          />
        ))}

        {/* Orbiting dot */}
        <motion.circle
          r="5" fill="#06b6d4" filter="url(#gGlow)"
          animate={{
            cx: [CX + R + 8, CX, CX - R - 8, CX, CX + R + 8],
            cy: [CY,         CY - 40, CY,      CY + 40, CY],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

      {/* Fade bottom half into page */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-slate-900 via-slate-900/80 to-transparent" />
    </div>
  );
}
