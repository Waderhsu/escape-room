import { useState } from 'react';
import { Lock } from 'lucide-react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface CalendarLevelProps {
  onSuccess: () => void;
}

const PASSWORD = '2329';

export function CalendarLevel({ onSuccess }: CalendarLevelProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === PASSWORD) {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('❌ 暗號不吻合，門把依然卡死不動！');
      audioEngine.playBeep(220, 0.4);
      setPassword('');
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="遺落的行事曆" />

      <p className="text-stone-200 leading-relaxed text-base">
        呼！終於關閉警報了！成功進入校園後，你決定先從案發現場「九導辦公室」調查。來到門口，你發現門上貼著一張 4 月的行事曆（2026年4月），上面許多日期被老師用紅筆註記。
      </p>

      <blockquote className="border-l-2 border-sky-600/50 pl-4 py-2 bg-sky-950/10 rounded-r text-sm text-sky-200/90 italic">
        「重要的日子總是被銘記，但唯有隱藏在其中的『遺珠』，才是通往驚喜的鑰匙。請尋找畢業前夕（最後兩週）被遺忘的事情。」
      </blockquote>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        <div className="lg:col-span-8 bg-[#0c0c0e] border border-stone-800 rounded p-5 shadow-2xl">
          <ImagePlaceholder
            src={LEVEL_IMAGES.calendar}
            alt="2026年4月行事曆"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="lg:col-span-4 bg-[#0a0a0b] border border-stone-800 rounded-xl p-5 space-y-4 shadow-xl lg:sticky lg:top-4">
          <div className="text-stone-400 text-xs font-mono uppercase tracking-wider">🔐 九導辦門鎖</div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              value={password}
              onChange={(e) => { setError(''); setPassword(e.target.value); }}
              maxLength={4}
              placeholder="輸入四位數密碼"
              className="w-full text-center tracking-[2px] font-mono text-2xl py-3 border border-stone-800 bg-stone-950 text-white rounded focus:border-sky-500 outline-none"
            />
            <button type="submit" className="w-full py-3.5 bg-sky-700 hover:bg-sky-600 text-white font-bold rounded flex items-center justify-center gap-2 text-sm transition shadow-lg">
              <Lock className="h-4 w-4" />
              驗證並解鎖大門
            </button>
          </form>
          {error && (
            <div className="text-red-400 text-xs font-semibold text-center py-2 bg-red-950/20 border border-red-500/10 rounded">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
