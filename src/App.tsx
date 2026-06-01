import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass, Volume2, VolumeX
} from "lucide-react";

import type { GameState } from "./types";
import { LEVELS } from "./types";
import { audioEngine } from "./components/AudioEngine";

import { UVKeypad } from "./components/UVKeypad";
import { AlarmLockdown } from "./components/AlarmLockdown";
import { CalendarLevel } from "./components/CalendarLevel";
import { PrimeSafe } from "./components/PrimeSafe";
import { ParallelogramCanvas } from "./components/ParallelogramCanvas";
import { MapOverlay } from "./components/MapOverlay";
import { DormClockLevel } from "./components/DormClockLevel";
import { MagicSquareLevel } from "./components/MagicSquareLevel";
import { MirrorWallLevel } from "./components/MirrorWallLevel";
import { PianoLevel } from "./components/PianoLevel";
import { LawnDiaryLevel } from "./components/LawnDiaryLevel";
import { BannerBlessingLevel } from "./components/BannerBlessingLevel";
import { FinalPerfectLock } from "./components/FinalPerfectLock";
import { GymOuterLock } from "./components/GymOuterLock";
import { LocationChoiceScreen } from "./components/LocationChoiceScreen";
import { LEVEL_IMAGES } from "./levelAssets";
import { getLevelBgm } from "./levelBgm";

export default function App() {
  const LOCAL_STORAGE_KEY = "消失的畢業驚喜_STATE_V1";

  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.currentLevelId === "string") {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Storage restoration failed:", e);
    }

    return {
      currentLevelId: "intro",
      unlockedLevels: ["intro", "loc_gate"],
      isAlarmActive: false,
      alarmTimeLeft: 300,
      dormGateSequence: [],
      dormLoungeSolved: false,
      horcruxSolved: { dorm: false, art: false, primary: false },
      hasCookie: false,
      hasPalette: false,
      hasStarCard: false,
      currentDormGateInputs: [],
      completedLevels: ["intro"],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  }, [state]);

  const [bgAmbient, setBgAmbient] = useState<boolean>(true);
  const [mapOpen, setMapOpen] = useState<boolean>(false);
  const [backpackTab, setBackpackTab] = useState<"items" | "progress">("items");
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showAlarmFailure, setShowAlarmFailure] = useState<boolean>(false);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navGenerationRef = useRef(0);
  const [intermissionChoiceError, setIntermissionChoiceError] = useState<string>("");
  const [intermissionSuccess, setIntermissionSuccess] = useState<string>("");

  const cancelPendingNavigation = () => {
    navGenerationRef.current += 1;
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
  };

  const scheduleAdvance = (nextLvId: string, delay: number) => {
    cancelPendingNavigation();
    const gen = navGenerationRef.current;
    navTimerRef.current = setTimeout(() => {
      if (gen !== navGenerationRef.current) return;
      advanceToLevel(nextLvId);
      navTimerRef.current = null;
    }, delay);
  };

  useEffect(() => {
    cancelPendingNavigation();
    setIntermissionChoiceError("");
    setIntermissionSuccess("");
  }, [state.currentLevelId]);

  useEffect(() => {
    audioEngine.setBgmEnabled(bgAmbient);
    if (!bgAmbient) {
      audioEngine.stopBgm();
      return;
    }

    const cfg = getLevelBgm(state.currentLevelId);
    const startBgm = () => {
      void audioEngine.unlockAudio().then(() => {
        void audioEngine.playLevelBgm(cfg);
      });
    };

    startBgm();

    const onInteract = () => startBgm();
    window.addEventListener('pointerdown', onInteract, { once: true });
    window.addEventListener('touchstart', onInteract, { once: true });
    window.addEventListener('keydown', onInteract, { once: true });

    return () => {
      audioEngine.stopBgm();
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [state.currentLevelId, bgAmbient]);

  useEffect(() => {
    if (state.currentLevelId !== "finish") {
      setConfettiActive(false);
      return;
    }

    setConfettiActive(true);
    const stopTimer = setTimeout(() => setConfettiActive(false), 5000);
    return () => clearTimeout(stopTimer);
  }, [state.currentLevelId]);

  useEffect(() => {
    if (!confettiActive || state.currentLevelId !== "finish") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; rotation: number; rotationSpeed: number;
    }> = [];
    const colors = ["#e0f2fe", "#38bdf8", "#0ea5e9", "#f59e0b", "#10b981", "#fb7185", "#c084fc"];

    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * 8 + 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
      });
    }

    let animationFrameId: number;
    const run = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      animationFrameId = requestAnimationFrame(run);
    };
    run();

    return () => cancelAnimationFrame(animationFrameId);
  }, [confettiActive, state.currentLevelId]);

  const triggerReset = () => {
    audioEngine.playBeep(300, 0.2);
    cancelPendingNavigation();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState({
      currentLevelId: "intro",
      unlockedLevels: ["intro", "loc_gate"],
      isAlarmActive: false,
      alarmTimeLeft: 300,
      dormGateSequence: [],
      dormLoungeSolved: false,
      horcruxSolved: { dorm: false, art: false, primary: false },
      hasCookie: false,
      hasPalette: false,
      hasStarCard: false,
      currentDormGateInputs: [],
      completedLevels: ["intro"],
    });
    setConfettiActive(false);
    setShowResetConfirm(false);
  };

  const handleResetGame = () => {
    setShowResetConfirm(true);
    audioEngine.playBeep(605, 0.1);
  };

  const advanceToLevel = (nextLvId: string) => {
    audioEngine.playBeep(880, 0.1);
    const currentIdx = LEVELS.findIndex((l) => l.id === state.currentLevelId);
    let newlyCompleted = [...state.completedLevels];
    if (currentIdx !== -1) {
      newlyCompleted = Array.from(new Set([...newlyCompleted, state.currentLevelId]));
    }
    const nextIdx = LEVELS.findIndex((l) => l.id === nextLvId);
    let newlyUnlocked = [...state.unlockedLevels];
    if (nextIdx !== -1) {
      newlyUnlocked = Array.from(new Set([...newlyUnlocked, nextLvId]));
    }
    setState((prev) => ({
      ...prev,
      currentLevelId: nextLvId,
      unlockedLevels: newlyUnlocked,
      completedLevels: newlyCompleted,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMapNodeJump = (lvId: string) => {
    if (state.unlockedLevels.includes(lvId)) {
      audioEngine.playBeep(600, 0.08);
      setState((prev) => ({ ...prev, currentLevelId: lvId }));
    }
  };

  const handleLevelGateSuccess = () => advanceToLevel("loc_alarm");
  const handleLockdownSuccess = () => advanceToLevel("loc_office_door");

  const handleAlarmFailure = () => {
    setShowAlarmFailure(true);
  };

  const confirmAlarmFailure = () => {
    setShowAlarmFailure(false);
    audioEngine.playBeep(400, 0.1);
    setState((prev) => ({ ...prev, currentLevelId: "loc_gate" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleIntermission1Select = (choice: string) => {
    audioEngine.playBeep(500, 0.1);
    setIntermissionChoiceError("");
    setIntermissionSuccess("");
    if (choice === "宿舍") {
      audioEngine.playBeep(880, 0.2);
      setIntermissionSuccess("✅ 聰明的選擇。請立刻前往宿舍，跑起來吧！");
      scheduleAdvance("loc_dorm_gate", 1200);
    } else {
      setIntermissionChoiceError("❌ 嗶！你太讓我失望了，我不是說了我討厭這裡嗎？請重新閱讀我的詩！");
      audioEngine.playBeep(180, 0.3);
    }
  };

  const handleLoungeSuccess = () => {
    setState((prev) => ({
      ...prev,
      hasCookie: true,
      hasPalette: true,
      hasStarCard: true,
      horcruxSolved: { ...prev.horcruxSolved, dorm: true },
    }));
    advanceToLevel("loc_intermission2");
  };

  const handleIntermission2Select = (choice: string) => {
    setIntermissionChoiceError("");
    setIntermissionSuccess("");
    audioEngine.playBeep(500, 0.1);
    if (choice === "藝文館") {
      audioEngine.playBeep(880, 0.2);
      setIntermissionSuccess("✅ 算你們有點眼光。帶著那半張殘破的星夜，前往藝文館一樓吧！");
      scheduleAdvance("loc_art_mirror", 2000);
    } else if (choice === "體育館") {
      setIntermissionChoiceError("❌ 難道那塊餅乾堵住了你們的觀察力？梵谷可不會在操場上揮灑顏料！請看清楚手上的線索，再選一次！");
      audioEngine.playBeep(180, 0.3);
    } else if (choice === "小學樓") {
      setIntermissionChoiceError("❌ 難道那塊餅乾堵住了你們的觀察力？小學生的塗鴉也稱不上藝術！請看清楚手上的線索，再選一次！");
      audioEngine.playBeep(180, 0.3);
    }
  };

  const handlePianoSuccess = () => {
    setState((prev) => ({
      ...prev,
      horcruxSolved: { ...prev.horcruxSolved, art: true },
    }));
    advanceToLevel("loc_intermission3");
  };

  const handleIntermission3Select = (choice: string) => {
    setIntermissionChoiceError("");
    setIntermissionSuccess("");
    audioEngine.playBeep(500, 0.08);
    if (choice === "小學樓") {
      audioEngine.playBeep(880, 0.2);
      setIntermissionSuccess("✅ 解鎖成功！溜滑梯的邊角隱藏著最後的秘密，去那裡，集齊屬於你們的畢業記憶。");
      scheduleAdvance("loc_primary_grass", 1200);
    } else {
      setIntermissionChoiceError("❌ 那裡只有汗水與競賽，沒有我們遺失的純真，再找找看吧！");
      audioEngine.playBeep(180, 0.3);
    }
  };

  const handleIntermission4Select = (choice: string) => {
    setIntermissionChoiceError("");
    setIntermissionSuccess("");
    audioEngine.playBeep(500, 0.08);
    if (choice === "體育館") {
      audioEngine.playBeep(880, 0.2);
      setIntermissionSuccess("✅ 解鎖成功！來體育館找我吧，找回屬於你們的驚喜。");
      scheduleAdvance("loc_gym_outer", 1200);
    } else {
      setIntermissionChoiceError("航線已鎖定終點，請前往體育館。");
      audioEngine.playBeep(180, 0.3);
    }
  };

  const handleLawnDiarySuccess = () => {
    setState((prev) => ({
      ...prev,
      horcruxSolved: { ...prev.horcruxSolved, primary: true },
    }));
    advanceToLevel("loc_explore_center");
  };

  const activeLevel = LEVELS.find((l) => l.id === state.currentLevelId) || LEVELS[0];

  return (
    <div className="min-h-full bg-[#0a0a0b] text-stone-200 flex flex-col font-sans select-none relative">
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-amber-950/5 blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-stone-950/10 blur-[150px] pointer-events-none -z-10" />

      {confettiActive && (
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-50 bg-transparent" />
      )}

      <header className="sticky top-0 z-40 bg-[#121214]/95 backdrop-blur-xl border-b border-stone-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded bg-stone-900 border border-stone-800 flex items-center justify-center text-xl shadow-md">🕵️‍♂️</div>
          <div className="min-w-0">
            <h1 className="text-lg font-serif italic text-amber-500 truncate">消失的畢業驚喜</h1>
          </div>
        </div>
        <div className="text-md text-[12px] md:text-[16px] leading-snug text-stone-500 shrink-0 max-w-[5.5rem] md:max-w-none">
          <p>林口康橋 數學科</p>
          <p>許芷雲教師設計</p>
          <p>郭育誠教師數位技術</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => { setBackpackTab("items"); setMapOpen(true); audioEngine.playBeep(600, 0.1); }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-700 hover:bg-amber-600 font-bold text-xs text-white rounded-lg transition-all shadow-md active:scale-95 leading-none border border-amber-600/20"
            title="查看解密背包與探案日誌"
          >
            <span className="text-sm">🎒</span>
            <span className="hidden sm:inline">偵探背包與日誌</span>
            <span className="sm:hidden">偵探背包</span>
          </button>
          <button
            onClick={() => {
              const next = !bgAmbient;
              if (!next) {
                audioEngine.setBgmEnabled(false);
              } else {
                audioEngine.setBgmEnabled(true);
                void audioEngine.unlockAudio().then(() => {
                  void audioEngine.playLevelBgm(getLevelBgm(state.currentLevelId));
                });
              }
              setBgAmbient(next);
              audioEngine.playBeep(next ? 800 : 300, 0.1);
            }}
            className={`p-2 rounded text-stone-400 hover:text-white transition-all ${bgAmbient ? "bg-amber-950/20 text-amber-500 border border-amber-500/20" : "bg-stone-900 border border-stone-800"}`}
            title={bgAmbient ? "關閉背景音樂" : "開啟背景音樂（依關卡切換）"}
          >
            {bgAmbient ? <Volume2 className="h-4 w-4 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 pb-24 z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentLevelId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="bg-[#121214] border border-stone-800 p-6 md:p-8 rounded-2xl shadow-2xl relative backdrop-blur-md"
          >
            {state.currentLevelId === "intro" && (
              <div className="space-y-6 text-center py-6">
                <h2 className="text-3xl font-serif italic text-amber-500 tracking-widest uppercase">📜 故事前言</h2>
                <div className="max-w-lg mx-auto text-stone-300 space-y-4 text-base leading-loose font-medium text-left bg-stone-900 border border-stone-800 p-6 rounded-2xl">
                  <p>那天在走廊經過，無意間聽到導師們神色慌張地討論著：放在導師辦公室準備給班上的『畢業驚喜』竟然不見了！</p>
                  <p>雖然會考已經結束，但這份屬於全班的紀念絕對不能就這樣消失。你決定在假日偷偷潛回校園，循著微弱的線索，領回屬於自己的畢業禮物。</p>
                </div>
                <div className="pt-4">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => advanceToLevel("loc_gate")}
                    className="px-10 py-4 bg-amber-700 hover:bg-amber-600 font-bold tracking-widest text-white text-base rounded shadow-xl transition-colors shadow-amber-950/20">
                    開始潛入調查
                  </motion.button>
                </div>
              </div>
            )}

            {state.currentLevelId === "loc_gate" && <UVKeypad onSuccess={handleLevelGateSuccess} />}
            {state.currentLevelId === "loc_alarm" && (
              <AlarmLockdown onSuccess={handleLockdownSuccess} onFailure={handleAlarmFailure} />
            )}
            {state.currentLevelId === "loc_office_door" && <CalendarLevel onSuccess={() => advanceToLevel("loc_safe")} />}
            {state.currentLevelId === "loc_safe" && <PrimeSafe onSuccess={() => advanceToLevel("loc_tablet")} />}
            {state.currentLevelId === "loc_tablet" && <ParallelogramCanvas onSuccess={() => advanceToLevel("loc_star_map")} />}
            {state.currentLevelId === "loc_star_map" && <MapOverlay onSuccess={() => advanceToLevel("loc_intermission1")} />}

            {state.currentLevelId === "loc_intermission1" && (
              <LocationChoiceScreen
                imageSrc={LEVEL_IMAGES.locationChoice8}
                activeSlots={["gym", "primary", "art", "dorm"]}
                onSelect={handleIntermission1Select}
                error={intermissionChoiceError}
                success={intermissionSuccess}
              />
            )}

            {state.currentLevelId === "loc_dorm_gate" && <DormClockLevel onSuccess={() => advanceToLevel("loc_dorm_lounge")} />}
            {state.currentLevelId === "loc_dorm_lounge" && <MagicSquareLevel onSuccess={handleLoungeSuccess} />}

            {state.currentLevelId === "loc_intermission2" && (
              <LocationChoiceScreen
                imageSrc={LEVEL_IMAGES.locationChoice11}
                activeSlots={["gym", "primary", "art"]}
                onSelect={handleIntermission2Select}
                error={intermissionChoiceError}
                success={intermissionSuccess}
              />
            )}

            {state.currentLevelId === "loc_art_mirror" && <MirrorWallLevel onSuccess={() => advanceToLevel("loc_art_piano")} />}
            {state.currentLevelId === "loc_art_piano" && <PianoLevel onSuccess={handlePianoSuccess} />}

            {state.currentLevelId === "loc_intermission3" && (
              <LocationChoiceScreen
                imageSrc={LEVEL_IMAGES.locationChoice14}
                activeSlots={["gym", "primary"]}
                onSelect={handleIntermission3Select}
                error={intermissionChoiceError}
                success={intermissionSuccess}
              />
            )}

            {state.currentLevelId === "loc_primary_grass" && <LawnDiaryLevel onSuccess={handleLawnDiarySuccess} />}
            {state.currentLevelId === "loc_explore_center" && <BannerBlessingLevel onSuccess={() => advanceToLevel("loc_intermission4")} />}

            {state.currentLevelId === "loc_intermission4" && (
              <LocationChoiceScreen
                imageSrc={LEVEL_IMAGES.locationChoice17}
                activeSlots={["gym"]}
                onSelect={handleIntermission4Select}
                error={intermissionChoiceError}
                success={intermissionSuccess}
              />
            )}

            {state.currentLevelId === "loc_gym_outer" && <GymOuterLock onSuccess={() => advanceToLevel("loc_gym_inner")} />}
            {state.currentLevelId === "loc_gym_inner" && <FinalPerfectLock onSuccess={() => advanceToLevel("finish")} />}

            {state.currentLevelId === "finish" && (
              <div className="space-y-6 text-center py-6">
                <span className="text-5xl animate-bounce block">🎓</span>
                <h2 className="text-3xl font-serif italic text-amber-500 font-bold tracking-widest">🎉 解鎖成功！畢業快樂！</h2>
                <div className="max-w-2xl mx-auto bg-stone-950/80 p-6 md:p-8 rounded-2xl border border-stone-800 text-left space-y-4 shadow-2xl text-stone-300 leading-relaxed text-base">
                  <p>體育館的燈光瞬間全亮！螢幕上跳出華麗的煙火特效。體育館遠處的暗門緩緩打開，五個黑黑的人影從遠處頂光走來——嫌犯正是九年級的五位數學老師們！</p>
                  <p className="font-bold text-amber-500">「沒錯，這場天羅地網的謎題，就是我們送給你們的畢業禮物。」</p>
                  <p>雖然會考已經結束，但我們在旁看著你們解謎，其實是想在最後帶領你們重新走過這三年的足跡，檢視你們在康橋國中三年，用汗水與挑戰換來的四份重要精神：</p>
                  <ul className="text-sm space-y-2 list-disc pl-5 text-stone-400">
                    <li>到了【宿舍】解開鎖頭，代表你們找到了『精神』</li>
                    <li>到了【藝文館】透過鏡像看清旋律，代表你們找到了『美感』</li>
                    <li>到了【小學樓】在草皮上追尋日記，代表你們找到了『純真』</li>
                    <li>到了【探索中心】與【體育館】，看到了六環並破解完美數，代表你們找到了『力量』與『汗水』</li>
                  </ul>
                  <p className="text-stone-400 text-sm italic">畢業驚喜從來沒有消失，它早就刻在你們這三年的成長足跡裡。願你們帶著這四份精神，繼續在高中揮灑青春，勇敢圓夢！</p>
                  <p className="text-amber-400/80 text-xs border-t border-stone-800 pt-4">
                    🎁 彩蛋：第一名解開最後一關「0628 完美數」並向數學老師出示平板成功截圖的人，可以領取全場最特別的「神祕驚喜禮物」一份！
                  </p>
                </div>
                <button onClick={handleResetGame} className="px-6 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-400 hover:text-stone-200 transition font-bold rounded">
                  🔄 重置遊戲
                </button>
              </div>
            )}

            {state.currentLevelId !== "intro" && state.currentLevelId !== "finish" && (
              <div className="mt-8 pt-5 border-t border-stone-800 flex items-center text-xs font-mono">
                <span className="flex items-center gap-1 text-stone-400">
                  <Compass className="h-3.5 w-3.5 text-amber-500 animate-spin-slow" />
                  當前位置：{activeLevel.locationName}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {state.currentLevelId !== "intro" && (
          <div className="flex justify-center mt-6 z-0 relative">
            <button onClick={handleResetGame} className="px-4 py-2 border border-stone-800 rounded hover:bg-red-950/20 hover:border-red-500/20 font-bold font-mono text-[11px] text-stone-500 hover:text-red-400 transition">
              🔄 完全清除緩存重置遊戲
            </button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAlarmFailure && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 text-[#e7e5e4]">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-[#1c1917] border border-red-900/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
              <div className="w-14 h-14 bg-red-950/50 border border-red-700/50 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">🚨</div>
              <div className="space-y-2">
                <h3 className="text-red-300 font-bold text-lg font-serif italic tracking-wide">潛入行動暴露！</h3>
                <p className="text-sm text-stone-300 leading-relaxed">
                  警衛室的全域封鎖程序已啟動，保全手電筒的光束掃過走廊——<span className="text-red-400 font-semibold">你被發現了</span>。
                </p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  這次的調查以失敗收場。你只能退回校門，重新規劃潛入路線，再次挑戰警報中斷程序。
                </p>
              </div>
              <button type="button" onClick={confirmAlarmFailure}
                className="w-full py-3 bg-red-800 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-red-900/30">
                退回校門，重新潛入
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 text-[#e7e5e4]">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-[#1c1917] border border-stone-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 bg-red-950/40 border border-red-900/40 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl animate-pulse">⚠️</div>
              <div className="space-y-1">
                <h3 className="text-stone-100 font-bold text-base">重置探索旅程嗎？</h3>
                <p className="text-xs text-stone-400 leading-relaxed">這會清空你在本校園的所有解鎖進度（包含道具、日記、解鎖狀態），回到最初校外走廊。</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button type="button" onClick={() => { setShowResetConfirm(false); audioEngine.playBeep(400, 0.08); }}
                  className="py-2.5 bg-stone-900 border border-stone-800 text-stone-400 rounded-xl text-xs font-bold transition-all active:scale-95">取消返回</button>
                <button type="button" onClick={triggerReset} className="py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-red-900/30">確認清除重置</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mapOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 text-[#e7e5e4]">
            <motion.div initial={{ scale: 0.9, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 15 }}
              className="bg-[#121214] border border-stone-800 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto scrollbar-detective shadow-2xl relative flex flex-col">
              <div className="flex justify-between items-start border-b border-stone-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎒</span>
                  <h3 className="text-xl font-bold text-stone-100 font-serif italic tracking-wide">偵探探險包 ─ 案件檔案室</h3>
                </div>
                <button type="button" onClick={() => { setMapOpen(false); audioEngine.playBeep(500, 0.08); }}
                  className="px-3 py-1 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white rounded-lg text-xs font-mono font-bold hover:bg-stone-800 transition-colors">關閉返回</button>
              </div>

              <div className="flex gap-2 mb-6 border-b border-stone-800 pb-2 shrink-0">
                {(["items", "progress"] as const).map((tab) => (
                  <button key={tab} type="button" onClick={() => { setBackpackTab(tab); audioEngine.playBeep(600, 0.08); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border ${
                      backpackTab === tab ? "bg-amber-950/10 text-amber-500 border-amber-500/20 shadow-inner" : "bg-stone-900/40 text-stone-400 border-transparent hover:text-stone-200"
                    }`}>
                    <span>{tab === "items" ? "🎒 探險背包物件" : "📜 探案歷史日誌與快速傳送"}</span>
                  </button>
                ))}
              </div>

              {backpackTab === "items" && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-400 leading-relaxed mb-4">💡 這裡存放著你從校園各個角落解鎖、尋得的核心道具。</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: "📬", name: "紫底燙金畢業邀請信", desc: "清晨於校外門廊視窗拾獲，印有精緻圖騰。這是引你前往辦公室與保險箱的信物。", unlocked: true },
                      { icon: state.hasCookie ? "🍪" : "🔒", name: "導師的大理石曲奇", desc: state.hasCookie ? "宿舍置物櫃解鎖所藏。由全體九年級導師親手烤焙，香濃美味，象徵真摯勇氣與情誼！" : "（預計於宿舍交誼廳解鎖獲得）傳來溫熱香甜的大理石烘焙糕底氣味……", unlocked: state.hasCookie },
                      { icon: state.hasPalette ? "🎨" : "🔒", name: "木質調色盤", desc: state.hasPalette ? "藝文館中解密獲得。殘留著奇異亮麗的三原色顏料，似乎可用於對照視差線條的場合。" : "（預計於藝文館鏡牆或琴房中解鎖獲得）屬於藝術之美的美學靈感……", unlocked: state.hasPalette },
                      { icon: state.hasStarCard ? "🖼️" : "🔒", name: "殘缺的《星夜》卡片", desc: state.hasStarCard ? "繪有梵谷名作星夜，背部帶有對應鏡子左右反轉的模糊手寫數字。可以配合鏡牆破解琴房代碼。" : "（預計於藝文專區解鎖獲得）屬於星空的特殊浪漫謎字……", unlocked: state.hasStarCard },
                    ].map((item) => (
                      <div key={item.name} className={`p-4 rounded-xl border flex gap-4 items-start shadow-md transition-all ${item.unlocked ? "border-stone-800 bg-stone-900/50" : "border-stone-900/20 bg-stone-950/20 opacity-45"}`}>
                        <div className="text-3xl p-2.5 bg-stone-950 rounded-xl border border-stone-800">{item.icon}</div>
                        <div className="space-y-0.5">
                          <h4 className={`text-sm font-bold font-serif italic ${item.unlocked ? "text-amber-500" : "text-stone-500"}`}>{item.name}</h4>
                          <p className="text-[11px] text-stone-400 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {backpackTab === "progress" && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-400 leading-relaxed mb-4 bg-amber-950/10 p-2.5 border border-amber-500/15 rounded-xl">
                    💡 <b>地圖自由傳送已解鎖！</b>當你破關、卡關或需要重溫時，隨時點擊前方已解鎖或破解的關卡，即可立馬「快速傳送且回頭體驗」之前的解密情境或是尋找線索！
                  </p>
                  <div className="space-y-2 max-h-[45vh] overflow-y-auto scrollbar-detective pr-2">
                    {LEVELS.map((node, index) => {
                      const isUnlocked = state.unlockedLevels.includes(node.id);
                      const isCurrent = state.currentLevelId === node.id;
                      const isCompleted = state.completedLevels.includes(node.id) || node.id === "intro";
                      return (
                        <div key={node.id} onClick={() => { if (isUnlocked) { handleMapNodeJump(node.id); setMapOpen(false); } }}
                          className={`p-3.5 rounded-xl border transition-all text-left relative flex items-start gap-4 ${
                            isCurrent ? "bg-amber-950/20 border-amber-600/40 shadow-lg cursor-default"
                            : isUnlocked ? "bg-stone-900/60 hover:bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700 cursor-pointer"
                            : "bg-stone-950/40 border-stone-950 opacity-40 text-stone-600 cursor-not-allowed"
                          }`}>
                          <div className="mt-0.5 shrink-0">
                            {isCurrent ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-stone-950 font-bold animate-pulse">🕵️‍♂️</span>
                              : isCompleted ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950/70 border border-emerald-500/50 text-[10px] text-emerald-400 font-bold">✓</span>
                              : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 border border-stone-800 text-[10px] text-stone-600 font-mono">{index + 1}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono tracking-wider font-semibold uppercase ${isCurrent ? "text-amber-400" : isCompleted ? "text-stone-400" : "text-stone-600"}`}>📍 {node.locationName}</span>
                              {isCurrent && <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase font-bold animate-pulse">探索中</span>}
                            </div>
                            <h4 className={`text-sm mt-0.5 ${isCurrent ? "text-stone-100 font-bold" : isCompleted ? "text-stone-300" : "text-stone-500"}`}>{node.title}</h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-stone-800 flex justify-between items-center text-xs text-stone-500 shrink-0">
                <span>已解鎖校園地點：{state.unlockedLevels.length} / {LEVELS.length} 關卡</span>
                <span>系統已自動偵測為您存檔</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
