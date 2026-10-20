import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface HelpTooltipProps {
  content: React.ReactNode;
  title?: string;
  className?: string;
  iconClassName?: string;
  variant?: 'help' | 'info';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  className = '',
  iconClassName = 'w-3.5 h-3.5 text-slate-400 hover:text-cyan-400',
  variant = 'help',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const IconComponent = variant === 'info' ? Info : HelpCircle;

  return (
    <div className={`relative inline-flex items-center align-middle ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-0.5 rounded-full hover:bg-slate-800/60 transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        aria-label={title || 'En savoir plus'}
      >
        <IconComponent className={`${iconClassName} transition-colors`} />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 p-3 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl text-xs text-slate-200 pointer-events-none animate-fade-in text-left font-normal leading-relaxed"
        >
          {title && (
            <div className="font-semibold text-white text-[12px] mb-1 pb-1 border-b border-slate-800 flex items-center gap-1.5 text-cyan-300">
              <IconComponent className="w-3.5 h-3.5" />
              <span>{title}</span>
            </div>
          )}
          <div className="text-[11px] text-slate-300">{content}</div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700" />
        </div>
      )}
    </div>
  );
};
