import { useState } from 'react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface MirrorWallLevelProps {
  onSuccess: () => void;
}

const PASSWORD = '315';

export function MirrorWallLevel({ onSuccess }: MirrorWallLevelProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === PASSWORD) {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('❌ 教室房號不正確！請對著鏡子觀察倒影。');
      audioEngine.playBeep(220, 0.4);
      setPassword('');
      setTimeout(() => setError(''), 2200);
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="倒影中的真相" />

      <p className="text-stone-300 leading-relaxed text-base">
        氣喘吁吁地跑到藝文館一樓後，果然在熟悉的整面大鏡牆前，找到了另外半張殘破的《星夜》明信片。
        站在這面巨大的鏡子前，你不禁想起了八年級為了宿營晚會，全班在這裡揮汗練舞的時光。
        那時候，面對這面鏡子，總能一眼看出誰的動作沒有左右對稱、誰的走位錯了。
        鏡子，總是能最誠實地映照出我們的真實。
      </p>

      <p className="text-stone-300 leading-relaxed text-base">
        想到過去的點點滴滴，你決定絕對不能讓嫌犯得逞！
        你將兩半的明信片拼在一起後翻到背面，你驚訝地發現，上面竟然用濃厚且微微未乾的水彩顏料，
        寫了三排混雜著英文與數字的字串，嫌犯用你們手上的調色盤寫下這些字！照片下方還有一行留言：
        <blockquote className="border-l-2 border-amber-600/50 pl-4 py-2 bg-amber-950/10 rounded-r text-sm text-amber-200/90 italic">
          不要相信你雙眼直視的表象，轉過身，讓鏡子告訴你真正的答案。看懂了，就親自來找我拿下一道線索吧！
        </blockquote>
      </p>

      <ImagePlaceholder src={LEVEL_IMAGES.mirrorPostcard} alt="星夜明信片背面" />

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto bg-stone-900 border border-stone-800 p-5 rounded-2xl shadow-xl space-y-4">
        <span className="text-xs font-mono text-stone-500 uppercase tracking-widest">輸入密碼</span>
        <input
          type="text"
          inputMode="numeric"
          value={password}
          onChange={(e) => { setError(''); setPassword(e.target.value); }}
          placeholder="輸入密碼"
          className="w-full text-center tracking-[10px] font-mono text-2xl py-3 border border-stone-700 bg-stone-950 text-white rounded-xl focus:border-purple-500 outline-none"
        />
        <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition">
          前往該練琴室
        </button>
        {error && <p className="text-red-400 text-xs text-center font-semibold">{error}</p>}
      </form>
    </div>
  );
}
