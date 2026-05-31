import { useState } from 'react';
import { Key } from 'lucide-react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface MagicSquareLevelProps {
  onSuccess: () => void;
}

const PASSWORD = '137';

export function MagicSquareLevel({ onSuccess }: MagicSquareLevelProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === PASSWORD) {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('❌ 置物櫃密碼鎖嚙合死鎖，解鎖失敗！請再算算看。');
      audioEngine.playBeep(220, 0.4);
      setPassword('');
      setTimeout(() => setError(''), 2200);
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="交誼廳 — 平衡的九宮置物櫃" />

      <p className="text-stone-300 leading-relaxed text-base">
        推開宿舍大門，你走進一樓的交誼廳。在交誼廳正中央的桌上，放著一個上了「三位數密碼鎖」的密碼盒。盒子旁邊，貼著一張交誼廳「九宮格置物櫃」的平面配置圖，上面填著幾個數字，但有三個櫃子的位置被畫上了 🔴、🔵、🟡 的符號。密碼鎖從左到右，旁邊貼著紅、藍、黃的貼紙，暗示著解開這道鎖的順序。
      </p>

      <ImagePlaceholder
        src={LEVEL_IMAGES.magicSquare}
        alt="九宮格置物櫃配置圖"
        className="max-w-xs mx-auto"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
        <div className="w-full max-w-[280px] mx-auto aspect-square bg-stone-800 p-3 rounded-xl border-2 border-stone-700 grid grid-cols-3 gap-2">
            <div className="bg-slate-900 border border-slate-800 rounded flex items-center justify-center font-mono text-xl font-bold text-slate-300">8</div>
            <div className="bg-red-500/10 border-2 border-red-500 rounded flex items-center justify-center font-bold text-red-500 text-lg relative animate-pulse shadow-inner shadow-red-500/20">🔴</div>
            <div className="bg-slate-900 border border-slate-800 rounded flex items-center justify-center font-mono text-xl font-bold text-slate-300">6</div>
            <div className="bg-sky-500/10 border-2 border-sky-500 rounded flex items-center justify-center font-bold text-sky-400 text-lg relative animate-pulse shadow-inner shadow-sky-500/20">🔵</div>
            <div className="bg-slate-950 border border-slate-800 rounded flex items-center justify-center font-mono text-2xl font-black text-amber-500">5</div>
            <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded flex items-center justify-center font-bold text-yellow-400 text-lg relative animate-pulse shadow-inner shadow-yellow-500/20">🟡</div>
            <div className="bg-slate-900 border border-slate-800 rounded flex items-center justify-center font-mono text-xl font-bold text-slate-300">4</div>
            <div className="bg-slate-900 border border-slate-800 rounded flex items-center justify-center font-mono text-xl font-bold text-slate-300">9</div>
            <div className="bg-stone-900 border border-stone-800 rounded flex items-center justify-center font-mono text-xl font-bold text-stone-300">2</div>
          </div>

        <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 p-5 rounded-xl space-y-4">
          <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">🔒 三位數密碼鎖</span>
          <p className="text-xs text-stone-400">依 🔴 → 🔵 → 🟡 順序，算出三格數字並組合。</p>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                inputMode="numeric"
                value={password}
                onChange={(e) => {
                  setError('');
                  setPassword(e.target.value.replace(/\D/g, '').slice(0, 3));
                }}
                maxLength={3}
                placeholder="輸入 3 位密碼"
                className="w-full pl-12 pr-4 text-center tracking-[12px] font-mono text-2xl py-3.5 border-2 border-slate-700 bg-slate-950 text-white rounded-xl focus:border-sky-500 outline-none"
              />
            </div>
            <button type="submit" className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl text-sm transition tracking-widest uppercase shadow-lg shadow-sky-600/10">
              送出密碼打開盒子
            </button>
          {error && <p className="text-center text-red-400 text-xs font-semibold">{error}</p>}
        </form>
      </div>
    </div>
  );
}
