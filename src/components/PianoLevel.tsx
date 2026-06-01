import { useState } from 'react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface PianoLevelProps {
  onSuccess: () => void;
}

const VALID_ANSWERS = ['小星星', 'twinkle', '小星星歌'];
const PIANO_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;
const NOTE_LABELS = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];

export function PianoLevel({ onSuccess }: PianoLevelProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [activeKey, setActiveKey] = useState<number | null>(null);

  const playKey = (note: number) => {
    audioEngine.playPianoNote(note);
    setActiveKey(note);
    window.setTimeout(() => setActiveKey((prev) => (prev === note ? null : prev)), 180);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = answer.trim();
    if (VALID_ANSWERS.includes(v) || v.toLowerCase() === 'twinkle') {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('❌ 平板連鎖反饋：『聽覺代號不匹配！這絕非那首純真旋律的名稱！』');
      audioEngine.playBeep(220, 0.4);
      setAnswer('');
      setTimeout(() => setError(''), 2200);
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="315 練琴室 — 無聲的旋律" />

      <p className="text-slate-300 leading-relaxed text-base">
        推開 315 練琴室的門，裡面空無一人，只有一架靜靜佇立的鋼琴。譜架上放著一張樂譜，樂譜上有一串神秘的數字 1 - 1 - 5 - 5 - 6 - 6 - 5 。你必須解開這些線索，才能獲取最後的寶物。
      </p>
      <ImagePlaceholder src={LEVEL_IMAGES.sheetMusic} alt="鋼琴樂譜" />

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl max-w-lg mx-auto space-y-3">
        <p className="text-xs text-slate-400 text-center">點擊琴鍵試彈，對照樂譜上的數字</p>
        <div className="flex justify-center gap-1 sm:gap-1.5 px-1 touch-manipulation select-none">
          {PIANO_KEYS.map((note, i) => (
            <button
              key={note}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                playKey(note);
              }}
              className={`relative flex flex-col items-center justify-end w-9 sm:w-11 h-28 sm:h-32 rounded-b-lg border-2 transition-all active:scale-95 ${
                activeKey === note
                  ? 'bg-amber-100 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)] -translate-y-0.5'
                  : 'bg-gradient-to-b from-slate-100 to-slate-200 border-slate-400 hover:from-white hover:to-slate-100'
              }`}
              aria-label={`琴鍵 ${note} ${NOTE_LABELS[i]}`}
            >
              <span className="text-lg sm:text-xl font-black text-slate-800 pb-2">{note}</span>
              <span className="text-[9px] text-slate-500 pb-1 font-mono">{NOTE_LABELS[i]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block text-center">🔐 嫌犯平板解鎖指令</span>
          <p className="text-xs text-slate-400 text-center leading-relaxed">在平板輸入數字代表的意思：</p>
          <input
            type="text"
            value={answer}
            onChange={(e) => { setError(''); setAnswer(e.target.value); }}
            placeholder="請輸入答案"
            className="w-full text-center font-sans text-xl py-3 border-2 border-slate-700 bg-slate-950 text-white rounded-xl focus:border-amber-500 outline-none"
          />
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-white font-black rounded-xl text-sm transition tracking-widest uppercase shadow-lg shadow-amber-600/10">
            確認
          </button>
        </form>
        {error && <p className="text-center text-red-400 font-semibold text-xs py-2 bg-red-950/25 border border-red-500/10 rounded-lg mt-3 w-full max-w-sm">{error}</p>}
      </div>
    </div>
  );
}
