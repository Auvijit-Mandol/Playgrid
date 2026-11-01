import { CarDefinition } from '../types/game';

export const INITIAL_CARS: CarDefinition[] = [
  {
    id: 'bolt',
    name: 'Street Bolt',
    tagline: 'Agile & reliable street racer',
    price: 0,
    unlocked: true,
    color: '#ef4444', // Red
    accentColor: '#f97316',
    glowColor: '#ef4444',
    stats: {
      speed: 6,
      accel: 6,
      handling: 7,
      shieldMax: 2,
      nitroCap: 5,
    },
    upgrades: {
      speed: 1,
      accel: 1,
      handling: 1,
      shieldMax: 1,
      nitroCap: 1,
    },
  },
  {
    id: 'phantom',
    name: 'Phantom GT',
    tagline: 'High-speed aerodynamic supercar',
    price: 800,
    unlocked: false,
    color: '#06b6d4', // Cyan
    accentColor: '#3b82f6',
    glowColor: '#06b6d4',
    stats: {
      speed: 9,
      accel: 8,
      handling: 6,
      shieldMax: 2,
      nitroCap: 7,
    },
    upgrades: {
      speed: 1,
      accel: 1,
      handling: 1,
      shieldMax: 1,
      nitroCap: 1,
    },
  },
  {
    id: 'titan',
    name: 'Titan Bruiser',
    tagline: 'Armored muscle car built for impact',
    price: 1800,
    unlocked: false,
    color: '#eab308', // Amber / Gold
    accentColor: '#f59e0b',
    glowColor: '#eab308',
    stats: {
      speed: 6,
      accel: 5,
      handling: 5,
      shieldMax: 4,
      nitroCap: 6,
    },
    upgrades: {
      speed: 1,
      accel: 1,
      handling: 1,
      shieldMax: 1,
      nitroCap: 1,
    },
  },
  {
    id: 'vortex',
    name: 'Vortex Apex',
    tagline: 'Hypercar with experimental nitro core',
    price: 3200,
    unlocked: false,
    color: '#a855f7', // Purple
    accentColor: '#ec4899',
    glowColor: '#c084fc',
    stats: {
      speed: 10,
      accel: 10,
      handling: 9,
      shieldMax: 3,
      nitroCap: 10,
    },
    upgrades: {
      speed: 1,
      accel: 1,
      handling: 1,
      shieldMax: 1,
      nitroCap: 1,
    },
  },
];

export const UPGRADE_COSTS: Record<number, number> = {
  1: 150,
  2: 300,
  3: 600,
  4: 1200,
  5: 2500,
};

export const MAX_UPGRADE_LEVEL = 5;
