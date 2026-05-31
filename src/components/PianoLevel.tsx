import { useState } from 'react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface PianoLevelProps {
  onSuccess: () => void;
}

const VALID_ANSWERS = ['小星星', 'twinkle', '小星星歌'];

export function PianoLevel({ onSuccess }: PianoLevelProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

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
