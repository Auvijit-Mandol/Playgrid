import { EnemyType, EnemyIntent, TileData } from '../types/game';

export interface EnemyStats {
  type: EnemyType;
  name: string;
  hp: number;
  damage: number;
  element: 'nature' | 'fire' | 'water' | 'earth' | 'magic';
  description: string;
}

export const ENEMY_REGISTRY: Record<EnemyType, EnemyStats> = {
  slime: {
    type: 'slime',
    name: 'Moss Slime',
    hp: 30,
    damage: 12,
    element: 'nature',
    description: 'Squishy woodland blob. Attacks directly adjacent targets.',
  },
  goblin: {
    type: 'goblin',
    name: 'Pouch Goblin',
    hp: 36,
    damage: 15,
    element: 'earth',
    description: 'Loves shiny resources. Steals adjacent wood or stone!',
  },
  spider: {
    type: 'spider',
    name: 'Toxic Arachnid',
    hp: 28,
    damage: 10,
    element: 'nature',
    description: 'Spits venomous toxin, inflicting poison over 3 turns.',
  },
  charger: {
    type: 'charger',
    name: 'Iron Boar',
    hp: 45,
    damage: 22,
    element: 'earth',
    description: 'Dashes along full rows or columns with relentless force.',
  },
  skeleton: {
    type: 'skeleton',
    name: 'Cursed Skeleton',
    hp: 38,
    damage: 16,
    element: 'magic',
    description: 'Ancient bones that reassemble once upon initial destruction.',
  },
  fire_elemental: {
    type: 'fire_elemental',
    name: 'Cinder Spark',
    hp: 42,
    damage: 18,
    element: 'fire',
    description: 'Living flame that can ignite adjacent terrain into molten lava.',
  },
  forest_guardian: {
    type: 'forest_guardian',
    name: 'Ancient Forest Guardian',
    hp: 160,
    damage: 24,
    element: 'nature',
    description: 'Ancient colossus of oak and stone. Locks board rows and casts Spore Blast.',
  },
  inferno_golem: {
    type: 'inferno_golem',
    name: 'Inferno Golem',
    hp: 180,
    damage: 28,
    element: 'fire',
    description: 'Molten titan that calls down devastating meteors and locks rows.',
  },
  frost_titan: {
    type: 'frost_titan',
    name: 'Glacial Overlord',
    hp: 190,
    damage: 26,
    element: 'water',
    description: 'Massive frozen entity that freezes board lanes and slides tiles.',
  },
};

/**
 * Creates a tile representation of an enemy
 */
export function createEnemyTile(enemyType: EnemyType, levelMultiplier: number = 1.0): TileData {
  const base = ENEMY_REGISTRY[enemyType];
  const hp = Math.round(base.hp * levelMultiplier);
  const dmg = Math.round(base.damage * levelMultiplier);

  return {
    id: `enemy_${enemyType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'enemy',
    category: 'enemy',
    enemyType,
    name: base.name,
    hp,
    maxHp: hp,
    damage: dmg,
    element: base.element,
    statusEffects: [],
    intent: {
      type: 'attack_adjacent',
      value: dmg,
      description: `Strikes adjacent tile for ${dmg} DMG`,
    },
  };
}

/**
 * Computes enemy intent based on relative board position of Hero
 */
export function computeEnemyIntent(
  enemy: TileData,
  eRow: number,
  eCol: number,
  hRow: number,
  hCol: number,
  turnCount: number
): EnemyIntent {
  const dmg = enemy.damage || 14;
  const isAdjacent = Math.abs(eRow - hRow) + Math.abs(eCol - hCol) === 1;

  // Boss mechanics
  if (enemy.enemyType === 'forest_guardian') {
    // Alternate between Row Lock, Spore Blast, and Direct Slam
    if (turnCount % 3 === 0) {
      return {
        type: 'boss_lock_row',
        value: 1,
        targetRow: hRow,
        description: `ROOT LOCK: Freezes row ${hRow + 1} from shifting next turn!`,
      };
    } else if (turnCount % 3 === 1) {
      return {
        type: 'boss_spore_blast',
        value: Math.round(dmg * 0.8),
        targetRow: eRow,
        description: `SPORE BURST: Blasts entire Row ${eRow + 1} for ${Math.round(dmg * 0.8)} DMG`,
      };
    } else {
      return {
        type: 'attack_adjacent',
        value: dmg,
        description: `TITAN SLAM: Deals ${dmg} DMG to all surrounding tiles`,
      };
    }
  }

  if (enemy.enemyType === 'inferno_golem') {
    if (turnCount % 3 === 0) {
      return {
        type: 'boss_meteor_strike',
        value: 35,
        targetRow: hRow,
        targetCol: hCol,
        description: `METEOR CALL: Targeting tile (${hRow + 1}, ${hCol + 1}) - explodes in 2 turns!`,
      };
    } else if (turnCount % 3 === 1) {
      return {
        type: 'boss_lock_row',
        value: 1,
        targetRow: eRow,
        description: `LAVA WELD: Melts row ${eRow + 1} preventing shift`,
      };
    } else {
      return {
        type: 'attack_adjacent',
        value: dmg,
        description: `MOLTEN FIST: Deals ${dmg} fire damage`,
      };
    }
  }

  // Charger: If aligned in same row or col, plans line charge!
  if (enemy.enemyType === 'charger') {
    if (eRow === hRow) {
      const dir = hCol > eCol ? 'right' : 'left';
      return {
        type: 'charge_line',
        value: Math.round(dmg * 1.3),
        direction: dir,
        description: `CHARGING ${dir.toUpperCase()} along Row ${eRow + 1} (${Math.round(dmg * 1.3)} DMG)`,
      };
    }
    if (eCol === hCol) {
      const dir = hRow > eRow ? 'down' : 'up';
      return {
        type: 'charge_line',
        value: Math.round(dmg * 1.3),
        direction: dir,
        description: `CHARGING ${dir.toUpperCase()} along Column ${eCol + 1} (${Math.round(dmg * 1.3)} DMG)`,
      };
    }
  }

  // Spider: Spits poison
  if (enemy.enemyType === 'spider') {
    return {
      type: 'poison_spit',
      value: dmg,
      description: `Spits venom: ${dmg} DMG + Poison over time`,
    };
  }

  // Goblin: Steals resource or attacks
  if (enemy.enemyType === 'goblin') {
    return {
      type: isAdjacent ? 'attack_adjacent' : 'steal_resource',
      value: dmg,
      description: isAdjacent ? `Sneak Attack for ${dmg} DMG` : 'Prowls for nearby resources to pilfer',
    };
  }

  // Slime & Default: Direct adjacent attack
  return {
    type: 'attack_adjacent',
    value: dmg,
    description: isAdjacent ? `Slime Bash for ${dmg} DMG` : `Wiggles into position (${dmg} DMG on contact)`,
  };
}
