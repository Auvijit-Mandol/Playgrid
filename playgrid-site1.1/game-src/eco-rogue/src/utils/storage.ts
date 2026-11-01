import { MetaProfile, HeroClass, BiomeType } from '../types/game';

const STORAGE_KEY = 'eco_rogue_profile_v1';

export const INITIAL_ACHIEVEMENTS = [
  {
    id: 'first_shift',
    title: 'First Shift',
    description: 'Perform your first row or column shift.',
    rewardType: 'coins' as const,
    rewardAmount: 50,
    completed: false,
    claimed: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'craft_shield',
    title: 'Carpenter Apprentice',
    description: 'Combine two Wood tiles to craft a Wooden Shield.',
    rewardType: 'ecoShards' as const,
    rewardAmount: 15,
    completed: false,
    claimed: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'slay_10',
    title: 'Pest Exterminator',
    description: 'Defeat 10 monsters across your runs.',
    rewardType: 'coins' as const,
    rewardAmount: 150,
    completed: false,
    claimed: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'first_boss',
    title: 'Titan Breaker',
    description: 'Defeat the Forest Guardian or any Biome Boss.',
    rewardType: 'gems' as const,
    rewardAmount: 10,
    completed: false,
    claimed: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'shift_100',
    title: 'World Weaver',
    description: 'Shift rows and columns 100 times.',
    rewardType: 'ecoShards' as const,
    rewardAmount: 30,
    completed: false,
    claimed: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'survive_run',
    title: 'Eco Master',
    description: 'Conquer all 5 waves and achieve victory.',
    rewardType: 'gems' as const,
    rewardAmount: 25,
    completed: false,
    claimed: false,
    progress: 0,
    maxProgress: 1,
  },
];

export const DEFAULT_PROFILE: MetaProfile = {
  ecoShards: 20, // generous starter shards so player can sample upgrade tree
  coins: 100,
  gems: 5,
  totalRuns: 0,
  victories: 0,
  monstersSlain: 0,
  itemsCrafted: 0,
  tilesShifted: 0,
  unlockedHeroes: ['wanderer', 'guardian'],
  selectedHero: 'wanderer',
  selectedBiome: 'forest',
  upgrades: {
    maxHpLevel: 0,
    startingShieldLevel: 0,
    attackPowerLevel: 0,
    resourceLuckLevel: 0,
    craftEfficiencyLevel: 0,
    revivesAvailable: 1,
  },
  achievements: INITIAL_ACHIEVEMENTS,
  soundEnabled: true,
  tutorialCompleted: false,
};

export function loadProfile(): MetaProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      upgrades: {
        ...DEFAULT_PROFILE.upgrades,
        ...(parsed.upgrades || {}),
      },
      achievements: DEFAULT_PROFILE.achievements.map((def) => {
        const found = (parsed.achievements || []).find((a: { id: string }) => a.id === def.id);
        return found ? { ...def, ...found } : def;
      }),
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: MetaProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export interface HeroDefinition {
  id: HeroClass;
  name: string;
  title: string;
  description: string;
  perkSummary: string;
  baseHp: number;
  baseShield: number;
  weaponName: string;
  weaponDamage: number;
  costShards: number;
  unlockedByDefault: boolean;
}

export const HEROES: HeroDefinition[] = [
  {
    id: 'wanderer',
    name: 'Rowen',
    title: 'Verdant Wanderer',
    description: 'A nimble forest scout who manipulates terrain with calm precision.',
    perkSummary: '+10% Critical strike chance. Attacks sweep adjacent enemies.',
    baseHp: 100,
    baseShield: 10,
    weaponName: 'Oakwood Broadsword',
    weaponDamage: 20,
    costShards: 0,
    unlockedByDefault: true,
  },
  {
    id: 'guardian',
    name: 'Theron',
    title: 'Iron Bastion',
    description: 'An armored warden with heavy plate and sturdy shields.',
    perkSummary: 'Starts with 25 bonus Shield. Shield absorbs 30% more damage.',
    baseHp: 120,
    baseShield: 25,
    weaponName: 'Heavy Halberd',
    weaponDamage: 18,
    costShards: 0,
    unlockedByDefault: true,
  },
  {
    id: 'ranger',
    name: 'Lyra',
    title: 'Gale Archer',
    description: 'A swift marksman who attacks across entire shifted rows.',
    perkSummary: 'Can strike enemies up to 2 tiles away along the current row.',
    baseHp: 90,
    baseShield: 5,
    weaponName: 'Windforce Longbow',
    weaponDamage: 24,
    costShards: 35,
    unlockedByDefault: false,
  },
  {
    id: 'pyromancer',
    name: 'Ignis',
    title: 'Cinder Weaver',
    description: 'A fiery invoker who turns lava and burning tiles into tactical weapons.',
    perkSummary: 'Immune to lava damage. Whenever a row shifts, ignites 1 random tile.',
    baseHp: 85,
    baseShield: 0,
    weaponName: 'Flamebrand Flail',
    weaponDamage: 26,
    costShards: 50,
    unlockedByDefault: false,
  },
  {
    id: 'engineer',
    name: 'Gizmo',
    title: 'Eco Artificer',
    description: 'A cunning craftsman who triggers chain reactions from resource combinations.',
    perkSummary: 'Crafting heals 8 HP and has 40% chance to produce an extra potion.',
    baseHp: 95,
    baseShield: 15,
    weaponName: 'Wrench & Hammer',
    weaponDamage: 19,
    costShards: 40,
    unlockedByDefault: false,
  },
];

export interface BiomeDefinition {
  id: BiomeType;
  name: string;
  themeTitle: string;
  description: string;
  hazards: string[];
  bossName: string;
  accentColor: string;
  bgGradient: string;
}

export const BIOMES: BiomeDefinition[] = [
  {
    id: 'forest',
    name: 'Deepwood Canopy',
    themeTitle: 'Forest Biome',
    description: 'Dense primeval grove teeming with wood, healing herbs, sly goblins, and poisonous thorns.',
    hazards: ['Poison Plants', 'Goblins (Resource Thieves)'],
    bossName: 'Ancient Forest Guardian',
    accentColor: '#10B981',
    bgGradient: 'from-emerald-950 via-slate-950 to-emerald-900',
  },
  {
    id: 'volcano',
    name: 'Obsidian Caldera',
    themeTitle: 'Volcano Biome',
    description: 'Volcanic fissures with molten lava rivers, exploding fire elementals, and fiery meteor strikes.',
    hazards: ['Lava Chasms', 'Meteor Warning Tiles'],
    bossName: 'Inferno Golem',
    accentColor: '#F97316',
    bgGradient: 'from-orange-950 via-slate-950 to-red-950',
  },
  {
    id: 'frozen',
    name: 'Glacial Spire',
    themeTitle: 'Frozen Biome',
    description: 'Permafrost realm with slick ice tiles that slide objects, frost spiders, and freezing cold.',
    hazards: ['Ice Patches (Wrap Slip)', 'Frostbite Traps'],
    bossName: 'Frost Titan',
    accentColor: '#06B6D4',
    bgGradient: 'from-cyan-950 via-slate-950 to-sky-950',
  },
];
