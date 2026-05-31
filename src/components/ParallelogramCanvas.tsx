import { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CircleCheck, RotateCcw } from 'lucide-react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface ParallelogramCanvasProps {
  onSuccess: () => void;
}

type StageConfig = {
  sliderRail: 'top' | 'bottom' | 'none';
  targetX: number;
  description: string;
};

const TOP_Y = 30;
const BOTTOM_Y = 70;
const P1 = { x: 35, y: TOP_Y };
const P2 = { x: 60, y: BOTTOM_Y };
const P3 = { x: 85, y: BOTTOM_Y };
const P4 = { x: 60, y: TOP_Y };
const P5 = { x: 35, y: BOTTOM_Y };
const P6 = { x: 10, y: BOTTOM_Y };

function getStageConfig(stage: number): StageConfig {
  switch (stage) {
    case 1:
      return {
        sliderRail: 'top',
        targetX: 60,
        description: '在上方黑線移動紅點，完成圖形。',
      };
    case 2:
      return {
        sliderRail: 'bottom',
        targetX: 35,
        description: '在下方黑線移動紅點，完成圖形。',
      };
    case 3:
      return {
        sliderRail: 'bottom',
        targetX: 10,
        description: '最後一步：在下方黑線移動紅點，完成第三個圖形。',
      };
    default:
      return { sliderRail: 'none', targetX: -999, description: '恭喜！解鎖成功！解開平板上的「完美六星圖騰」。',};
  }
}

export function ParallelogramCanvas({ onSuccess }: ParallelogramCanvasProps) {
  const [stage, setStage] = useState(1);
  const [sliderX, setSliderX] = useState(50);
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const config = getStageConfig(stage);

  useEffect(() => {
    if (stage === 4) {
      const t = setTimeout(onSuccess, 3500);
      return () => clearTimeout(t);
    }
  }, [stage, onSuccess]);

  const reset = () => {
    audioEngine.playBeep(400, 0.1);
    setStage(1);
    setSliderX(50);
  };

  const updateSlider = (clientX: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    const snapped = Math.max(5, Math.min(95, Math.round(pct / 5) * 5));
    if (snapped !== sliderX) {
      setSliderX(snapped);
      audioEngine.playBeep(350 + snapped * 2, 0.03, 'sine');
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (stage >= 4) return;
    setDragging(true);
    updateSlider(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || stage >= 4) return;
    updateSlider(e.clientX);
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (sliderX === config.targetX) {
      audioEngine.playSuccessGain();
      if (stage === 1) {
        setStage(2);
        setSliderX(50);
      } else if (stage === 2) {
        setStage(3);
        setSliderX(50);
      } else if (stage === 3) {
        setStage(4);
      }
    } else {
      audioEngine.playBeep(180, 0.25);
    }
  };

  const blueDots =
    stage === 1
      ? [P1, P2, P3]
      : stage === 2
        ? [P1, P4, P2]
        : stage === 3
          ? [P1, P4, P5]
          : [];

  const sliderY = config.sliderRail === 'top' ? TOP_Y : BOTTOM_Y;
  const slider = { x: sliderX, y: sliderY };

  const renderLines = () => {
    if (stage >= 4) return null;
    if (stage === 1) {
      return (
        <Fragment>
          <line x1={`${P1.x}%`} y1={`${P1.y}%`} x2={`${slider.x}%`} y2={`${slider.y}%`} stroke="rgba(244,63,94,0.75)" strokeWidth="3" strokeDasharray="5 4" />
          <line x1={`${slider.x}%`} y1={`${slider.y}%`} x2={`${P3.x}%`} y2={`${P3.y}%`} stroke="rgba(244,63,94,0.75)" strokeWidth="3" strokeDasharray="5 4" />
          <line x1={`${P3.x}%`} y1={`${P3.y}%`} x2={`${P2.x}%`} y2={`${P2.y}%`} stroke="rgba(14,165,233,0.5)" strokeWidth="3" />
          <line x1={`${P2.x}%`} y1={`${P2.y}%`} x2={`${P1.x}%`} y2={`${P1.y}%`} stroke="rgba(14,165,233,0.5)" strokeWidth="3" />
        </Fragment>
      );
    }
    if (stage === 2) {
      return (
        <Fragment>
          <line x1={`${P1.x}%`} y1={`${P1.y}%`} x2={`${P4.x}%`} y2={`${P4.y}%`} stroke="rgba(14,165,233,0.5)" strokeWidth="3" />
          <line x1={`${P4.x}%`} y1={`${P4.y}%`} x2={`${P2.x}%`} y2={`${P2.y}%`} stroke="rgba(14,165,233,0.5)" strokeWidth="3" />
          <line x1={`${P2.x}%`} y1={`${P2.y}%`} x2={`${slider.x}%`} y2={`${slider.y}%`} stroke="rgba(244,63,94,0.75)" strokeWidth="3" strokeDasharray="5 4" />
          <line x1={`${slider.x}%`} y1={`${slider.y}%`} x2={`${P1.x}%`} y2={`${P1.y}%`} stroke="rgba(244,63,94,0.75)" strokeWidth="3" strokeDasharray="5 4" />
        </Fragment>
      );
    }
    return (
      <Fragment>
        <line x1={`${P1.x}%`} y1={`${P1.y}%`} x2={`${P4.x}%`} y2={`${P4.y}%`} stroke="rgba(14,165,233,0.5)" strokeWidth="3" />
        <line x1={`${P4.x}%`} y1={`${P4.y}%`} x2={`${P5.x}%`} y2={`${P5.y}%`} stroke="rgba(14,165,233,0.5)" strokeWidth="3" />
        <line x1={`${P5.x}%`} y1={`${P5.y}%`} x2={`${slider.x}%`} y2={`${slider.y}%`} stroke="rgba(244,63,94,0.75)" strokeWidth="3" strokeDasharray="5 4" />
        <line x1={`${slider.x}%`} y1={`${slider.y}%`} x2={`${P1.x}%`} y2={`${P1.y}%`} stroke="rgba(244,63,94,0.75)" strokeWidth="3" strokeDasharray="5 4" />
      </Fragment>
    );
  };

  const ticks = [];
  for (let i = 5; i <= 95; i += 5) ticks.push(i);

  return (
    <div className="space-y-6">
      <LevelHeader title="嫌犯的平板 — 拼湊完美的圖騰" />

      <div className="bg-[#1c1917]/25 border border-stone-850 p-4.5 rounded-2xl text-stone-300 space-y-3 text-base leading-relaxed">
        <p>打開保險箱後，裡面沒有原本期待的畢業驚喜，只有一個牛皮紙信封。裡面有一張縮小版校園平面圖，以及一台畫面鎖定的平板，平板螢幕上閃爍著解鎖提示：「完美的平衡，建立在相對的彼端長度如出一轍。」</p>
        <p className="border-l-2 border-red-600/50 pl-3 py-1 bg-red-950/10 rounded text-red-300 font-serif italic text-sm">
          信封上用紅筆寫著：「我是世界上最完美的人哈哈哈，你們是找不到我的！我將線索留在了校園的四個角落。只有解鎖平板找到線索，通往終點的大門才會為你們敞開。」
        </p>
      </div>

      <ImagePlaceholder
        src={LEVEL_IMAGES.tabletEnvelope}
        alt="嫌犯信封與平板"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950/60 p-3 rounded-xl border border-stone-900">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-stone-500">解鎖階段</span>
          <span className="text-[#22c55e] font-extrabold bg-[#22c55e]/10 px-2.5 py-1 rounded border border-[#22c55e]/30">
            {stage === 4 ? '完成' : `${stage} / 3`}
          </span>
        </div>
        <div className="flex gap-2 ml-auto">
          <button type="button" onClick={reset} disabled={stage === 4} className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-30 border border-stone-800 text-xs text-stone-300 font-bold rounded flex items-center gap-1 transition">
            <RotateCcw className="h-3.5 w-3.5" />
            重置
          </button>
        </div>
      </div>

      <div className="bg-stone-900/40 border border-stone-850/60 p-4 rounded-xl text-center">
        <p className="text-sm font-semibold text-stone-200">{config.description}</p>
      </div>

      <div className="flex justify-center">
        <div
          ref={canvasRef}
          onPointerDown={stage < 4 ? handlePointerDown : undefined}
          onPointerMove={stage < 4 ? handlePointerMove : undefined}
          onPointerUp={stage < 4 ? handlePointerUp : undefined}
          className="w-full max-w-[500px] aspect-[16/10] bg-[#0c0a09] border-[6px] border-[#292524] rounded-2xl relative shadow-2xl select-none overflow-hidden touch-none"
        >
          {ticks.map((t) => (
            <div key={t} className="absolute top-0 bottom-0 border-l border-stone-900/45 pointer-events-none" style={{ left: `${t}%` }} />
          ))}

          {stage < 4 && (
            <>
              <div className={`absolute left-0 right-0 h-1.5 border-y ${config.sliderRail === 'top' ? 'bg-stone-900 border-rose-500/20' : 'bg-stone-950 border-stone-900'}`} style={{ top: `${TOP_Y}%`, transform: 'translateY(-50%)' }} />
              <div className={`absolute left-0 right-0 h-1.5 border-y ${config.sliderRail === 'bottom' ? 'bg-stone-900 border-rose-500/20' : 'bg-stone-950 border-stone-900'}`} style={{ top: `${BOTTOM_Y}%`, transform: 'translateY(-50%)' }} />
            </>
          )}

          {stage < 4 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              {renderLines()}
            </svg>
          )}

          {stage < 4 &&
            blueDots.map((dot, i) => (
              <div key={i} className="absolute w-5 h-5 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-sky-500/40 pointer-events-none z-10" style={{ left: `${dot.x}%`, top: `${dot.y}%` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>
            ))}

          {stage < 4 && (
            <motion.div
              layoutId="peach-slider-knob"
              className="absolute w-7 h-7 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-20 shadow-xl cursor-ew-resize shadow-rose-600/50"
              style={{ left: `${sliderX}%`, top: `${sliderY}%` }}
              animate={{ scale: dragging ? 1.25 : 1 }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute" />
              <div className="w-1.5 h-1.5 bg-sky-100 rounded-full" />
            </motion.div>
          )}

          <AnimatePresence>
            {stage === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="grid grid-cols-3 gap-6">
                {[P1, P2, P3, P4, P5, P6].map((dot, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.12, type: 'spring' }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                  >
                    <span className="text-3xl text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse">⭐</span>
                  </motion.div>
                ))}
                </div>
                <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="space-y-1">
                  <p className="text-[#22c55e] font-bold text-lg flex items-center justify-center gap-1.5">
                    <CircleCheck className="h-5 w-5" /> 完美六星圖騰拼湊成功！
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono">TABLET COMPATIBLE_LOCK UNLOCKED</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
