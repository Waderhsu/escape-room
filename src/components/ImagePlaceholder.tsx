interface ImagePlaceholderProps {
  src: string;
  alt: string;
  className?: string;
}

/** Scene image with a dashed fallback when the file is missing. */
export function ImagePlaceholder({ src, alt, className = '' }: ImagePlaceholderProps) {
  return (
    <figure className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full rounded-xl border border-stone-800 object-contain bg-stone-950/60 min-h-[140px]"
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = 'none';
          const placeholder = img.nextElementSibling;
          if (placeholder instanceof HTMLElement) placeholder.style.display = 'flex';
        }}
      />
      <div
        className="hidden flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-700 bg-stone-950/80 p-8 text-center min-h-[140px]"
        aria-hidden
      >
        <span className="text-2xl mb-2 opacity-40">🖼️</span>
        <span className="text-xs text-stone-500">場景圖片</span>
      </div>
    </figure>
  );
}
