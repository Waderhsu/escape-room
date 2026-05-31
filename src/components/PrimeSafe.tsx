import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface PrimeSafeProps {
  onSuccess: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0', '確定'];
const PASSWORD = '71113';

export function PrimeSafe({ onSuccess }: PrimeSafeProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleKey = (key: string) => {
    audioEngine.playBeep(440, 0.08);
    setError('');
    if (key === '清除') setCode('');
    else if (key === '確定') submit();
    else if (code.length < 8) setCode((prev) => prev + key);
  };

  const submit = () => {
    if (code === PASSWORD) {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('❌ 保險箱內部發出沈重的鏈條齒輪卡合卡阻聲！密碼錯誤。');
      audioEngine.playBeep(220, 0.4);
      setCode('');
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="辦公桌上的保險箱 — 是嫌犯嗎？" />

      <p className="text-slate-300 leading-relaxed text-base">
        「喀嗒」！九導辦公室的門終於打開了，裡面一片寂靜。你快步走到導師的辦公桌前，桌上空無一物，只放著一個精緻的小型按鍵式保險箱，面板上印著
        <span className="text-sky-400 font-bold">「Prime Power Only」</span>。密碼鎖旁貼著一張顯眼的黃色便利貼，上面用粗體字寫著一個巨大的數字：
        <span className="text-sky-400 text-2xl font-mono font-black ml-1">1001</span>。
        你心中不禁懷疑：這是導師藏起來的畢業禮物？還是嫌犯故意留下的挑釁？
      </p>

      <blockquote className="border-l-2 border-sky-600/50 pl-4 py-2 bg-sky-950/10 rounded-r text-sm text-sky-200/90 italic">
        「唯有拆解出最原始的靈魂，並按成長的順序排列，才能開啟。」
      </blockquote>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
        <div className="flex justify-center">
          <ImagePlaceholder
            src={LEVEL_IMAGES.safe}
            alt="辦公桌上的保險箱"
            className="w-full max-w-sm mx-auto"
          />
        </div>

        <div className="flex flex-col items-center">
          <div className="p-5 rounded-2xl bg-slate-950/40 border-2 border-slate-700/50 w-full max-w-[280px]">
            <div className="bg-black py-3.5 px-3 rounded-xl border border-slate-800 text-center text-xl font-mono text-emerald-400 font-extrabold tracking-widest min-h-[48px] mb-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
              {code || '---'}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`h-12 rounded-xl flex items-center justify-center font-bold text-sm tracking-wide transition active:scale-95 ${
                    key === '確定'
                      ? 'bg-sky-600 hover:bg-sky-500 text-white font-black text-xs'
                      : key === '清除'
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs'
                        : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-base'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center text-red-400 font-semibold p-3.5 bg-red-950/30 border border-red-500/20 rounded-xl">
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
