import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, ShieldCheck, Sun } from 'lucide-react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface UVKeypadProps {
  onSuccess: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0', '確定'];
const UV_KEYS = ['1', '2', '4', '8'];
const PASSWORD = '8421';

export function UVKeypad({ onSuccess }: UVKeypadProps) {
  const [code, setCode] = useState('');
  const [uvOn, setUvOn] = useState(false);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const handleKey = (key: string) => {
    audioEngine.playBeep(440, 0.08);
    setError('');
    if (key === '清除') setCode('');
    else if (key === '確定') submit();
    else if (code.length < 4) setCode((prev) => prev + key);
  };

  const submit = () => {
    if (code === PASSWORD) {
      setUnlocked(true);
      audioEngine.playBeep(880, 0.2);
      audioEngine.playBeep(1200, 0.3);
      navigator.vibrate?.(100);
      setTimeout(onSuccess, 1200);
    } else {
      setError('❌ 大門發出沈悶的拒絕警告！密碼錯誤。');
      audioEngine.playBeep(220, 0.4);
      navigator.vibrate?.([50, 50, 50]);
      setCode('');
      setTimeout(() => setError(''), 2500);
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="密碼的節奏" />

      <p className="text-stone-300 leading-relaxed">
        校門緊閉，假日的校園空無一人。你拿起預備好的<span className="text-amber-500 font-semibold">紫外線燈</span>往按鍵上一照——部分按鍵浮現指紋螢光。
      </p>

      <blockquote className="border-l-2 border-amber-600/50 pl-4 py-2 bg-amber-950/10 rounded-r text-sm text-amber-200/90 italic">
        「安全守則：密碼的節奏如同細胞分裂般成長，但守衛的密令要求我們『溯源而上』。」
      </blockquote>

      <button
        type="button"
        onClick={() => { setUvOn(!uvOn); audioEngine.playBeep(uvOn ? 600 : 700, 0.15); }}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition ${
          uvOn ? 'bg-purple-900 text-white' : 'bg-stone-900 text-purple-400 border border-purple-500/20'
        }`}
      >
        {uvOn ? <Sun className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {uvOn ? '關閉紫外線燈' : '打開紫外線燈'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImagePlaceholder src={LEVEL_IMAGES.gate} alt="警衛室大門" />

        <div className="space-y-4">
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-center">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">密碼輸入</span>
            <div className="text-2xl font-mono tracking-[0.3em] text-amber-500 font-bold min-h-[40px] flex items-center justify-center mt-2">
              {code ? code.split('').map(() => '●').join(' ') : '····'}
            </div>
            {unlocked && (
              <span className="text-emerald-400 text-xs flex items-center justify-center gap-1 mt-1">
                <ShieldCheck className="h-3 w-3" /> 解鎖成功
              </span>
            )}
          </div>

          <div className={`p-4 rounded-xl border transition-all ${
            uvOn ? 'bg-[#0c0c0e] border-purple-800/60' : 'bg-stone-900 border-stone-800'
          }`}>
            <div className="grid grid-cols-3 gap-2 justify-items-center max-w-[260px] mx-auto">
              {KEYS.map((key) => {
                const isUv = uvOn && UV_KEYS.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => handleKey(key)}
                    disabled={unlocked}
                    className={`h-12 w-12 rounded-full flex items-center justify-center font-bold relative active:scale-95 transition ${
                      key === '確定' ? 'bg-amber-700 text-white text-xs'
                      : key === '清除' ? 'bg-stone-950 text-stone-400 text-xs'
                      : 'bg-stone-900 border border-stone-800 text-stone-200'
                    }`}
                  >
                    {key}
                    {isUv && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 0.85 }}
                        className="absolute inset-0 rounded-full border-2 border-purple-500 bg-purple-900/30 pointer-events-none"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center text-red-400 font-semibold p-3 bg-red-950/20 border border-red-500/10 rounded-lg text-sm">
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
