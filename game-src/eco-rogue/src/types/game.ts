export type BiomeType = 'forest' | 'volcano' | 'frozen';

export type TileCategory = 
  | 'hero' 
  | 'resource' 
  | 'hazard' 
  | 'enemy' 
  | 'item' 
  | 'chest' 
  | 'terrain';

export type TileType = 
  | 'hero'
  | 'wood'
  | 'stone'
  | 'herb'
  | 'metal'
  | 'crystal'
  | 'water'
  | 'lava'
  | 'ice'
  | 'poison_plant'
  | 'enemy'
  | 'chest'
  | 'potion'
  | 'wooden_shield'
  | 'wooden_sword'
  | 'stone_hammer'
  | 'iron_blade'
  | 'crystal_blade';

export type EnemyType = 
  | 'slime'
  | 'goblin'
  | 'spider'
  | 'charger'
  | 'skeleton'
  | 'fire_elemental'
  | 'forest_guardian'
  | 'inferno_golem'
  | 'frost_titan';

export type IntentType = 
  | 'attack_adjacent'
  | 'charge_line'
  | 'steal_resource'
  | 'poison_spit'
  | 'ignite_area'
  | 'boss_lock_row'
  | 'boss_meteor_strike'
  | 'boss_spore_blast';

export interface EnemyIntent {
  type: IntentType;
  value: number; // damage or turns
  targetRow?: number;
  targetCol?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  description: string;
}

export interface StatusEffect {
  type: 'burn' | 'poison' | 'freeze' | 'shield' | 'regen' | 'stun';
  duration: number; // in turns
  intensity: number;
}

export interface TileData {
  id: string;
  type: TileType;
  category: TileCategory;
  name: string;
  hp?: number;
  maxHp?: number;
  damage?: number;
  enemyType?: EnemyType;
  intent?: EnemyIntent;
  statusEffects?: StatusEffect[];
  isRevived?: boolean; // for skeleton
  locked?: boolean;    // boss lock
  meteorTurns?: number; // meteor explosion warning
  element?: 'nature' | 'fire' | 'water' | 'earth' | 'magic';
  durability?: number;
}

export type HeroClass = 'wanderer' | 'ranger' | 'pyromancer' | 'guardian' | 'engineer';

export interface HeroEquipment {
  weapon: {
    id: string;
    name: string;
    damage: number;
    description: string;
    icon: string;
  };
  shield: {
    id: string;
    name: string;
    defense: number;
    durability: number;
    maxDurability: number;
    icon: string;
  } | null;
  utility: {
    id: string;
    name: string;
    description: string;
    icon: string;
  } | null;
}

export interface HeroState {
  classId: HeroClass;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  equipment: HeroEquipment;
  statusEffects: StatusEffect[];
  critChance: number; // 0..1
  turnsWithoutHit: number;
  shiftsCount: number;
}

export type PerkRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Perk {
  id: string;
  name: string;
  description: string;
  rarity: PerkRarity;
  icon: string;
  stackCount?: number;
}

export type WaveObjectiveType = 
  | 'defeat_all'
  | 'survive_shifts'
  | 'craft_items'
  | 'collect_resources'
  | 'defeat_boss';

export interface WaveObjective {
  type: WaveObjectiveType;
  target: number;
  current: number;
  description: string;
}

export interface FloatingText {
  id: string;
  x: number; // percentage in board or pixel
  y: number;
  text: string;
  color: string;
  scale?: number;
  type?: 'damage' | 'heal' | 'shield' | 'craft' | 'crit';
}

export type GameScreen = 
  | 'TITLE'
  | 'PLAYING'
  | 'PERK_CHOICE'
  | 'WAVE_CLEAR'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER'
  | 'UPGRADES'
  | 'HEROES'
  | 'ACHIEVEMENTS'
  | 'SETTINGS'
  | 'TUTORIAL';

export interface PermanentUpgrades {
  maxHpLevel: number;
  startingShieldLevel: number;
  attackPowerLevel: number;
  resourceLuckLevel: number;
  craftEfficiencyLevel: number;
  revivesAvailable: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardType: 'ecoShards' | 'coins' | 'gems';
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
  progress: number;
  maxProgress: number;
}

export interface MetaProfile {
  ecoShards: number;
  coins: number;
  gems: number;
  totalRuns: number;
  victories: number;
  monstersSlain: number;
  itemsCrafted: number;
  tilesShifted: number;
  unlockedHeroes: HeroClass[];
  selectedHero: HeroClass;
  selectedBiome: BiomeType;
  upgrades: PermanentUpgrades;
  achievements: Achievement[];
  soundEnabled: boolean;
  tutorialCompleted: boolean;
}
