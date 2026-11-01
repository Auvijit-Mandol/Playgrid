import { CarDefinition, GameSettings, HighScoreRecord } from '../types/game';
import { INITIAL_CARS } from './carData';

const STORAGE_KEYS = {
  COINS: 'turbo_apex_coins',
  HIGH_SCORE: 'turbo_apex_highscore',
  SELECTED_CAR: 'turbo_apex_selected_car',
  CARS_DATA: 'turbo_apex_cars',
  SETTINGS: 'turbo_apex_settings',
};

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  controlMode: 'BUTTONS',
  track: 'NEON_CITY',
  tiltSensitivity: 1.0,
};

export function loadCoins(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.COINS);
    return val ? parseInt(val, 10) : 100; // 100 bonus starter coins
  } catch {
    return 100;
  }
}

export function saveCoins(coins: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COINS, coins.toString());
  } catch {}
}

export function loadHighScore(): HighScoreRecord {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    if (val) return JSON.parse(val);
  } catch {}
  return { score: 0, distance: 0, topSpeed: 0, date: '' };
}

export function saveHighScore(record: HighScoreRecord): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, JSON.stringify(record));
  } catch {}
}

export function loadSelectedCarId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CAR) || 'bolt';
  } catch {
    return 'bolt';
  }
}

export function saveSelectedCarId(carId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CAR, carId);
  } catch {}
}

export function loadCars(): CarDefinition[] {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.CARS_DATA);
    if (val) {
      const stored = JSON.parse(val) as CarDefinition[];
      // Merge with INITIAL_CARS to handle schema changes cleanly
      return INITIAL_CARS.map((initCar) => {
        const found = stored.find((c) => c.id === initCar.id);
        if (found) {
          return {
            ...initCar,
            unlocked: found.unlocked,
            upgrades: { ...initCar.upgrades, ...found.upgrades },
          };
        }
        return initCar;
      });
    }
  } catch {}
  return INITIAL_CARS;
}

export function saveCars(cars: CarDefinition[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CARS_DATA, JSON.stringify(cars));
  } catch {}
}

export function loadSettings(): GameSettings {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (val) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(val) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}
