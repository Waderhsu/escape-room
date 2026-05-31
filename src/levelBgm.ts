/**
 * Background music per level page.
 * Drop MP3 files into public/audio/bgm/ using the optional `src` path.
 * When the file is missing, procedural ambient plays instead.
 */
export type BgmProfile =
  | 'mystery-night'
  | 'alarm-tension'
  | 'investigation'
  | 'intermission'
  | 'dorm-warm'
  | 'art-elegant'
  | 'piano-room'
  | 'primary-innocent'
  | 'gym-final'
  | 'graduation';

export interface LevelBgmConfig {
  profile: BgmProfile;
  /** Optional MP3 override, e.g. /audio/bgm/20-graduation.mp3 (校歌可放這裡) */
  src?: string;
}

export const LEVEL_BGM: Record<string, LevelBgmConfig> = {
  intro: { profile: 'mystery-night', src: '/audio/bgm/01-mystery.mp3' },
  loc_gate: { profile: 'mystery-night', src: '/audio/bgm/02-gate.mp3' },
  loc_alarm: { profile: 'alarm-tension', src: '/audio/bgm/03-alarm.mp3' },
  loc_office_door: { profile: 'investigation', src: '/audio/bgm/04-office.mp3' },
  loc_safe: { profile: 'investigation', src: '/audio/bgm/05-safe.mp3' },
  loc_tablet: { profile: 'investigation', src: '/audio/bgm/06-tablet.mp3' },
  loc_star_map: { profile: 'investigation', src: '/audio/bgm/07-star-map.mp3' },
  loc_intermission1: { profile: 'intermission', src: '/audio/bgm/08-intermission.mp3' },
  loc_dorm_gate: { profile: 'dorm-warm', src: '/audio/bgm/09-dorm.mp3' },
  loc_dorm_lounge: { profile: 'dorm-warm', src: '/audio/bgm/10-lounge.mp3' },
  loc_intermission2: { profile: 'intermission', src: '/audio/bgm/11-intermission.mp3' },
  loc_art_mirror: { profile: 'art-elegant', src: '/audio/bgm/12-art.mp3' },
  loc_art_piano: { profile: 'piano-room', src: '/audio/bgm/13-piano.mp3' },
  loc_intermission3: { profile: 'intermission', src: '/audio/bgm/14-intermission.mp3' },
  loc_primary_grass: { profile: 'primary-innocent', src: '/audio/bgm/15-primary.mp3' },
  loc_explore_center: { profile: 'primary-innocent', src: '/audio/bgm/16-explore.mp3' },
  loc_intermission4: { profile: 'intermission', src: '/audio/bgm/17-intermission.mp3' },
  loc_gym_outer: { profile: 'gym-final', src: '/audio/bgm/18-gym.mp3' },
  loc_gym_inner: { profile: 'gym-final', src: '/audio/bgm/19-final-lock.mp3' },
  finish: { profile: 'graduation', src: '/audio/bgm/20-graduation.mp3' },
};

export function getLevelBgm(levelId: string): LevelBgmConfig {
  return LEVEL_BGM[levelId] ?? { profile: 'investigation' };
}
