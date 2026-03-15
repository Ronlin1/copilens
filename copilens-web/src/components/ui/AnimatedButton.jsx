import { cn } from '../../utils/cn';

export function AnimatedButton({
  className,
  label = 'Analyze',
  labelActive = 'Analyzing',
  active = false,
  hue = 210,
  onClick,
  type = 'button',
  disabled = false,
  icon: Icon,
}) {
  return (
    <div className={cn('relative inline-block', className)}>
      <button
        type={type}
        aria-label={active ? labelActive : label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className="ui-anim-btn relative flex items-center justify-center cursor-pointer select-none rounded-3xl px-6 py-3 border border-white/20 transition-all duration-400"
        style={{ '--highlight-hue': `${hue}deg` }}
      >
        {Icon && (
          <Icon className="ui-anim-btn-svg mr-2 h-5 w-5 flex-shrink-0 text-white/80" />
        )}
        <div className="ui-anim-txt-wrapper relative flex items-center">
          <div className={cn('ui-anim-txt-1 flex gap-[1px]', active ? 'opacity-0' : 'opacity-100')}>
            {Array.from(label).map((ch, i) => (
              <span key={i} className="ui-anim-letter inline-block">{ch === ' ' ? '\u00A0' : ch}</span>
            ))}
          </div>
          {active && (
            <div className="ui-anim-txt-2 absolute inset-0 flex gap-[1px]">
              {Array.from(labelActive).map((ch, i) => (
                <span key={i} className="ui-anim-letter inline-block">{ch === ' ' ? '\u00A0' : ch}</span>
              ))}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
