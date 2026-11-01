import { BiomeType, TileData, WaveObjective, TileType } from '../types/game';
import { createEnemyTile, computeEnemyIntent } from './enemies';

export interface GeneratedWave {
  board: TileData[][];
  heroRow: number;
  heroCol: number;
  objective: WaveObjective;
  title: string;
}

function createResourceTile(type: 'wood' | 'stone' | 'herb' | 'metal' | 'crystal'): TileData {
  const names = {
    wood: 'Ancient Timber',
    stone: 'Granite Chunk',
    herb: 'Medicinal Herb',
    metal: 'Iron Ore',
    crystal: 'Arcane Crystal',
  };
  return {
    id: `res_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    category: 'resource',
    name: names[type],
  };
}

function createHazardTile(type: 'lava' | 'water' | 'ice' | 'poison_plant'): TileData {
  const names = {
    lava: 'Molten Lava',
    water: 'Pure Spring',
    ice: 'Glacial Ice',
    poison_plant: 'Thorn Bramble',
  };
  return {
    id: `haz_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    category: 'hazard',
    name: names[type],
  };
}

function createChestTile(): TileData {
  return {
    id: `chest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'chest',
    category: 'chest',
    name: 'Gilded Chest',
  };
}

export function generateWaveBoard(biome: BiomeType, waveNumber: number): GeneratedWave {
  const board: (TileData | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));
  
  // Hero always starts in center (2, 2)
  const heroRow = 2;
  const heroCol = 2;
  board[heroRow][heroCol] = {
    id: 'hero_tile',
    type: 'hero',
    category: 'hero',
    name: 'Hero',
  };

  const emptySlots: { r: number; c: number }[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (r !== heroRow || c !== heroCol) {
        emptySlots.push({ r, c });
      }
    }
  }

  // Shuffle empty slots
  for (let i = emptySlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [emptySlots[i], emptySlots[j]] = [emptySlots[j], emptySlots[i]];
  }

  const fillSlot = (tile: TileData) => {
    if (emptySlots.length > 0) {
      const slot = emptySlots.pop()!;
      board[slot.r][slot.c] = tile;
    }
  };

  let objective: WaveObjective;
  let waveTitle = '';

  if (waveNumber === 1) {
    waveTitle = 'Wave 1: Awakening Grove';
    objective = {
      type: 'defeat_all',
      target: 2,
      current: 0,
      description: 'Defeat all 2 slimes to clear the clearing!',
    };

    // 2 slimes
    fillSlot(createEnemyTile('slime', 1.0));
    fillSlot(createEnemyTile('slime', 1.0));

    // Crafting resources for players to combine: 2 woods (to make shield!), 2 herbs (potion)
    fillSlot(createResourceTile('wood'));
    fillSlot(createResourceTile('wood'));
    fillSlot(createResourceTile('herb'));
    fillSlot(createResourceTile('herb'));
    fillSlot(createResourceTile('stone'));
    fillSlot(createResourceTile('stone'));

    // 1 chest
    fillSlot(createChestTile());

    // Terrain
    fillSlot(createHazardTile('water'));
  } else if (waveNumber === 2) {
    waveTitle = 'Wave 2: Poison Thicket';
    objective = {
      type: 'defeat_all',
      target: 3,
      current: 0,
      description: 'Exterminate the spiders and thief goblin!',
    };

    fillSlot(createEnemyTile('spider', 1.1));
    fillSlot(createEnemyTile('spider', 1.1));
    fillSlot(createEnemyTile('goblin', 1.1));

    fillSlot(createResourceTile('wood'));
    fillSlot(createResourceTile('wood'));
    fillSlot(createResourceTile('stone'));
    fillSlot(createResourceTile('metal'));
    fillSlot(createResourceTile('herb'));

    fillSlot(createHazardTile(biome === 'volcano' ? 'lava' : 'poison_plant'));
    fillSlot(createHazardTile('water'));
    fillSlot(createChestTile());
  } else if (waveNumber === 3) {
    waveTitle = 'Wave 3: The Iron Stampede';
    objective = {
      type: 'defeat_all',
      target: 3,
      current: 0,
      description: 'Stop the Iron Boar Charger and armored skeleton!',
    };

    fillSlot(createEnemyTile('charger', 1.25));
    fillSlot(createEnemyTile('skeleton', 1.25));
    fillSlot(createEnemyTile(biome === 'volcano' ? 'fire_elemental' : 'goblin', 1.25));

    fillSlot(createResourceTile('wood'));
    fillSlot(createResourceTile('stone'));
    fillSlot(createResourceTile('metal'));
    fillSlot(createResourceTile('metal'));
    fillSlot(createResourceTile('crystal'));

    fillSlot(createChestTile());
    fillSlot(createHazardTile(biome === 'frozen' ? 'ice' : biome === 'volcano' ? 'lava' : 'poison_plant'));
  } else if (waveNumber === 4) {
    waveTitle = 'Wave 4: High Pressure Storm';
    objective = {
      type: 'survive_shifts',
      target: 12,
      current: 0,
      description: 'Survive 12 board shifts against relentless waves!',
    };

    fillSlot(createEnemyTile('charger', 1.3));
    fillSlot(createEnemyTile('spider', 1.3));
    fillSlot(createEnemyTile('skeleton', 1.3));
    fillSlot(createEnemyTile('slime', 1.3));

    fillSlot(createResourceTile('wood'));
    fillSlot(createResourceTile('herb'));
    fillSlot(createResourceTile('stone'));
    fillSlot(createResourceTile('crystal'));
    fillSlot(createResourceTile('metal'));

    fillSlot(createChestTile());
    fillSlot(createHazardTile(biome === 'volcano' ? 'lava' : 'water'));
  } else {
    // Wave 5: BOSS ENCOUNTER!
    const bossType = biome === 'volcano' ? 'inferno_golem' : biome === 'frozen' ? 'frost_titan' : 'forest_guardian';
    const bossNames = {
      forest_guardian: 'Ancient Forest Guardian',
      inferno_golem: 'Inferno Golem',
      frost_titan: 'Glacial Overlord',
    };
    waveTitle = `Wave 5: Boss - ${bossNames[bossType]}`;
    objective = {
      type: 'defeat_boss',
      target: 1,
      current: 0,
      description: `Vanquish the ${bossNames[bossType]}!`,
    };

    // Boss placed
    fillSlot(createEnemyTile(bossType, 1.4));
    // 2 minions
    fillSlot(createEnemyTile('slime', 1.2));
    fillSlot(createEnemyTile(biome === 'volcano' ? 'fire_elemental' : 'spider', 1.2));

    // Plenty of crafting materials for high-tier builds!
    fillSlot(createResourceTile('crystal'));
    fillSlot(createResourceTile('metal'));
    fillSlot(createResourceTile('metal'));
    fillSlot(createResourceTile('wood'));
    fillSlot(createResourceTile('wood'));
    fillSlot(createResourceTile('herb'));
    fillSlot(createResourceTile('stone'));
    fillSlot(createChestTile());

    fillSlot(createHazardTile(biome === 'volcano' ? 'lava' : biome === 'frozen' ? 'ice' : 'poison_plant'));
  }

  // Fill remaining empty tiles with random resources or terrain
  const fillerResources: ('wood' | 'stone' | 'herb' | 'metal')[] = ['wood', 'stone', 'herb', 'metal'];
  while (emptySlots.length > 0) {
    const slot = emptySlots.pop()!;
    const randType = fillerResources[Math.floor(Math.random() * fillerResources.length)];
    board[slot.r][slot.c] = createResourceTile(randType);
  }

  // Cast board to non-null and compute initial enemy intents
  const finalBoard = board as TileData[][];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const tile = finalBoard[r][c];
      if (tile && tile.category === 'enemy') {
        tile.intent = computeEnemyIntent(tile, r, c, heroRow, heroCol, 1);
      }
    }
  }

  return {
    board: finalBoard,
    heroRow,
    heroCol,
    objective,
    title: waveTitle,
  };
}

/**
 * Spawns a replacement tile when an enemy dies or item is collected
 */
export function createRandomFillerTile(biome: BiomeType): TileData {
  const roll = Math.random();
  if (roll < 0.35) {
    return createResourceTile('wood');
  } else if (roll < 0.6) {
    return createResourceTile('stone');
  } else if (roll < 0.8) {
    return createResourceTile('herb');
  } else if (roll < 0.92) {
    return createResourceTile('metal');
  } else if (roll < 0.97) {
    return createResourceTile('crystal');
  } else {
    return createHazardTile(biome === 'volcano' ? 'lava' : biome === 'frozen' ? 'ice' : 'water');
  }
}
