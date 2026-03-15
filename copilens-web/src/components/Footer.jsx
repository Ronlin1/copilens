import { Zap, Github, Globe, Terminal, BarChart3, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const YEAR = new Date().getFullYear();

const STATUS = [
  { label: 'API',             ok: true  },
  { label: 'Analysis Engine', ok: true  },
  { label: 'AI (Groq)',       ok: true  },
  { label: 'Deploy',          ok: false },
];

const QUICK = [
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { to: '/deploy',    icon: Rocket,    label: 'Deploy'    },
  { to: '/cli',       icon: Terminal,  label: 'CLI'       },
  { to: '/about',     icon: Globe,     label: 'About'     },
];

export default function Footer() {
  return (
    <footer className="relative mt-0 border-t border-white/10 bg-slate-900/80 backdrop-blur-sm text-white overflow-hidden">

      {/* subtle brand gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-brand opacity-60" />

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-brand">COPILENS</span>
          </div>
          <p className="text-sm text-white/50 leading-relaxed max-w-xs">
            AI-powered repository intelligence. Understand any codebase in seconds — complexity, AI detection, architecture and deployment, all in one place.
          </p>
          <a
            href="https://github.com/Ronlin1/copilens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>

        {/* Quick nav */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold tracking-widest uppercase text-white/30">Navigate</h4>
          <ul className="space-y-2">
            {QUICK.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
                >
                  <Icon className="w-4 h-4 text-brand-cyan group-hover:text-white transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* System status */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold tracking-widest uppercase text-white/30">System Status</h4>
          <ul className="space-y-2">
            {STATUS.map(({ label, ok }) => (
              <li key={label} className="flex items-center justify-between text-sm">
                <span className="text-white/50">{label}</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${ok ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-yellow-400'} animate-pulse`} />
                  {ok ? 'Operational' : 'Coming soon'}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-white/30">
              Powered by{' '}
              <span className="text-brand-cyan">Llama 3.3</span> via Groq &{' '}
              <span className="text-brand-indigo">GitHub API</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
        <span>© {YEAR} Copilens. Built with React + Vite.</span>
        <span className="text-brand-cyan/60 font-mono">v1.0.0</span>
      </div>
    </footer>
  );
}
