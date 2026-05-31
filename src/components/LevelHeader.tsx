interface LevelHeaderProps {
  title: string;
  className?: string;
}

/** Shared level title bar — no level-number badge. */
export function LevelHeader({ title, className = '' }: LevelHeaderProps) {
  return (
    <div className={`border-b border-stone-800 pb-3 ${className}`}>
      <h3 className="text-2xl font-serif italic text-stone-100 tracking-wide">{title}</h3>
    </div>
  );
}
