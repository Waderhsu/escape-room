import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Compass, MapPin, TriangleAlert } from 'lucide-react';
import { audioEngine } from './AudioEngine';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface MapOverlayProps {
  onSuccess: () => void;
}

const STAR_MAP = LEVEL_IMAGES.starMap;
const HINT_MAP = LEVEL_IMAGES.hintMap;

/** Target rotation angle for star alignment. */
const TARGET_ANGLE = 64;
const TOLERANCE = 4;
const INITIAL_ANGLE = 185;

/** Hint map A/B/C/D marker positions (percent). */
const HINT_MARKERS: { label: string; x: number; y: number }[] = [
  { label: 'A', x: 74, y: 23 },
  { label: 'B', x: 47, y: 33 },
  { label: 'C', x: 36, y: 61 },
  { label: 'D', x: 49.5, y: 58 },
];

/** Fixed tablet star positions (percent): 2 top, 4 bottom. */
const TABLET_STARS: [number, number][] = [
  [63, 47], [75, 63],
  [31.5, 40], [44, 57], [55.5, 73], [68, 89],
];

function normalizeAngle(deg: number) {
  return ((deg % 360) + 360) % 360;
}

function angularDistance(a: number, b: number) {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 360 - diff);
}

function pointerAngle(clientX: number, clientY: number, rect: DOMRect) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return normalizeAngle(Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI));
}

export function MapOverlay({ onSuccess }: MapOverlayProps) {
  const [angle, setAngle] = useState(INITIAL_ANGLE);
  const [aligned, setAligned] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loc1, setLoc1] = useState('');
  const [loc2, setLoc2] = useState('');
  const [loc3, setLoc3] = useState('');
  const [loc4, setLoc4] = useState('');
  const [error, setError] = useState('');

  const dragRef = useRef<{ lastPointerAngle: number } | null>(null);

  useEffect(() => {
    if (aligned || isDragging) return;
    if (angularDistance(angle, TARGET_ANGLE) <= TOLERANCE) {
      setAligned(true);
      setAngle(TARGET_ANGLE);
      audioEngine.playBeep(880, 0.1);
      audioEngine.playBeep(1100, 0.15);
      audioEngine.playBeep(1400, 0.3);
    }
  }, [angle, aligned, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (aligned) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = { lastPointerAngle: pointerAngle(e.clientX, e.clientY, rect) };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || aligned || !isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentPointer = pointerAngle(e.clientX, e.clientY, rect);
    let delta = currentPointer - dragRef.current.lastPointerAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    setAngle((prev) => {
      const next = normalizeAngle(prev + delta);
      const prevRounded = Math.round(prev);
      const nextRounded = Math.round(next);
      if (nextRounded % 15 === 0 && prevRounded !== nextRounded) {
        audioEngine.playBeep(300 + nextRounded / 2, 0.02, 'sine');
      }
      return next;
    });
    dragRef.current.lastPointerAngle = currentPointer;
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!isDragging) return;
    dragRef.current = null;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = loc1.trim();
    const b = loc2.trim();
    const c = loc3.trim();
    const d = loc4.trim();
    const ok1 = a === '宿舍';
    const ok2 = b === '體育館';
    const ok3 = c === '小學樓';
    const ok4 = d === '藝文館';
    if (ok1 && ok2 && ok3 && ok4) {
      audioEngine.playSuccessGain();
      onSuccess();
    } else {
      audioEngine.playBeep(220, 0.45, 'triangle');
      setError(`❌ 有地標名稱填寫錯誤！`);
      setTimeout(() => setError(''), 3500);
    }
  };

  return (
    <div className="space-y-5">
      <LevelHeader title="星芒的指引 — 疊合的真相" />

      <p className="text-stone-300 text-sm leading-relaxed">
        平板定格為六顆星芒，手邊的紙地圖上也印著星星。將紙地圖疊加在螢幕上並旋轉，直到兩者星標重合，剩下的線索就會浮現。
      </p>

      <div className="flex flex-col items-center gap-3">
        <span className="text-xs text-stone-400 text-center">
          {aligned ? '🟢 星標已重合 — 提示圖已解鎖' : '🎯 拖曳旋轉紙地圖，對齊平板上的星芒'}
        </span>

        {aligned ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative w-full"
          >
            <img
              src={HINT_MAP}
              alt="星芒提示地圖"
              draggable={false}
              className="w-full rounded-xl border border-stone-800 shadow-2xl"
            />
            <div className="absolute inset-0 pointer-events-none">
              {HINT_MARKERS.map(({ label, x, y }) => (
                <span
                  key={label}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-normal text-stone-950 border-1 border-white shadow-none"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
              className="relative w-full max-w-[min(560px,85vw)] aspect-square rounded-full border-4 border-stone-800 overflow-hidden shadow-2xl touch-none select-none bg-[#070b10] cursor-grab active:cursor-grabbing"
            >
              <div className="absolute inset-0">
                <div className="absolute inset-0 pointer-events-none z-10">
                  {TABLET_STARS.map(([x, y], i) => (
                    <span
                      key={`bg-${i}`}
                      className="absolute text-xl -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                <motion.div
                  animate={{ rotate: angle }}
                  transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 24, stiffness: 200 }}
                  className="absolute inset-0 origin-center scale-120"
                >
                  <img
                    src={STAR_MAP}
                    alt="校園紙地圖"
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-contain opacity-[0.48]"
                  />
                </motion.div>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 font-mono">
              旋轉角度 {Math.round(angle)}°
            </p>
          </>
        )}
      </div>

      <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 max-w-xl mx-auto w-full">
        <h4 className="text-sm font-bold text-stone-200 flex items-center gap-1.5 border-b border-stone-800 pb-2">
          <MapPin className="h-4 w-4 text-amber-500" />
          解鎖秘密地點
        </h4>

        {aligned ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs text-stone-400">依提示圖上的 A、B、C、D 標記，輸入四個地點全名：</p>
            {[
              { label: 'A', value: loc1, set: setLoc1 },
              { label: 'B', value: loc2, set: setLoc2 },
              { label: 'C', value: loc3, set: setLoc3 },
              { label: 'D', value: loc4, set: setLoc4 },
            ].map((field) => (
              <div key={field.label} className="space-y-1">
                <span className="text-[11px] font-mono text-amber-500">{field.label}</span>
                <input
                  type="text"
                  required
                  placeholder="請輸入地點全名..."
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full border border-stone-800 bg-stone-900 px-3 py-2.5 text-sm text-stone-200 rounded-lg focus:border-amber-500 outline-none"
                />
              </div>
            ))}
            {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              送出答案
            </button>
          </form>
        ) : (
          <div className="py-8 text-center text-stone-500 text-xs border border-dashed border-stone-800 rounded-xl">
            <Compass className="h-6 w-6 mx-auto text-stone-600 mb-2" />
            <TriangleAlert className="h-4 w-4 inline text-amber-500 mr-1" />
            請先旋轉紙地圖，讓星標與平板重合
          </div>
        )}
      </div>
    </div>
  );
}
