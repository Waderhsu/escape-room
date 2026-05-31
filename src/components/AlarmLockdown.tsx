import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Key, Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface AlarmLockdownProps {
  onSuccess: () => void;
}

const INITIAL_SECONDS = 5 * 60;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function AlarmLockdown({ onSuccess }: AlarmLockdownProps) {
  const [timeLeft, setTimeLeft] = useState(INITIAL_SECONDS);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [alarmOn, setAlarmOn] = useState(true);
  const stopAlarmRef = useRef<(() => void) | null>(null);
  const timedOutRef = useRef(false);

  const isUrgent = timeLeft <= 60;

  useEffect(() => {
    if (alarmOn) {
      stopAlarmRef.current = audioEngine.startAlarmBeeps();
    } else if (stopAlarmRef.current) {
      stopAlarmRef.current();
      stopAlarmRef.current = null;
    }
    return () => {
      stopAlarmRef.current?.();
    };
  }, [alarmOn]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;
        if (!timedOutRef.current) {
          timedOutRef.current = true;
          audioEngine.playBeep(150, 1, 'sawtooth');
          window.alert('🚨 系統警報連通！5 分鐘已到，防禦程序重置。');
          window.setTimeout(() => {
            timedOutRef.current = false;
          }, 500);
        }
        return INITIAL_SECONDS;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().toLowerCase() === 'math') {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.3);
      stopAlarmRef.current?.();
      onSuccess();
    } else {
      setError('❌ 金鑰不匹配！警報防護拒絕訪問！');
      audioEngine.playBeep(200, 0.5);
      setAnswer('');
      window.setTimeout(() => setError(''), 2200);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 border-b border-red-900/30 pb-3">
        <LevelHeader title="警報中斷程序" className="border-none pb-0 flex-1" />
        <button
          type="button"
          onClick={() => setAlarmOn(!alarmOn)}
          className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition ${
            alarmOn
              ? 'bg-red-950/40 border-red-800/50 text-red-300'
              : 'bg-stone-900 border-stone-800 text-stone-400'
          }`}
        >
          {alarmOn ? <Volume2 className="h-4 w-4 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
          {alarmOn ? '警報聲 ON' : '警報聲 OFF'}
        </button>
      </div>

      <p className="text-stone-300 leading-relaxed text-sm sm:text-base">
        糟了！警衛室大門剛開啟，室內感應器就偵測到非預期移動。紅燈瘋狂閃爍，廣播系統響起低沉的警告音：「偵測到入侵，5 分鐘後將全面封鎖並通報警方。」
        你衝向警衛室裡的電腦，必須在時間耗盡前解開消音頻率並終止警報！
      </p>

      <div
        className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${
          isUrgent
            ? 'bg-red-950/50 border-red-600/60 animate-pulse'
            : 'bg-red-950/25 border-red-900/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`relative flex h-3 w-3 ${alarmOn ? '' : 'opacity-40'}`}>
            {alarmOn && <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />}
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <span className="text-xs font-mono text-red-300 uppercase tracking-wider">警報啟動中</span>
        </div>
        <span className={`font-mono text-2xl sm:text-3xl font-black tabular-nums ${isUrgent ? 'text-red-400' : 'text-red-500/90'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      <ImagePlaceholder src={LEVEL_IMAGES.alarm} alt="警報系統畫面" className="max-w-lg mx-auto" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <div className="bg-[#0a0f0d] border border-[#22c55e]/25 rounded-xl p-4 sm:p-5 font-mono space-y-4 shadow-inner">
          <div className="text-[#22c55e] text-center space-y-3">
            <p className="text-sm font-bold border-b border-[#22c55e]/25 pb-2 tracking-wide">校內警報閥閉系統</p>
            <div className="text-xl sm:text-2xl font-bold tracking-widest">? ? 10 17 26 ? 50</div>
          </div>
          <p className="text-[11px] sm:text-xs leading-relaxed text-stone-400 text-center bg-stone-950/60 border border-stone-800 rounded-lg p-3">
            「目前的干擾頻率為非穩定狀態，請找出缺失的頻率數值與關鍵頻率的位置，並轉化為代碼中斷警報。」
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center gap-4 bg-stone-950 border border-stone-800 rounded-xl p-5"
        >
          <div>
            <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block mb-2">
              輸入消音頻率代碼
            </span>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-500" />
              <input
                type="text"
                value={answer}
                onChange={(e) => { setError(''); setAnswer(e.target.value); }}
                maxLength={10}
                placeholder="四個字母..."
                autoComplete="off"
                className="w-full pl-12 pr-4 py-3.5 border border-stone-700 bg-stone-900 font-mono tracking-[0.35em] text-[#22c55e] rounded-lg focus:border-red-500 outline-none text-center text-lg uppercase font-bold"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg active:scale-[0.98] transition"
          >
            中斷警報器
          </button>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm font-semibold text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
