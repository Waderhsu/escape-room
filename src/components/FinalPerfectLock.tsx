import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { audioEngine } from './AudioEngine';
import { LevelHeader } from './LevelHeader';

interface FinalPerfectLockProps {
  onSuccess: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0', '驗證'];
const PASSWORD = '0628';

export function FinalPerfectLock({ onSuccess }: FinalPerfectLockProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleKey = (key: string) => {
    audioEngine.playBeep(440, 0.08);
    setError('');
    if (key === '清除') setCode('');
    else if (key === '驗證') submit();
    else if (code.length < 4) setCode((prev) => prev + key);
  };

  const submit = () => {
    if (code === PASSWORD) {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('❌ 大螢幕傳來低沉報警：『密碼不契和，生日代碼錯誤！完美防禦未解除。』');
      audioEngine.playBeep(220, 0.45);
      setCode('');
      setTimeout(() => setError(''), 2200);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <LevelHeader title="體育館內 — 完美的人與終極內鎖" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <blockquote className="border-l-4 border-amber-600 pl-4 py-2 italic bg-amber-950/20 text-stone-100 rounded-r text-sm leading-relaxed lg:col-span-2">
          「恭喜你們抵達了終點。我曾說過，我是個『完美的人』。
          想要見到我的真面目拿到畢業驚喜，請在螢幕上輸入我的生日，我的生日是由『兩個完美數字』組成。
          完美數字是數學界中，全體正因數（除本身外）相加總和等於自身的神秘數字。」
        </blockquote>

        <div className="flex justify-center lg:col-span-2">
          <div className="p-5 rounded-2xl bg-stone-950 border-2 border-amber-900/40 w-full max-w-[300px] shadow-2xl mx-auto">
            <div className="bg-black py-3.5 px-3 rounded-xl border border-rose-950 text-center text-3xl font-mono text-[#f43f5e] font-extrabold tracking-widest min-h-[55px] mb-4 shadow-[inset_0_0_12px_rgba(239,68,68,0.3)] select-all">
              {code || '----'}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKey(key)}
                  className={`h-11 rounded-lg flex items-center justify-center font-bold tracking-wide transition active:scale-95 ${
                    key === '驗證'
                      ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-sm shadow-lg shadow-amber-500/20'
                      : key === '清除'
                        ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs'
                        : 'bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-base'
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center text-red-400 font-semibold p-3.5 bg-red-950/30 border border-red-500/20 rounded-xl text-xs">
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
