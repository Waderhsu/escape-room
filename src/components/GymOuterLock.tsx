import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Key } from 'lucide-react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface GymOuterLockProps {
  onSuccess: () => void;
}

const PASSWORD = '3100';

export function GymOuterLock({ onSuccess }: GymOuterLockProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === PASSWORD) {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('❌ 體育館大門的密碼鎖拒絕開啟，請重新解讀三道謎題。');
      audioEngine.playBeep(220, 0.4);
      setPassword('');
      setTimeout(() => setError(''), 2200);
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="體育館大門 — 進擊的最終外鎖" />

      <p className="text-stone-300 leading-relaxed text-base">
        你氣喘吁吁地來到體育館大門，卻發現門是緊鎖的。嫌犯果然不會讓我們這麼輕易破關！這時，你看到實體鎖頭旁邊貼著一張精緻的密碼提示卡，上面寫著三道奇怪的數學謎題：
      </p>

      <ImagePlaceholder
        src={LEVEL_IMAGES.gymOuterLock}
        alt="體育館大門密碼提示卡"
      />

      <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-5 space-y-4">
        <p className="text-xs text-stone-500 italic text-center">提示：這是考驗文字結構與空間重組的幾何題，請依序解出密碼。</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4 bg-stone-900 border border-stone-800 p-5 rounded-2xl">
        <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block text-center">🔐 輸入密碼</span>
        <div className="relative">
          <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-500" />
          <input
            type="text"
            inputMode="numeric"
            value={password}
            onChange={(e) => { setError(''); setPassword(e.target.value); }}
            maxLength={4}
            placeholder="____"
            className="w-full pl-12 pr-4 text-center tracking-[12px] font-mono text-2xl py-3 border border-stone-800 bg-stone-950 text-white rounded focus:border-amber-500 outline-none"
          />
        </div>
        <button type="submit" className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg text-sm transition">
          開啟體育館大門
        </button>
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center font-semibold">{error}</motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
