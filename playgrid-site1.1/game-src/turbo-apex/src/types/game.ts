export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GARAGE' | 'GAME_OVER' | 'HOW_TO_PLAY';

export type ControlMode = 'BUTTONS' | 'DRAG' | 'TILT';

export type TrackEnvironment = 'NEON_CITY' | 'DESERT_HIGHWAY' | 'RAINY_MIDNIGHT';

export type PowerUpType = 'nitro' | 'shield' | 'magnet' | 'time_warp' | 'coin' | 'wrench';

export type ObstacleType = 'sedan' | 'semi' | 'sports' | 'police' | 'oil_slick' | 'road_barrier' | 'pothole';

export interface CarStats {
  speed: number;       // Max speed 1-10
  accel: number;       // Acceleration rate 1-10
  handling: number;    // Steer responsiveness 1-10
  shieldMax: number;   // Max shield hits 1-5
  nitroCap: number;    // Nitro duration/boost 1-10
}

export interface CarDefinition {
  id: string;
  name: string;
  tagline: string;
  price: number;
  unlocked: boolean;
  color: string;
  accentColor: string;
  glowColor: string;
  stats: CarStats;
  upgrades: {
    speed: number;
    accel: number;
    handling: number;
    shieldMax: number;
    nitroCap: number;
  };
}

export interface ActivePowerUp {
  type: PowerUpType;
  remainingTime: number; // in seconds
  duration: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  controlMode: ControlMode;
  track: TrackEnvironment;
  tiltSensitivity: number; // 0.5 - 2.0
}

export interface HighScoreRecord {
  score: number;
  distance: number;
  topSpeed: number;
  date: string;
}

export interface GameStats {
  score: number;
  distance: number;
  speed: number;
  maxSpeedReached: number;
  coinsCollected: number;
  nearMissCount: number;
  comboMultiplier: number;
  health: number; // 0 - 100
  maxHealth: number;
  shieldHits: number;
  maxShieldHits: number;
  nitroFuel: number; // 0 - 100
  isNitroActive: boolean;
  timeRemainingSlowMo: number;
}
