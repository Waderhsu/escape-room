/**
 * Scene image paths — numbered to match LEVELS page order in types.ts.
 *
 * Page  | Level id              | File
 * ------|-----------------------|---------------------------
 *   1   | intro                 | (none)
 *   2   | loc_gate              | 02-gate.jpg
 *   3   | loc_alarm             | 03-alarm.jpg
 *   4   | loc_office_door       | 04-calendar.jpg
 *   5   | loc_safe              | 05-safe.jpg
 *   6   | loc_tablet            | 06-tablet-envelope.jpg
 *   7   | loc_star_map          | 07-star-map.png, 07-hint-map.png
 *   8   | loc_intermission1     | 08-location-choice.jpg
 *   9   | loc_dorm_gate         | 09-dorm-gate.jpg
 *  10   | loc_dorm_lounge       | 10-magic-square.jpg
 *  11   | loc_intermission2     | 11-location-choice.jpg
 *  12   | loc_art_mirror        | 12-mirror-postcard.png
 *  13   | loc_art_piano         | 13-sheet-music.jpg
 *  14   | loc_intermission3     | 14-location-choice.jpg
 *  15   | loc_primary_grass     | 15-lawn-diary.png
 *  16   | loc_explore_center    | 16-banner.png
 *  17   | loc_intermission4     | 17-location-choice.jpg
 *  18   | loc_gym_outer         | 18-gym-outer-lock.png
 *  19–20| loc_gym_inner, finish | (none)
 */
export const LEVEL_IMAGES = {
  gate: '/images/levels/02-gate.jpg',
  alarm: '/images/levels/03-alarm.jpg',
  calendar: '/images/levels/04-calendar.jpg',
  safe: '/images/levels/05-safe.jpg',
  tabletEnvelope: '/images/levels/06-tablet-envelope.jpg',
  starMap: '/images/levels/07-star-map.png',
  hintMap: '/images/levels/07-hint-map.png',
  locationChoice8: '/images/levels/08-location-choice.jpg',
  dormGate: '/images/levels/09-dorm-gate.jpg',
  magicSquare: '/images/levels/10-magic-square.jpg',
  locationChoice11: '/images/levels/11-location-choice.jpg',
  mirrorPostcard: '/images/levels/12-mirror-postcard.png',
  sheetMusic: '/images/levels/13-sheet-music.jpg',
  locationChoice14: '/images/levels/14-location-choice.jpg',
  lawnDiary: '/images/levels/15-lawn-diary.png',
  banner: '/images/levels/16-banner.png',
  locationChoice17: '/images/levels/17-location-choice.jpg',
  gymOuterLock: '/images/levels/18-gym-outer-lock.png',
} as const;
