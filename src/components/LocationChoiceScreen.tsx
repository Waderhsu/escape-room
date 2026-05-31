import { AnimatePresence, motion } from 'motion/react';

/** Clickable hotspot grid over the location-choice image (percent). */
const HOTSPOT = { left: 57, top: 32, width: 28, height: 48 };

const SLOTS = [
  { id: 'gym', place: '體育館' },
  { id: 'primary', place: '小學樓' },
  { id: 'art', place: '藝文館' },
  { id: 'dorm', place: '宿舍' },
] as const;

export type LocationSlot = (typeof SLOTS)[number]['id'];

interface LocationChoiceScreenProps {
  imageSrc: string;
  activeSlots: LocationSlot[];
  onSelect: (place: string) => void;
  error?: string;
  success?: string;
}

export function LocationChoiceScreen({
  imageSrc,
  activeSlots,
  onSelect,
  error,
  success,
}: LocationChoiceScreenProps) {
  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-4xl mx-auto">
        <img
          src={imageSrc}
          alt="選擇下一個地點"
          draggable={false}
          className="w-full rounded-xl border border-stone-800 shadow-2xl"
        />
        <div
          className="absolute grid grid-cols-2 grid-rows-2 gap-[3%]"
          style={{
            left: `${HOTSPOT.left}%`,
            top: `${HOTSPOT.top}%`,
            width: `${HOTSPOT.width}%`,
            height: `${HOTSPOT.height}%`,
          }}
        >
          {SLOTS.map((slot) => {
            const active = activeSlots.includes(slot.id);
            if (!active) return <div key={slot.id} aria-hidden />;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSelect(slot.place)}
                aria-label={slot.place}
                className="rounded-lg bg-transparent hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer touch-manipulation"
              />
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-emerald-400 text-sm font-semibold text-center p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-xl max-w-4xl mx-auto"
          >
            {success}
          </motion.p>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-sm font-semibold text-center p-3 bg-red-950/20 border border-red-500/10 rounded-xl max-w-4xl mx-auto animate-shake"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
