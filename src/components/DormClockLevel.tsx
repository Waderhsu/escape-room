import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Clock } from 'lucide-react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface DormClockLevelProps {
  onSuccess: () => void;
}

type Direction = 'DOWN' | 'UP' | 'RIGHT' | 'LEFT';

const CORRECT: Direction[] = ['DOWN', 'UP', 'RIGHT', 'LEFT'];

export function DormClockLevel({ onSuccess }: DormClockLevelProps) {
  const [sequence, setSequence] = useState<Direction[]>([]);
  const [error, setError] = useState('');

  const addDirection = (dir: Direction) => {
    audioEngine.playBeep(520, 0.1);
    setError('');
    const next = [...sequence, dir];
    if (next.length <= 4) {
      setSequence(next);
      if (next.length === 4) {
        const ok = CORRECT.every((d, i) => d === next[i]);
        if (ok) {
          audioEngine.playBeep(987, 0.1);
          audioEngine.playBeep(1318, 0.35);
          setTimeout(onSuccess, 1000);
        } else {
          audioEngine.playBeep(220, 0.4);
          setError('❌ 方向鎖孔發出冰冷的警告音：順序不吻合，解鎖失敗！');
          setSequence([]);
        }
      }
    }
  };

  const reset = () => {
    audioEngine.playBeep(300, 0.1);
    setSequence([]);
    setError('');
  };

  const icon = (dir: Direction) => {
    const cls = 'h-5 w-5 text-amber-400';
    switch (dir) {
      case 'UP': return <ArrowUp className={cls} />;
      case 'DOWN': return <ArrowDown className={cls} />;
      case 'LEFT': return <ArrowLeft className={cls} />;
      case 'RIGHT': return <ArrowRight className={cls} />;
    }
  };

  const bigIcon = (dir: Direction) => {
    const cls = 'h-6 w-6 text-amber-500';
    switch (dir) {
      case 'UP': return <ArrowUp className={cls} />;
      case 'DOWN': return <ArrowDown className={cls} />;
      case 'LEFT': return <ArrowLeft className={cls} />;
      case 'RIGHT': return <ArrowRight className={cls} />;
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="宿舍大門 — 那些奮鬥的日子" />

      <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl text-stone-300 text-[15px] space-y-2 leading-relaxed">
        <p className="font-bold border-b border-stone-800 pb-1.5 flex items-center gap-1.5 text-stone-200 not-italic">
          <Clock className="h-4 w-4 text-sky-400" /> OS 內心獨白
        </p>
        <p>一路狂奔來到宿舍，你卻發現大門緊閉。是啊，會考剛考完，大家都回家了。站在熟悉的門前，你突然想起會考前那段奮鬥的日子：</p>
        <p>
          每天清晨 <b>6:00</b> 痛苦地揉著眼睛起床；中午 <b>12:00</b> 剛吃飽好睏還要打起精神；下午 <b>15:00（3點）</b> 靠著意志力撐過最想睡的午後；直到晚上 <b>21:00（9點）</b> 梳洗後開始夜自習，才拖著疲憊的身體走回這扇門前。
        </p>
      </div>

      <blockquote className="border-l-2 border-amber-600/50 pl-4 py-2 bg-amber-950/10 rounded-r text-sm text-amber-200/90 italic">
        「九年級的每一天，時間總推著我們往固定的方向前進。回憶你最深刻的四個時刻，時針的指向將帶你回家。」
      </blockquote>

      <ImagePlaceholder
        src={LEVEL_IMAGES.dormGate}
        alt="宿舍大門"
        className="max-w-md mx-auto"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-950/40 p-6 rounded-2xl border border-slate-800/60 shadow-xl">
        <div className="flex flex-col items-center justify-center p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest leading-none">ENTERED LOCK SEQUENCE</span>
          <div className="flex gap-4 items-center justify-center min-h-[50px] w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${sequence[i] ? 'bg-slate-950 border-amber-500 shadow-md shadow-amber-500/20' : 'bg-slate-950/50 border-slate-800'}`}>
                {sequence[i] ? icon(sequence[i]) : <span className="text-slate-700 font-mono">?</span>}
              </div>
            ))}
          </div>
          <button type="button" onClick={reset} disabled={sequence.length === 0} className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] rounded transition disabled:opacity-50">
            重置方向
          </button>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative w-max p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <div className="grid grid-cols-3 gap-3">
              <div />
              <button type="button" onClick={() => addDirection('UP')} className="w-14 h-14 bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-2xl flex items-center justify-center shadow transition-all hover:border-amber-500/50">{bigIcon('UP')}</button>
              <div />
              <button type="button" onClick={() => addDirection('LEFT')} className="w-14 h-14 bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-2xl flex items-center justify-center shadow transition-all hover:border-amber-500/50">{bigIcon('LEFT')}</button>
              <div className="w-14 h-14 flex items-center justify-center text-slate-600 font-mono text-[10px] select-none text-center">DORM<br />CODE</div>
              <button type="button" onClick={() => addDirection('RIGHT')} className="w-14 h-14 bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-2xl flex items-center justify-center shadow transition-all hover:border-amber-500/50">{bigIcon('RIGHT')}</button>
              <div />
              <button type="button" onClick={() => addDirection('DOWN')} className="w-14 h-14 bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-2xl flex items-center justify-center shadow transition-all hover:border-amber-500/50">{bigIcon('DOWN')}</button>
              <div />
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
