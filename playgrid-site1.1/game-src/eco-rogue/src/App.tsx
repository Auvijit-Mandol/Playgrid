import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameScreen,
  HeroState,
  TileData,
  BiomeType,
  HeroClass,
  Perk,
  WaveObjective,
  FloatingText,
  MetaProfile,
  PermanentUpgrades,
} from './types/game';
import { sound } from './utils/audio';
import { loadProfile, saveProfile, HEROES, BIOMES } from './utils/storage';
import { generateWaveBoard, createRandomFillerTile } from './game/generator';
import { detectBoardMerges } from './game/crafting';
import { computeEnemyIntent } from './game/enemies';
import { getRandomPerks } from './game/perks';

import { TitleScreen } from './components/TitleScreen';
import { GameBoard } from './components/GameBoard';
import { PerkModal } from './components/PerkModal';
import { UpgradesModal } from './components/UpgradesModal';
import { HeroesModal } from './components/HeroesModal';
import { AchievementsModal } from './components/AchievementsModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { VictoryModal, GameOverModal } from './components/EndGameModals';

import { Heart, Shield, Sword, Volume2, VolumeX, Pause, Play, Sparkles, Coins, Trophy } from 'lucide-react';

export default function App() {
  // Persistent meta profile
  const [profile, setProfile] = useState<MetaProfile>(() => loadProfile());

  // Screen state
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [isMuted, setIsMuted] = useState<boolean>(() => !profile.soundEnabled);

  // Active run state
  const [waveNumber, setWaveNumber] = useState<number>(1);
  const [waveTitle, setWaveTitle] = useState<string>('');
  const [board, setBoard] = useState<TileData[][]>([]);
  const [heroRow, setHeroRow] = useState<number>(2);
  const [heroCol, setHeroCol] = useState<number>(2);
  const [hero, setHero] = useState<HeroState>(() => createInitialHero(profile.selectedHero, profile.upgrades));
  const [objective, setObjective] = useState<WaveObjective>({
    type: 'defeat_all',
    target: 2,
    current: 0,
    description: '',
  });

  // Turn processing & animation feedback
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);
  const [isLockedRow, setIsLockedRow] = useState<number | null>(null);
  const [screenShake, setScreenShake] = useState<number>(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Perks & Run rewards tracking
  const [activePerks, setActivePerks] = useState<Perk[]>([]);
  const [offeredPerks, setOfferedPerks] = useState<Perk[]>([]);
  const [rerollsLeft, setRerollsLeft] = useState<number>(1);
  const [runStats, setRunStats] = useState({
    monstersSlain: 0,
    itemsCrafted: 0,
    shiftsMade: 0,
    shardsEarned: 0,
    coinsEarned: 0,
    gemsEarned: 0,
    hasRevived: false,
  });

  // Save profile helper
  const updateProfile = useCallback((updater: (prev: MetaProfile) => MetaProfile) => {
    setProfile((prev) => {
      const next = updater(prev);
      saveProfile(next);
      return next;
    });
  }, []);

  // Sync mute state
  const handleToggleMute = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
    updateProfile((p) => ({ ...p, soundEnabled: !nextMute }));
  };

  // Screen shake decay loop
  useEffect(() => {
    if (screenShake > 0) {
      const timer = setTimeout(() => {
        setScreenShake((prev) => Math.max(0, prev - 1));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [screenShake]);

  // Floating text auto-removal
  const addFloatingText = (text: string, color: string, scale: number = 1.0) => {
    const id = `ft_${Date.now()}_${Math.random()}`;
    const x = 50 + (Math.random() - 0.5) * 30;
    const y = 50 + (Math.random() - 0.5) * 30;
    setFloatingTexts((prev) => [...prev, { id, text, color, x, y, scale }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  };

  function createInitialHero(heroClass: HeroClass, upgrades: PermanentUpgrades): HeroState {
    const def = HEROES.find((h) => h.id === heroClass) || HEROES[0];
    const maxHp = def.baseHp + (upgrades.maxHpLevel || 0) * 10;
    const startingShield = def.baseShield + (upgrades.startingShieldLevel || 0) * 8;
    const atkBonus = (upgrades.attackPowerLevel || 0) * 3;

    return {
      classId: heroClass,
      name: def.name,
      title: def.title,
      hp: maxHp,
      maxHp,
      shield: startingShield,
      maxShield: startingShield + 40,
      equipment: {
        weapon: {
          id: 'starter_weapon',
          name: def.weaponName,
          damage: def.weaponDamage + atkBonus,
          description: 'Standard issue hero armament.',
          icon: 'Sword',
        },
        shield: startingShield > 0 ? {
          id: 'starter_shield',
          name: 'Oak Ward',
          defense: startingShield,
          durability: startingShield,
          maxDurability: startingShield,
          icon: 'Shield',
        } : null,
        utility: null,
      },
      statusEffects: [],
      critChance: heroClass === 'wanderer' ? 0.2 : 0.1,
      turnsWithoutHit: 0,
      shiftsCount: 0,
    };
  }

  // Start new run
  const handleStartGame = () => {
    const initialHero = createInitialHero(profile.selectedHero, profile.upgrades);
    setHero(initialHero);
    setWaveNumber(1);
    setActivePerks([]);
    setRerollsLeft(1);
    setIsLockedRow(null);
    setRunStats({
      monstersSlain: 0,
      itemsCrafted: 0,
      shiftsMade: 0,
      shardsEarned: 0,
      coinsEarned: 0,
      gemsEarned: 0,
      hasRevived: false,
    });

    const generated = generateWaveBoard(profile.selectedBiome, 1);
    setBoard(generated.board);
    setHeroRow(generated.heroRow);
    setHeroCol(generated.heroCol);
    setObjective(generated.objective);
    setWaveTitle(generated.title);

    setScreen('PLAYING');
    sound.playShift();
  };

  // Next Wave Setup
  const handleAdvanceWave = (chosenPerk: Perk) => {
    const nextPerks = [...activePerks, chosenPerk];
    setActivePerks(nextPerks);

    // Apply immediate perk effects
    if (chosenPerk.id === 'oak_bark') {
      setHero((prev) => ({
        ...prev,
        maxHp: prev.maxHp + 25,
        hp: Math.min(prev.maxHp + 25, prev.hp + 25),
      }));
    } else if (chosenPerk.id === 'sharp_edge') {
      setHero((prev) => ({
        ...prev,
        equipment: {
          ...prev.equipment,
          weapon: {
            ...prev.equipment.weapon,
            damage: prev.equipment.weapon.damage + 7,
          },
        },
      }));
    } else if (chosenPerk.id === 'swift_shield') {
      setHero((prev) => ({
        ...prev,
        shield: prev.shield + 15,
      }));
    }

    const nextWaveNum = waveNumber + 1;
    setWaveNumber(nextWaveNum);
    setIsLockedRow(null);

    const generated = generateWaveBoard(profile.selectedBiome, nextWaveNum);
    setBoard(generated.board);
    setHeroRow(generated.heroRow);
    setHeroCol(generated.heroCol);
    setObjective(generated.objective);
    setWaveTitle(generated.title);

    setScreen('PLAYING');
    sound.playShift();
  };

  // Shift Row with Wraparound
  const handleShiftRow = (rowIdx: number, direction: 'left' | 'right') => {
    if (isProcessingTurn || isLockedRow === rowIdx || board.length === 0) return;
    executeTurn('row', rowIdx, direction);
  };

  // Shift Column with Wraparound
  const handleShiftCol = (colIdx: number, direction: 'up' | 'down') => {
    if (isProcessingTurn || board.length === 0) return;
    executeTurn('col', colIdx, direction);
  };

  // Core Turn Execution Pipeline (strictly deterministic)
  const executeTurn = (
    axis: 'row' | 'col',
    index: number,
    direction: 'left' | 'right' | 'up' | 'down'
  ) => {
    setIsProcessingTurn(true);
    sound.playShift();

    // Clone board state
    const nextBoard: TileData[][] = board.map((row) => [...row]);
    let currentHeroR = heroRow;
    let currentHeroC = heroCol;

    // STEP 1: Wrap-around Shift
    if (axis === 'row') {
      const oldRow = nextBoard[index];
      if (direction === 'right') {
        const wrapped = [oldRow[4], oldRow[0], oldRow[1], oldRow[2], oldRow[3]];
        nextBoard[index] = wrapped;
        if (heroRow === index) {
          currentHeroC = (currentHeroC + 1) % 5;
        }
      } else {
        const wrapped = [oldRow[1], oldRow[2], oldRow[3], oldRow[4], oldRow[0]];
        nextBoard[index] = wrapped;
        if (heroRow === index) {
          currentHeroC = (currentHeroC + 4) % 5;
        }
      }
    } else {
      if (direction === 'down') {
        const temp = nextBoard[4][index];
        for (let r = 4; r > 0; r--) {
          nextBoard[r][index] = nextBoard[r - 1][index];
        }
        nextBoard[0][index] = temp;
        if (heroCol === index) {
          currentHeroR = (currentHeroR + 1) % 5;
        }
      } else {
        const temp = nextBoard[0][index];
        for (let r = 0; r < 4; r++) {
          nextBoard[r][index] = nextBoard[r + 1][index];
        }
        nextBoard[4][index] = temp;
        if (heroCol === index) {
          currentHeroR = (currentHeroR + 4) % 5;
        }
      }
    }

    setHeroRow(currentHeroR);
    setHeroCol(currentHeroC);

    const shiftsCount = hero.shiftsCount + 1;
    let newHeroHp = hero.hp;
    let newHeroShield = hero.shield;
    let newWeaponDmg = hero.equipment.weapon.damage;
    let monstersKilledThisTurn = 0;
    let itemsCraftedThisTurn = 0;
    let shardsGained = 0;
    let coinsGained = 0;

    // STEP 2: Automatic Crafting combinations
    const merges = detectBoardMerges(nextBoard);
    if (merges.length > 0) {
      sound.playCraft();
      merges.forEach((m) => {
        itemsCraftedThisTurn += 1;
        // Place merged result in destination and replace source with fresh resource
        nextBoard[m.toRow][m.toCol] = m.createdTile;
        nextBoard[m.fromRow][m.fromCol] = createRandomFillerTile(profile.selectedBiome);

        addFloatingText(`Crafted ${m.recipeName}!`, '#FBBF24', 1.1);

        // Perk: Alchemical Surge / Healing Craft
        if (activePerks.some((p) => p.id === 'healing_craft')) {
          newHeroHp = Math.min(hero.maxHp, newHeroHp + 15);
          newHeroShield = Math.min(hero.maxShield, newHeroShield + 5);
          addFloatingText('+15 HP Alchemical Surge', '#34D399');
        }
        // Perk: Philosopher Catalyst
        if (activePerks.some((p) => p.id === 'philosopher_spark')) {
          newWeaponDmg += 3;
          addFloatingText('+3 Permanent Weapon Power', '#C084FC');
        }
      });
    }

    // STEP 3: Hero Interactions with Adjacent Orthogonal Tiles
    const hasWhirlwind = activePerks.some((p) => p.id === 'whirlwind_blade');
    const isCritTurn = activePerks.some((p) => p.id === 'critical_shift') && shiftsCount % 3 === 0;

    const adjacentCoords: { r: number; c: number }[] = [];
    if (hasWhirlwind) {
      // 3x3 surrounding tiles
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = (currentHeroR + dr + 5) % 5;
          const nc = (currentHeroC + dc + 5) % 5;
          adjacentCoords.push({ r: nr, c: nc });
        }
      }
    } else {
      // 4 orthogonal neighbors
      const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      deltas.forEach(([dr, dc]) => {
        const nr = currentHeroR + dr;
        const nc = currentHeroC + dc;
        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
          adjacentCoords.push({ r: nr, c: nc });
        }
      });
    }

    adjacentCoords.forEach(({ r, c }) => {
      const tile = nextBoard[r][c];
      if (!tile) return;

      // Hero attacks enemy
      if (tile.category === 'enemy' && tile.hp !== undefined) {
        const isCrit = isCritTurn || Math.random() < hero.critChance;
        const dmg = Math.round(newWeaponDmg * (isCrit ? 2.5 : 1.0));
        tile.hp -= dmg;

        sound.playHit(isCrit);
        setScreenShake(isCrit ? 4 : 2);
        addFloatingText(isCrit ? `CRIT! -${dmg}` : `-${dmg}`, isCrit ? '#F59E0B' : '#EF4444', isCrit ? 1.4 : 1.0);

        if (tile.hp <= 0) {
          // Skeleton revive check
          if (tile.enemyType === 'skeleton' && !tile.isRevived) {
            tile.isRevived = true;
            tile.hp = Math.round(tile.maxHp! * 0.5);
            addFloatingText('SKELETON REANIMATED!', '#38BDF8', 1.1);
          } else {
            // Defeated
            sound.playEnemyDeath();
            monstersKilledThisTurn += 1;
            const dropShards = tile.enemyType?.startsWith('boss') ? 25 : 3;
            const dropCoins = tile.enemyType?.startsWith('boss') ? 60 : 15;
            shardsGained += dropShards;
            coinsGained += dropCoins;

            addFloatingText(`+${dropShards} Shards · +${dropCoins} Coins`, '#10B981');
            nextBoard[r][c] = createRandomFillerTile(profile.selectedBiome);
          }
        }
      }

      // Collect Potions
      if (tile.type === 'potion') {
        sound.playCollect();
        newHeroHp = Math.min(hero.maxHp, newHeroHp + 35);
        addFloatingText('+35 HP', '#10B981', 1.2);
        nextBoard[r][c] = createRandomFillerTile(profile.selectedBiome);
      }

      // Equip Shields
      if (tile.type === 'wooden_shield') {
        sound.playBlock();
        newHeroShield = Math.min(hero.maxShield, newHeroShield + 25);
        addFloatingText('+25 Shield', '#FBBF24', 1.1);
        nextBoard[r][c] = createRandomFillerTile(profile.selectedBiome);
      }

      // Equip Weapons
      if (tile.type === 'wooden_sword' || tile.type === 'stone_hammer' || tile.type === 'iron_blade' || tile.type === 'crystal_blade') {
        sound.playCollect();
        const boost = tile.damage || 15;
        newWeaponDmg = Math.max(newWeaponDmg, boost);
        addFloatingText(`Equipped ${tile.name} (+${boost} ATK)`, '#38BDF8', 1.1);
        nextBoard[r][c] = createRandomFillerTile(profile.selectedBiome);
      }

      // Loot Chests
      if (tile.type === 'chest') {
        sound.playCollect();
        coinsGained += 35;
        shardsGained += 8;
        addFloatingText('+35 Coins · +8 Shards!', '#F59E0B', 1.3);
        nextBoard[r][c] = createRandomFillerTile(profile.selectedBiome);
      }

      // Gather Resources (Wood/Stone/Herb/Metal/Crystal)
      if (tile.category === 'resource') {
        coinsGained += 5;
        if (tile.type === 'crystal') shardsGained += 2;
      }
    });

    // STEP 4: Environmental Hazards
    const adjacentTerrainDeltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    adjacentTerrainDeltas.forEach(([dr, dc]) => {
      const nr = currentHeroR + dr;
      const nc = currentHeroC + dc;
      if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
        const tile = nextBoard[nr][nc];
        if (tile?.type === 'lava' && hero.classId !== 'pyromancer') {
          const lavaDmg = 12;
          if (newHeroShield > 0) {
            newHeroShield = Math.max(0, newHeroShield - lavaDmg);
          } else {
            newHeroHp = Math.max(0, newHeroHp - lavaDmg);
          }
          addFloatingText(`Lava Burn -${lavaDmg}`, '#EA580C');
        }
        if (tile?.type === 'poison_plant') {
          if (activePerks.some((p) => p.id === 'toxic_blood')) {
            newHeroHp = Math.min(hero.maxHp, newHeroHp + 6);
            addFloatingText('+6 HP (Toxic Metabolism)', '#34D399');
          } else {
            newHeroHp = Math.max(0, newHeroHp - 8);
            addFloatingText('Poison Thorns -8 HP', '#A855F7');
          }
        }
      }
    });

    // STEP 5: Enemy Actions & Intents
    let nextLockedRow: number | null = null;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const enemy = nextBoard[r][c];
        if (enemy && enemy.category === 'enemy' && enemy.intent && enemy.hp! > 0) {
          const isAdjacentToHero = Math.abs(r - currentHeroR) + Math.abs(c - currentHeroC) === 1;

          // Charger line charge
          if (enemy.enemyType === 'charger') {
            if (r === currentHeroR || c === currentHeroC) {
              const chargeDmg = enemy.intent.value;
              let finalDmg = chargeDmg;
              if (newHeroShield > 0) {
                const absorbed = Math.min(newHeroShield, finalDmg);
                newHeroShield -= absorbed;
                finalDmg -= absorbed;
              }
              newHeroHp = Math.max(0, newHeroHp - finalDmg);
              sound.playHit();
              addFloatingText(`Boar Charge -${chargeDmg}!`, '#EA580C', 1.2);
            }
          } else if (enemy.intent.type === 'boss_lock_row' && enemy.intent.targetRow !== undefined) {
            nextLockedRow = enemy.intent.targetRow;
            sound.playWarning();
            addFloatingText(`Row ${nextLockedRow + 1} ROOT LOCKED!`, '#EF4444', 1.2);
          } else if (isAdjacentToHero) {
            // Slime / Goblin / Boss adjacent hit
            const enemyDmg = enemy.intent.value;
            let finalDmg = enemyDmg;

            if (newHeroShield > 0) {
              const absorbed = Math.min(newHeroShield, finalDmg);
              newHeroShield -= absorbed;
              finalDmg -= absorbed;
              sound.playBlock();
            } else {
              sound.playHit();
            }

            newHeroHp = Math.max(0, newHeroHp - finalDmg);
            addFloatingText(`-${enemyDmg}`, '#EF4444');

            // Perk: Briar Thorns
            if (activePerks.some((p) => p.id === 'thorn_vengeance') && enemy.hp !== undefined) {
              enemy.hp -= 15;
              addFloatingText('Thorns 15 reflected', '#10B981');
            }
          }
        }
      }
    }

    setIsLockedRow(nextLockedRow);

    // STEP 6: Recompute Enemy Intents for the Next Turn
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const enemy = nextBoard[r][c];
        if (enemy && enemy.category === 'enemy' && enemy.hp! > 0) {
          enemy.intent = computeEnemyIntent(enemy, r, c, currentHeroR, currentHeroC, shiftsCount);
        }
      }
    }

    // STEP 7: Update Hero & Run Stats
    setHero((prev) => ({
      ...prev,
      hp: newHeroHp,
      shield: newHeroShield,
      shiftsCount,
      equipment: {
        ...prev.equipment,
        weapon: {
          ...prev.equipment.weapon,
          damage: newWeaponDmg,
        },
      },
    }));

    setBoard(nextBoard);

    // Update cumulative achievements and profile
    updateProfile((p) => {
      const nextMonsters = p.monstersSlain + monstersKilledThisTurn;
      const nextCrafts = p.itemsCrafted + itemsCraftedThisTurn;
      const nextShifts = p.tilesShifted + 1;
      const nextCoins = p.coins + coinsGained;
      const nextShards = p.ecoShards + shardsGained;

      const updatedAchievements = p.achievements.map((ach) => {
        if (ach.id === 'first_shift') return { ...ach, progress: 1 };
        if (ach.id === 'craft_shield' && itemsCraftedThisTurn > 0) return { ...ach, progress: 1 };
        if (ach.id === 'slay_10') return { ...ach, progress: Math.min(10, nextMonsters) };
        if (ach.id === 'shift_100') return { ...ach, progress: Math.min(100, nextShifts) };
        return ach;
      });

      return {
        ...p,
        coins: nextCoins,
        ecoShards: nextShards,
        monstersSlain: nextMonsters,
        itemsCrafted: nextCrafts,
        tilesShifted: nextShifts,
        achievements: updatedAchievements,
      };
    });

    setRunStats((prev) => ({
      ...prev,
      monstersSlain: prev.monstersSlain + monstersKilledThisTurn,
      itemsCrafted: prev.itemsCrafted + itemsCraftedThisTurn,
      shiftsMade: prev.shiftsMade + 1,
      shardsEarned: prev.shardsEarned + shardsGained,
      coinsEarned: prev.coinsEarned + coinsGained,
    }));

    // STEP 8: Check Objective Completion or Hero Death
    setTimeout(() => {
      setIsProcessingTurn(false);

      if (newHeroHp <= 0) {
        sound.playGameOver();
        setScreen('GAME_OVER');
        return;
      }

      // Count remaining enemies on board
      let remainingEnemies = 0;
      let bossAlive = false;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (nextBoard[r][c]?.category === 'enemy' && nextBoard[r][c].hp! > 0) {
            remainingEnemies++;
            if (nextBoard[r][c].enemyType?.startsWith('boss') || nextBoard[r][c].enemyType === 'forest_guardian' || nextBoard[r][c].enemyType === 'inferno_golem' || nextBoard[r][c].enemyType === 'frost_titan') {
              bossAlive = true;
            }
          }
        }
      }

      let isWaveCompleted = false;
      if (objective.type === 'defeat_all' && remainingEnemies === 0) {
        isWaveCompleted = true;
      } else if (objective.type === 'survive_shifts' && shiftsCount >= objective.target) {
        isWaveCompleted = true;
      } else if (objective.type === 'defeat_boss' && !bossAlive) {
        isWaveCompleted = true;
      }

      if (isWaveCompleted) {
        if (waveNumber >= 5) {
          // Conquered all waves! Victory!
          sound.playVictory();
          updateProfile((p) => ({
            ...p,
            victories: p.victories + 1,
            gems: p.gems + 10,
            ecoShards: p.ecoShards + 50,
            coins: p.coins + 180,
            achievements: p.achievements.map((a) =>
              a.id === 'first_boss' || a.id === 'survive_run' ? { ...a, progress: 1 } : a
            ),
          }));
          setRunStats((prev) => ({
            ...prev,
            shardsEarned: prev.shardsEarned + 50,
            coinsEarned: prev.coinsEarned + 180,
            gemsEarned: prev.gemsEarned + 10,
          }));
          setScreen('VICTORY');
        } else {
          // Offer 3 perks
          sound.playPerkSelect();
          const existingIds = activePerks.map((p) => p.id);
          const perks = getRandomPerks(existingIds);
          setOfferedPerks(perks);
          setScreen('PERK_CHOICE');
        }
      }
    }, 200);
  };

  // Rewarded Revive Handler
  const handleRevive = () => {
    sound.playPerkSelect();
    setHero((prev) => ({
      ...prev,
      hp: Math.round(prev.maxHp * 0.5),
      shield: 20,
    }));
    setRunStats((prev) => ({ ...prev, hasRevived: true }));
    setScreen('PLAYING');
    addFloatingText('PHOENIX REVIVE!', '#F59E0B', 1.4);
  };

  // Upgrades purchase
  const handleUpgradeTalent = (key: keyof PermanentUpgrades, costShards: number, costCoins: number) => {
    if (profile.ecoShards < costShards || profile.coins < costCoins) return;
    sound.playCraft();
    updateProfile((p) => ({
      ...p,
      ecoShards: p.ecoShards - costShards,
      coins: p.coins - costCoins,
      upgrades: {
        ...p.upgrades,
        [key]: (p.upgrades[key] || 0) + 1,
      },
    }));
  };

  // Unlock hero
  const handleUnlockHero = (heroId: HeroClass, cost: number) => {
    if (profile.ecoShards < cost) return;
    sound.playPerkSelect();
    updateProfile((p) => ({
      ...p,
      ecoShards: p.ecoShards - cost,
      unlockedHeroes: [...p.unlockedHeroes, heroId],
      selectedHero: heroId,
    }));
  };

  // Claim achievement
  const handleClaimAchievement = (achId: string) => {
    sound.playCollect();
    updateProfile((p) => {
      const ach = p.achievements.find((a) => a.id === achId);
      if (!ach || ach.claimed) return p;

      let nextCoins = p.coins;
      let nextShards = p.ecoShards;
      let nextGems = p.gems;

      if (ach.rewardType === 'gems') nextGems += ach.rewardAmount;
      if (ach.rewardType === 'ecoShards') nextShards += ach.rewardAmount;
      if (ach.rewardType === 'coins') nextCoins += ach.rewardAmount;

      return {
        ...p,
        coins: nextCoins,
        ecoShards: nextShards,
        gems: nextGems,
        achievements: p.achievements.map((a) => (a.id === achId ? { ...a, claimed: true } : a)),
      };
    });
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between overflow-hidden relative select-none">
      {/* Active Screen Routing */}
      {screen === 'TITLE' && (
        <TitleScreen
          profile={profile}
          selectedHero={profile.selectedHero}
          selectedBiome={profile.selectedBiome}
          onSelectHero={(h) => updateProfile((p) => ({ ...p, selectedHero: h }))}
          onSelectBiome={(b) => updateProfile((p) => ({ ...p, selectedBiome: b }))}
          onStartGame={handleStartGame}
          onOpenUpgrades={() => setScreen('UPGRADES')}
          onOpenHeroes={() => setScreen('HEROES')}
          onOpenAchievements={() => setScreen('ACHIEVEMENTS')}
          onOpenTutorial={() => setScreen('TUTORIAL')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* ACTIVE PLAYING VIEW (HUD + 5x5 BOARD + PERIMETERS) */}
      {(screen === 'PLAYING' || screen === 'PAUSED') && (
        <div className="w-full h-full min-h-screen flex flex-col justify-between items-center p-3 sm:p-5 max-w-xl mx-auto">
          {/* Top Perimeter HUD: Wave, HP, Shield, Currencies, Mute, Pause */}
          <header className="w-full flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80 text-xs">
            {/* Wave & Biome */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Wave {waveNumber}/5 · {profile.selectedBiome.toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-white tracking-tight truncate max-w-[130px] sm:max-w-[180px]">
                {waveTitle}
              </span>
            </div>

            {/* Health & Shield Bar Cluster */}
            <div className="flex items-center gap-3">
              {/* HP Meter */}
              <div className="flex items-center gap-1.5" title={`HP: ${hero.hp}/${hero.maxHp}`}>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                <div className="flex flex-col">
                  <div className="w-18 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-rose-500 transition-all duration-200"
                      style={{ width: `${Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100))}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono tabular-nums text-slate-300">
                    {hero.hp}/{hero.maxHp}
                  </span>
                </div>
              </div>

              {/* Shield Meter */}
              <div className="flex items-center gap-1.5" title={`Shield: ${hero.shield}`}>
                <Shield className="w-4 h-4 text-amber-400 fill-amber-400/40 shrink-0" />
                <div className="flex flex-col">
                  <div className="w-14 sm:w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-amber-400 transition-all duration-200"
                      style={{ width: `${Math.max(0, Math.min(100, (hero.shield / hero.maxShield) * 100))}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono tabular-nums text-amber-300">
                    {hero.shield}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls Cluster */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleMute}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                onClick={() => setScreen(screen === 'PAUSED' ? 'PLAYING' : 'PAUSED')}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Pause"
              >
                {screen === 'PAUSED' ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
          </header>

          {/* Active Objective Pill Bar */}
          <div className="w-full my-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{objective.description}</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 font-bold shrink-0">
              Turn {hero.shiftsCount}
            </div>
          </div>

          {/* 5x5 Battlefield Grid Component */}
          <div className="flex-1 flex items-center justify-center w-full my-auto">
            <GameBoard
              board={board}
              hero={hero}
              heroRow={heroRow}
              heroCol={heroCol}
              biome={profile.selectedBiome}
              floatingTexts={floatingTexts}
              isLockedRow={isLockedRow}
              onShiftRow={handleShiftRow}
              onShiftCol={handleShiftCol}
              isProcessingTurn={isProcessingTurn}
              screenShake={screenShake}
            />
          </div>

          {/* Bottom Perimeter: Equipment & Active Perks Strip */}
          <footer className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            {/* Active Weapon */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <Sword className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Weapon</div>
                <div className="text-xs font-bold text-white font-mono tabular-nums">
                  {hero.equipment.weapon.name} ({hero.equipment.weapon.damage} ATK)
                </div>
              </div>
            </div>

            {/* Run Bank: Shards & Coins */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="tabular-nums">+{runStats.shardsEarned}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Coins className="w-3.5 h-3.5" />
                <span className="tabular-nums">+{runStats.coinsEarned}</span>
              </div>
            </div>

            {/* Active Perks Count */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-medium font-mono">{activePerks.length} Boons</span>
            </div>
          </footer>
        </div>
      )}

      {/* PAUSE MODAL */}
      {screen === 'PAUSED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-white tracking-tight mb-2">Expedition Paused</h2>
            <p className="text-xs text-slate-400 mb-6">
              Take a breath. Plan your shifts and predict enemy intents.
            </p>
            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => setScreen('PLAYING')}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all"
              >
                Resume Run
              </button>
              <button
                onClick={() => setScreen('TITLE')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Abandon &amp; Return to Camp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERK CHOICE MODAL */}
      {screen === 'PERK_CHOICE' && (
        <PerkModal
          perks={offeredPerks}
          waveNumber={waveNumber}
          onSelectPerk={handleAdvanceWave}
          onReroll={() => {
            if (rerollsLeft > 0) {
              setRerollsLeft((r) => r - 1);
              const existingIds = activePerks.map((p) => p.id);
              setOfferedPerks(getRandomPerks(existingIds));
            }
          }}
          rerollsLeft={rerollsLeft}
        />
      )}

      {/* VICTORY MODAL */}
      {screen === 'VICTORY' && (
        <VictoryModal
          wave={waveNumber}
          monstersSlain={runStats.monstersSlain}
          itemsCrafted={runStats.itemsCrafted}
          shiftsMade={runStats.shiftsMade}
          shardsEarned={runStats.shardsEarned}
          coinsEarned={runStats.coinsEarned}
          gemsEarned={runStats.gemsEarned}
          onNewRun={handleStartGame}
          onOpenUpgrades={() => setScreen('UPGRADES')}
        />
      )}

      {/* GAME OVER MODAL */}
      {screen === 'GAME_OVER' && (
        <GameOverModal
          wave={waveNumber}
          monstersSlain={runStats.monstersSlain}
          itemsCrafted={runStats.itemsCrafted}
          shiftsMade={runStats.shiftsMade}
          shardsEarned={runStats.shardsEarned}
          coinsEarned={runStats.coinsEarned}
          canRevive={!runStats.hasRevived && (profile.upgrades.revivesAvailable > 0)}
          onRevive={handleRevive}
          onRetry={handleStartGame}
          onOpenUpgrades={() => setScreen('UPGRADES')}
        />
      )}

      {/* UPGRADES MODAL */}
      {screen === 'UPGRADES' && (
        <UpgradesModal
          profile={profile}
          onUpgrade={handleUpgradeTalent}
          onClose={() => setScreen('TITLE')}
        />
      )}

      {/* HEROES MODAL */}
      {screen === 'HEROES' && (
        <HeroesModal
          profile={profile}
          onSelectHero={(h) => updateProfile((p) => ({ ...p, selectedHero: h }))}
          onUnlockHero={handleUnlockHero}
          onClose={() => setScreen('TITLE')}
        />
      )}

      {/* ACHIEVEMENTS MODAL */}
      {screen === 'ACHIEVEMENTS' && (
        <AchievementsModal
          profile={profile}
          onClaimReward={handleClaimAchievement}
          onClose={() => setScreen('TITLE')}
        />
      )}

      {/* TUTORIAL OVERLAY */}
      {screen === 'TUTORIAL' && (
        <TutorialOverlay
          onComplete={() => {
            updateProfile((p) => ({ ...p, tutorialCompleted: true }));
            setScreen('TITLE');
          }}
        />
      )}
    </div>
  );
}
