import { FileText, GitCommit, Zap, BarChart3, FileCode } from 'lucide-react';

export function DashboardPreview() {
  const bars = [65, 82, 45, 90, 55, 78, 60, 88, 42, 70, 95, 50];
  const linePoints = [20, 35, 28, 50, 42, 65, 55, 72, 60, 80, 68, 85];

  const polyline = linePoints
    .map((y, i) => `${(i / (linePoints.length - 1)) * 280 + 10},${90 - y * 0.7}`)
    .join(' ');

  return (
    <div className="w-full rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-sm overflow-hidden text-white text-xs">

      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <span className="ml-3 text-white/40 text-[10px] uppercase tracking-wider font-semibold">COPILENS — Repository Analysis</span>
      </div>

      <div className="p-4 grid grid-cols-12 gap-4">

        {/* Sidebar */}
        <div className="col-span-3 space-y-1">
          {[
            { label: 'Overview', icon: BarChart3 },
            { label: 'Commits', icon: GitCommit },
            { label: 'Complexity', icon: Zap },
            { label: 'Files', icon: FileText },
            { label: 'Settings', icon: FileCode },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-medium transition-colors ${i === 0 ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
            >
              <item.icon className={`w-3.5 h-3.5 ${i === 0 ? 'text-white' : 'text-cyan-400/60'}`} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="col-span-9 space-y-4">

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Files', value: '1,284', color: '#06b6d4', icon: FileText },
              { label: 'Commits', value: '3,891', color: '#6366f1', icon: GitCommit },
              { label: 'AI Score', value: '34%', color: '#9333ea', icon: Zap },
              { label: 'Complexity', value: '7.2', color: '#3b82f6', icon: BarChart3 },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <div className="flex items-center gap-1.5 text-[9px] text-white/40 mb-1.5">
                  <Icon className="w-3 h-3 text-cyan-400/40" />
                  {label}
                </div>
                <div className="font-bold text-sm tracking-tight" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-3">

            {/* Bar chart */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[9px] text-white/40 uppercase tracking-wider">Commit Activity</div>
                <GitCommit className="w-3 h-3 text-white/20" />
              </div>
              <svg viewBox="0 0 120 50" className="w-full h-12">
                {bars.map((h, i) => (
                  <rect
                    key={i}
                    x={i * 10 + 1}
                    y={50 - h * 0.45}
                    width="7"
                    height={h * 0.45}
                    rx="1.5"
                    fill={`rgba(99,102,241,${0.4 + (h / 100) * 0.6})`}
                  />
                ))}
              </svg>
            </div>

            {/* Line chart */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[9px] text-white/40 uppercase tracking-wider">Complexity Trend</div>
                <Zap className="w-3 h-3 text-white/20" />
              </div>
              <svg viewBox="0 0 300 90" className="w-full h-12">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* File list */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-2">
            {[
              { name: 'src/core/analyzer.py', score: 92, color: '#9333ea' },
              { name: 'src/api/routes.js', score: 61, color: '#6366f1' },
              { name: 'src/utils/parser.ts', score: 38, color: '#06b6d4' },
            ].map(({ name, score, color }) => (
              <div key={name} className="flex items-center gap-3">
                <FileCode className="w-3 h-3 text-white/30" />
                <span className="text-white/50 text-[9px] flex-1 truncate font-medium">{name}</span>
                <div className="w-20 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
                </div>
                <span className="text-[9px] w-8 text-right font-bold" style={{ color }}>{score}%</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
