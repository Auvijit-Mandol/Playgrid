import { TileData, TileType } from '../types/game';

export interface CraftRecipe {
  inputA: TileType;
  inputB: TileType;
  resultType: TileType;
  resultName: string;
  category: 'item' | 'resource';
  description: string;
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    inputA: 'wood',
    inputB: 'wood',
    resultType: 'wooden_shield',
    resultName: 'Wooden Shield',
    category: 'item',
    description: 'Absorbs 25 incoming damage when acquired or adjacent.',
  },
  {
    inputA: 'stone',
    inputB: 'stone',
    resultType: 'stone_hammer',
    resultName: 'Stone Hammer',
    category: 'item',
    description: 'Heavy blunt weapon dealing 25 damage with stun chance.',
  },
  {
    inputA: 'herb',
    inputB: 'herb',
    resultType: 'potion',
    resultName: 'Healing Potion',
    category: 'item',
    description: 'Restores 35 Health when collected.',
  },
  {
    inputA: 'metal',
    inputB: 'metal',
    resultType: 'iron_blade',
    resultName: 'Iron Blade',
    category: 'item',
    description: 'Sharp tempered sword dealing 32 damage.',
  },
  {
    inputA: 'wood',
    inputB: 'stone',
    resultType: 'wooden_sword',
    resultName: 'Reinforced Club',
    category: 'item',
    description: 'Solid bludgeon dealing 22 damage.',
  },
  {
    inputA: 'crystal',
    inputB: 'metal',
    resultType: 'crystal_blade',
    resultName: 'Arcane Blade',
    category: 'item',
    description: 'Infused magical blade dealing 45 damage with shockwave.',
  },
  {
    inputA: 'crystal',
    inputB: 'wood',
    resultType: 'crystal_blade',
    resultName: 'Runed Staff',
    category: 'item',
    description: 'Mystic staff dealing 38 elemental damage.',
  },
];

export function findCraftMatch(typeA: TileType, typeB: TileType): CraftRecipe | null {
  for (const recipe of CRAFT_RECIPES) {
    if (
      (recipe.inputA === typeA && recipe.inputB === typeB) ||
      (recipe.inputA === typeB && recipe.inputB === typeA)
    ) {
      return recipe;
    }
  }
  return null;
}

export interface MergeResult {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  createdTile: TileData;
  recipeName: string;
}

/**
 * Scans a 5x5 board for adjacent pairs of craftable resources.
 * Returns array of merges to execute sequentially.
 */
export function detectBoardMerges(board: TileData[][]): MergeResult[] {
  const merges: MergeResult[] = [];
  const mergedCoords = new Set<string>();

  const isAvailable = (r: number, c: number) => {
    return !mergedCoords.has(`${r},${c}`) && board[r]?.[c]?.category === 'resource';
  };

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (!isAvailable(r, c)) continue;
      const tileA = board[r][c];

      // Check right neighbor
      if (c < 4 && isAvailable(r, c + 1)) {
        const tileB = board[r][c + 1];
        const recipe = findCraftMatch(tileA.type, tileB.type);
        if (recipe) {
          mergedCoords.add(`${r},${c}`);
          mergedCoords.add(`${r},${c + 1}`);
          merges.push({
            fromRow: r,
            fromCol: c + 1,
            toRow: r,
            toCol: c,
            recipeName: recipe.resultName,
            createdTile: {
              id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              type: recipe.resultType,
              category: recipe.category,
              name: recipe.resultName,
              damage: recipe.resultType === 'stone_hammer' ? 25 : recipe.resultType === 'iron_blade' ? 32 : recipe.resultType === 'crystal_blade' ? 42 : recipe.resultType === 'wooden_sword' ? 22 : undefined,
              durability: recipe.resultType === 'wooden_shield' ? 25 : undefined,
            },
          });
          continue;
        }
      }

      // Check down neighbor
      if (r < 4 && isAvailable(r + 1, c)) {
        const tileB = board[r + 1][c];
        const recipe = findCraftMatch(tileA.type, tileB.type);
        if (recipe) {
          mergedCoords.add(`${r},${c}`);
          mergedCoords.add(`${r + 1},${c}`);
          merges.push({
            fromRow: r + 1,
            fromCol: c,
            toRow: r,
            toCol: c,
            recipeName: recipe.resultName,
            createdTile: {
              id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              type: recipe.resultType,
              category: recipe.category,
              name: recipe.resultName,
              damage: recipe.resultType === 'stone_hammer' ? 25 : recipe.resultType === 'iron_blade' ? 32 : recipe.resultType === 'crystal_blade' ? 42 : recipe.resultType === 'wooden_sword' ? 22 : undefined,
              durability: recipe.resultType === 'wooden_shield' ? 25 : undefined,
            },
          });
          continue;
        }
      }
    }
  }

  return merges;
}
