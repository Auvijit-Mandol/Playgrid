import { Perk, PerkRarity } from '../types/game';

export const ALL_PERKS: Perk[] = [
  // COMMON
  {
    id: 'sharp_edge',
    name: 'Tempered Steel',
    description: 'Increases hero weapon attack power by +7.',
    rarity: 'common',
    icon: 'Sword',
  },
  {
    id: 'oak_bark',
    name: 'Ancient Bark',
    description: 'Increases Maximum HP by +25 and heals for 25 immediately.',
    rarity: 'common',
    icon: 'Heart',
  },
  {
    id: 'swift_shield',
    name: 'Aegis Ward',
    description: 'Hero starts each combat encounter with +15 bonus Shield.',
    rarity: 'common',
    icon: 'Shield',
  },
  {
    id: 'scavenger_eye',
    name: 'Scavenger Instinct',
    description: 'Collecting resources awards +10 bonus Coins and +2 Eco Shards.',
    rarity: 'common',
    icon: 'Coins',
  },

  // RARE
  {
    id: 'fire_chain',
    name: 'Fire Chain',
    description: 'Lava and burning tiles pulse fire damage to all enemies along their row.',
    rarity: 'rare',
    icon: 'Flame',
  },
  {
    id: 'toxic_blood',
    name: 'Toxic Metabolism',
    description: 'Hero is completely immune to poison, and poison hazards heal 6 HP instead.',
    rarity: 'rare',
    icon: 'Biohazard',
  },
  {
    id: 'healing_craft',
    name: 'Alchemical Surge',
    description: 'Crafting any item directly restores 15 HP and grants 5 Shield.',
    rarity: 'rare',
    icon: 'Sparkles',
  },
  {
    id: 'frozen_touch',
    name: 'Frostbite Shiver',
    description: 'Shifting water or ice next to an enemy freezes them for 1 turn (skips action).',
    rarity: 'rare',
    icon: 'Snowflake',
  },
  {
    id: 'thorn_vengeance',
    name: 'Briar Thorns',
    description: 'Reflects 15 true damage back whenever an enemy attacks your hero.',
    rarity: 'rare',
    icon: 'Zap',
  },

  // EPIC
  {
    id: 'resource_magnet',
    name: 'Resource Vortex',
    description: 'Resources and potions up to 2 tiles away are automatically drawn and collected.',
    rarity: 'epic',
    icon: 'Magnet',
  },
  {
    id: 'critical_shift',
    name: 'Momentum Strike',
    description: 'Every 3rd shift guarantees a 2.5x devastating Critical Hit on adjacent enemies.',
    rarity: 'epic',
    icon: 'Crosshair',
  },
  {
    id: 'shield_master',
    name: 'Bulwark Burst',
    description: 'Shields absorb 50% more damage. When shield breaks, shocks all enemies for 25 damage.',
    rarity: 'epic',
    icon: 'ShieldAlert',
  },
  {
    id: 'meteor_strike',
    name: 'Cinderfall Call',
    description: 'Every 5 shifts, summons a targeted meteor blast dealing 40 damage to the strongest enemy.',
    rarity: 'epic',
    icon: 'Flame',
  },

  // LEGENDARY
  {
    id: 'whirlwind_blade',
    name: 'Whirlwind Shift',
    description: 'Every shift triggers the hero to swing weapon in a 360° radius around themselves!',
    rarity: 'legendary',
    icon: 'RotateCw',
  },
  {
    id: 'elemental_overdrive',
    name: 'Gaia Awakening',
    description: 'Terrain becomes alive: Lava explodes for 30 dmg, Water shields you, Grass heals 8 HP.',
    rarity: 'legendary',
    icon: 'Sun',
  },
  {
    id: 'philosopher_spark',
    name: 'Philosopher Catalyst',
    description: 'Every craft duplicates the item and permanently boosts Hero Weapon Power by +3.',
    rarity: 'legendary',
    icon: 'Gem',
  },
];

/**
 * Returns 3 randomized perks without duplicates.
 */
export function getRandomPerks(existingPerkIds: string[]): Perk[] {
  // Filter out existing perks or allow up to 3 stacks
  const candidates = ALL_PERKS.filter(p => !existingPerkIds.includes(p.id) || p.rarity === 'common');
  
  // Weighted lottery: Common: 50%, Rare: 30%, Epic: 15%, Legendary: 5%
  const getWeight = (r: PerkRarity) => {
    switch (r) {
      case 'common': return 50;
      case 'rare': return 30;
      case 'epic': return 15;
      case 'legendary': return 5;
    }
  };

  const selected: Perk[] = [];
  const pool = [...candidates];

  while (selected.length < 3 && pool.length > 0) {
    const totalWeight = pool.reduce((acc, p) => acc + getWeight(p.rarity), 0);
    let rand = Math.random() * totalWeight;
    let chosenIdx = 0;

    for (let i = 0; i < pool.length; i++) {
      rand -= getWeight(pool[i].rarity);
      if (rand <= 0) {
        chosenIdx = i;
        break;
      }
    }

    selected.push(pool[chosenIdx]);
    pool.splice(chosenIdx, 1);
  }

  return selected;
}
