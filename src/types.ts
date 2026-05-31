export interface LevelInfo {
  id: string;
  title: string;
  locationName: string;
}

export interface GameState {
  currentLevelId: string;
  unlockedLevels: string[];
  isAlarmActive: boolean;
  alarmTimeLeft: number;
  dormGateSequence: string[];
  dormLoungeSolved: boolean;
  horcruxSolved: {
    dorm: boolean;
    art: boolean;
    primary: boolean;
  };
  hasCookie: boolean;
  hasPalette: boolean;
  hasStarCard: boolean;
  currentDormGateInputs: string[];
  completedLevels: string[];
}

export const LEVELS: LevelInfo[] = [
  { id: 'intro', title: '故事前言', locationName: '校外走廊' },
  { id: 'loc_gate', title: '深夜的警衛室大門', locationName: '校門口' },
  { id: 'loc_alarm', title: '系統緊急鎖定', locationName: '警衛室' },
  { id: 'loc_office_door', title: '遺落的行事曆', locationName: '九導辦公室門口' },
  { id: 'loc_safe', title: '辦公桌上的保險箱', locationName: '九導辦公室' },
  { id: 'loc_tablet', title: '嫌犯的信件 — 拼湊完美的圖騰', locationName: '九導辦公室' },
  { id: 'loc_star_map', title: '星芒的指引 — 疊合的真相', locationName: '星芒羅盤' },
  { id: 'loc_intermission1', title: '過場引導 — 第一站的抉擇', locationName: '通訊大廳' },
  { id: 'loc_dorm_gate', title: '那些奮鬥的日子', locationName: '宿舍大門' },
  { id: 'loc_dorm_lounge', title: '絕對平衡的置物櫃', locationName: '宿舍交誼廳' },
  { id: 'loc_intermission2', title: '嫌犯的監視與挑釁', locationName: '下一站的指引' },
  { id: 'loc_art_mirror', title: '倒影中的真相', locationName: '藝文館鏡牆' },
  { id: 'loc_art_piano', title: '無聲的旋律', locationName: '315 練琴室' },
  { id: 'loc_intermission3', title: '過場引導 — 聽見純真', locationName: '聽覺羅盤' },
  { id: 'loc_primary_grass', title: '時光日記', locationName: '小學樓草皮' },
  { id: 'loc_explore_center', title: '錯置的祝福', locationName: '探索中心' },
  { id: 'loc_intermission4', title: '過場引導 — 撕下面具的倒數', locationName: '通訊大廳' },
  { id: 'loc_gym_outer', title: '進擊的最終外鎖', locationName: '體育館大門' },
  { id: 'loc_gym_inner', title: '完美的人與終極內鎖', locationName: '體育館內' },
  { id: 'finish', title: '畢業驚喜揭曉', locationName: '體育館' },
];
