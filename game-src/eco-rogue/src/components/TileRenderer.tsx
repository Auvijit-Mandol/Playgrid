import React from 'react';
import { TileData, EnemyIntent, HeroClass } from '../types/game';
import { Shield, Sparkles, Flame, Droplets, Snowflake, Skull, Lock } from 'lucide-react';

interface TileRendererProps {
  tile: TileData;
  isHeroAdjacent?: boolean;
  heroClass?: HeroClass;
  isHeroTurn?: boolean;
}

export const TileRenderer: React.FC<TileRendererProps> = ({
  tile,
  isHeroAdjacent,
  heroClass = 'wanderer',
}) => {
  // Renders the specific icon / graphic based on tile type
  const renderGraphic = () => {
    switch (tile.type) {
      case 'hero':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Ambient Aura */}
            <div className="absolute inset-1 rounded-xl bg-emerald-500/20 animate-pulse" />
            <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-md z-10">
              {/* Helmet / Cloak */}
              <circle cx="24" cy="20" r="11" fill="#10B981" stroke="#064E3B" strokeWidth="2" />
              {/* Face mask / Eyes */}
              <circle cx="21" cy="19" r="2.2" fill="#FFFFFF" />
              <circle cx="27" cy="19" r="2.2" fill="#FFFFFF" />
              <circle cx="21" cy="19" r="1.2" fill="#022C22" />
              <circle cx="27" cy="19" r="1.2" fill="#022C22" />
              {/* Scarf / Armor Collar */}
              <path d="M16 28 C 20 34, 28 34, 32 28 C 30 38, 18 38, 16 28 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
              {/* Shoulders */}
              <path d="M12 38 Q 24 33 36 38 L 38 46 L 10 46 Z" fill="#065F46" stroke="#022C22" strokeWidth="2" />
              {/* Crest Gem */}
              <polygon points="24,9 27,13 24,17 21,13" fill="#FBBF24" />
            </svg>
            <span className="text-[10px] font-bold tracking-wider text-emerald-300 z-10 leading-none mt-0.5">
              HERO
            </span>
          </div>
        );

      case 'wood':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
              {/* Three stacked timber logs */}
              <rect x="8" y="24" width="32" height="10" rx="4" fill="#B45309" stroke="#78350F" strokeWidth="2" />
              <circle cx="13" cy="29" r="3" fill="#92400E" stroke="#78350F" strokeWidth="1" />
              <rect x="12" y="14" width="24" height="10" rx="4" fill="#D97706" stroke="#78350F" strokeWidth="2" />
              <circle cx="17" cy="19" r="2.5" fill="#B45309" stroke="#78350F" strokeWidth="1" />
              {/* Small fresh leaf */}
              <path d="M30 12 C 36 8, 38 16, 32 18 C 30 16, 30 14, 30 12 Z" fill="#34D399" />
            </svg>
            <span className="text-[10px] font-medium text-amber-300/90 leading-none mt-1">Wood</span>
          </div>
        );

      case 'stone':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
              <polygon points="12,36 8,24 18,12 36,10 42,26 34,38" fill="#64748B" stroke="#334155" strokeWidth="2" />
              <polygon points="18,12 36,10 32,22 16,24" fill="#94A3B8" />
              {/* Rune crack */}
              <path d="M22 18 L26 26 L24 32" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] font-medium text-slate-300/90 leading-none mt-1">Stone</span>
          </div>
        );

      case 'herb':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
              <path d="M24 40 C 24 28, 12 24, 10 14 C 18 14, 24 22, 24 40 Z" fill="#10B981" stroke="#065F46" strokeWidth="2" />
              <path d="M24 40 C 24 28, 36 24, 38 14 C 30 14, 24 22, 24 40 Z" fill="#34D399" stroke="#065F46" strokeWidth="2" />
              <circle cx="24" cy="18" r="3" fill="#A7F3D0" />
            </svg>
            <span className="text-[10px] font-medium text-emerald-300/90 leading-none mt-1">Herb</span>
          </div>
        );

      case 'metal':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
              {/* Iron Ingot */}
              <polygon points="10,34 38,34 34,20 14,20" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
              <polygon points="14,20 34,20 30,14 18,14" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
              <line x1="16" y1="26" x2="32" y2="26" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
            <span className="text-[10px] font-medium text-slate-300 leading-none mt-1">Metal</span>
          </div>
        );

      case 'crystal':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
              <polygon points="24,6 36,18 30,42 18,42 12,18" fill="#A855F7" stroke="#6B21A8" strokeWidth="2" />
              <polygon points="24,6 36,18 24,42" fill="#C084FC" />
              <polygon points="24,6 18,18 24,42" fill="#E9D5FF" opacity="0.6" />
            </svg>
            <span className="text-[10px] font-medium text-purple-300 leading-none mt-1">Crystal</span>
          </div>
        );

      case 'wooden_shield':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-emerald-950/40 rounded-xl">
            <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
              <path d="M24 6 C 36 8, 40 14, 38 28 C 36 38, 24 44, 24 44 C 24 44, 12 38, 10 28 C 8 14, 12 8, 24 6 Z" fill="#92400E" stroke="#B45309" strokeWidth="2" />
              <circle cx="24" cy="24" r="7" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
              <circle cx="24" cy="24" r="3" fill="#FDE68A" />
            </svg>
            <span className="text-[9px] font-bold text-amber-300 leading-none mt-1">+25 Shield</span>
          </div>
        );

      case 'wooden_sword':
      case 'stone_hammer':
      case 'iron_blade':
      case 'crystal_blade':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-cyan-950/40 rounded-xl">
            <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
              {tile.type === 'stone_hammer' ? (
                <>
                  <rect x="22" y="18" width="4" height="24" rx="2" fill="#78350F" />
                  <rect x="12" y="8" width="24" height="14" rx="3" fill="#64748B" stroke="#334155" strokeWidth="2" />
                  <line x1="16" y1="12" x2="16" y2="18" stroke="#94A3B8" strokeWidth="2" />
                </>
              ) : (
                <>
                  <path d="M24 6 L30 28 L24 34 L18 28 Z" fill={tile.type === 'crystal_blade' ? '#C084FC' : '#CBD5E1'} stroke="#334155" strokeWidth="2" />
                  <line x1="24" y1="10" x2="24" y2="30" stroke="#FFFFFF" strokeWidth="1.5" />
                  <rect x="16" y="34" width="16" height="4" rx="2" fill="#F59E0B" />
                  <rect x="22" y="38" width="4" height="8" rx="1.5" fill="#78350F" />
                </>
              )}
            </svg>
            <span className="text-[9px] font-bold text-cyan-300 leading-none mt-1">
              +{tile.damage || 20} ATK
            </span>
          </div>
        );

      case 'potion':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-red-950/30 rounded-xl">
            <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
              <path d="M20 12 L28 12 L28 16 L34 26 C 36 32, 34 40, 24 40 C 14 40, 12 32, 14 26 L20 16 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
              <rect x="21" y="8" width="6" height="4" rx="1" fill="#D97706" />
              {/* Highlight & bubble */}
              <circle cx="21" cy="30" r="2.5" fill="#FCA5A5" />
              <circle cx="27" cy="33" r="1.5" fill="#FFFFFF" opacity="0.8" />
            </svg>
            <span className="text-[9px] font-bold text-rose-300 leading-none mt-1">+35 HP</span>
          </div>
        );

      case 'chest':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
              <rect x="8" y="20" width="32" height="20" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="2" />
              <path d="M8 20 C 8 12, 40 12, 40 20 Z" fill="#D97706" stroke="#78350F" strokeWidth="2" />
              <rect x="22" y="20" width="4" height="8" rx="1" fill="#FBBF24" stroke="#78350F" strokeWidth="1" />
              <line x1="8" y1="28" x2="40" y2="28" stroke="#FDE68A" strokeWidth="1.5" />
            </svg>
            <span className="text-[9px] font-bold text-amber-300 leading-none mt-1">Chest</span>
          </div>
        );

      case 'lava':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-orange-950/60 rounded-xl">
            <div className="absolute inset-1 rounded-lg bg-orange-600/20 animate-pulse" />
            <Flame className="w-8 h-8 text-orange-500 drop-shadow animate-bounce" />
            <span className="text-[9px] font-bold text-orange-400 leading-none mt-1">Lava -15</span>
          </div>
        );

      case 'water':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-blue-950/50 rounded-xl">
            <Droplets className="w-8 h-8 text-cyan-400 drop-shadow" />
            <span className="text-[9px] font-medium text-cyan-300 leading-none mt-1">Spring</span>
          </div>
        );

      case 'ice':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-cyan-950/50 rounded-xl">
            <Snowflake className="w-8 h-8 text-sky-300 drop-shadow animate-spin" style={{ animationDuration: '10s' }} />
            <span className="text-[9px] font-medium text-sky-200 leading-none mt-1">Glacier</span>
          </div>
        );

      case 'poison_plant':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-purple-950/40 rounded-xl">
            <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow">
              <circle cx="24" cy="24" r="14" fill="#7E22CE" stroke="#581C87" strokeWidth="2" />
              <circle cx="20" cy="20" r="3" fill="#D8B4FE" />
              <circle cx="28" cy="22" r="2.5" fill="#A855F7" />
              <circle cx="22" cy="29" r="3" fill="#A855F7" />
              {/* Spikes */}
              <polygon points="24,6 27,12 21,12" fill="#581C87" />
              <polygon points="42,24 36,27 36,21" fill="#581C87" />
              <polygon points="24,42 21,36 27,36" fill="#581C87" />
              <polygon points="6,24 12,21 12,27" fill="#581C87" />
            </svg>
            <span className="text-[9px] font-bold text-purple-300 leading-none mt-1">Thorns</span>
          </div>
        );

      case 'enemy':
        return renderEnemyGraphic();

      default:
        return null;
    }
  };

  const renderEnemyGraphic = () => {
    const eType = tile.enemyType || 'slime';

    if (eType === 'forest_guardian' || eType === 'inferno_golem' || eType === 'frost_titan') {
      // BOSS TILE
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-red-950/40 rounded-xl border border-red-500/50">
          <div className="absolute top-1 left-1.5 px-1 py-0.2 rounded bg-red-900/80 text-[8px] font-bold text-red-200">
            BOSS
          </div>
          <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-lg">
            {eType === 'inferno_golem' ? (
              <>
                <polygon points="24,6 38,14 42,32 32,44 16,44 6,32 10,14" fill="#7C2D12" stroke="#EA580C" strokeWidth="2" />
                <circle cx="18" cy="22" r="3" fill="#F97316" />
                <circle cx="30" cy="22" r="3" fill="#F97316" />
                <path d="M18 32 Q24 38 30 32" stroke="#FDE047" strokeWidth="2.5" fill="none" />
              </>
            ) : (
              <>
                <polygon points="24,4 40,16 36,40 12,40 8,16" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
                {/* Antlers */}
                <path d="M12 14 L4 6 M10 10 L6 14" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                <path d="M36 14 L44 6 M38 10 L42 14" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                {/* Glowing runic eyes */}
                <circle cx="18" cy="24" r="3" fill="#34D399" />
                <circle cx="30" cy="24" r="3" fill="#34D399" />
                <polygon points="24,28 27,34 21,34" fill="#FBBF24" />
              </>
            )}
          </svg>
          <span className="text-[9px] font-bold text-red-300 leading-none mt-0.5 truncate max-w-[90%]">
            {tile.name}
          </span>
        </div>
      );
    }

    if (eType === 'slime') {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
            <path d="M12 36 C 8 36, 6 26, 16 18 C 22 12, 26 12, 32 18 C 42 26, 40 36, 36 36 Z" fill="#10B981" stroke="#047857" strokeWidth="2" />
            <circle cx="19" cy="24" r="2.5" fill="#FFFFFF" />
            <circle cx="29" cy="24" r="2.5" fill="#FFFFFF" />
            <circle cx="20" cy="24" r="1.2" fill="#064E3B" />
            <circle cx="30" cy="24" r="1.2" fill="#064E3B" />
            <path d="M21 30 Q24 33 27 30" stroke="#064E3B" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] font-bold text-emerald-400 leading-none mt-0.5">{tile.name}</span>
        </div>
      );
    }

    if (eType === 'goblin') {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
            {/* Pointy ears */}
            <polygon points="8,18 16,22 14,28" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1.5" />
            <polygon points="40,18 32,22 34,28" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="11" fill="#84CC16" stroke="#4D7C0F" strokeWidth="2" />
            {/* Red cunning eyes */}
            <circle cx="20" cy="22" r="2" fill="#EF4444" />
            <circle cx="28" cy="22" r="2" fill="#EF4444" />
            <path d="M18 28 Q24 34 30 28" stroke="#365314" strokeWidth="2" fill="none" />
          </svg>
          <span className="text-[9px] font-bold text-lime-400 leading-none mt-0.5">{tile.name}</span>
        </div>
      );
    }

    if (eType === 'spider') {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
            {/* Legs */}
            <path d="M14 20 L4 14 M14 24 L2 24 M14 28 L4 34" stroke="#581C87" strokeWidth="2" strokeLinecap="round" />
            <path d="M34 20 L44 14 M34 24 L46 24 M34 28 L44 34" stroke="#581C87" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24" cy="24" r="9" fill="#7E22CE" stroke="#581C87" strokeWidth="2" />
            <circle cx="21" cy="21" r="1.5" fill="#F43F5E" />
            <circle cx="27" cy="21" r="1.5" fill="#F43F5E" />
            <circle cx="24" cy="26" r="1.5" fill="#F43F5E" />
          </svg>
          <span className="text-[9px] font-bold text-purple-400 leading-none mt-0.5">{tile.name}</span>
        </div>
      );
    }

    if (eType === 'charger') {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
            <rect x="10" y="16" width="28" height="18" rx="6" fill="#78350F" stroke="#451A03" strokeWidth="2" />
            {/* Tusks */}
            <path d="M14 28 Q 8 26 8 20" stroke="#FDE68A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M34 28 Q 40 26 40 20" stroke="#FDE68A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="18" cy="22" r="2" fill="#EF4444" />
            <circle cx="30" cy="22" r="2" fill="#EF4444" />
            {/* Snout */}
            <ellipse cx="24" cy="26" rx="5" ry="3.5" fill="#92400E" />
          </svg>
          <span className="text-[9px] font-bold text-amber-500 leading-none mt-0.5">{tile.name}</span>
        </div>
      );
    }

    if (eType === 'skeleton') {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow">
            <path d="M14 20 C 14 12, 34 12, 34 20 C 34 28, 28 34, 24 34 C 20 34, 14 28, 14 20 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
            <circle cx="19" cy="20" r="3" fill="#0EA5E9" />
            <circle cx="29" cy="20" r="3" fill="#0EA5E9" />
            <line x1="20" y1="28" x2="28" y2="28" stroke="#475569" strokeWidth="2" />
            <line x1="22" y1="26" x2="22" y2="30" stroke="#475569" strokeWidth="1.5" />
            <line x1="26" y1="26" x2="26" y2="30" stroke="#475569" strokeWidth="1.5" />
          </svg>
          <span className="text-[9px] font-bold text-slate-300 leading-none mt-0.5">{tile.name}</span>
        </div>
      );
    }

    // Generic enemy fallback
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <Skull className="w-8 h-8 text-rose-400 drop-shadow" />
        <span className="text-[9px] font-bold text-rose-300 leading-none mt-0.5">{tile.name}</span>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Background Graphic */}
      {renderGraphic()}

      {/* Enemy Intent Telegraph Icon (Top Right) */}
      {tile.category === 'enemy' && tile.intent && (
        <div
          title={tile.intent.description}
          className="absolute top-1 right-1 px-1 py-0.5 bg-rose-950/90 border border-rose-500/70 rounded text-[9px] font-bold text-rose-200 flex items-center gap-0.5 shadow z-20 pointer-events-none"
        >
          <span className="tabular-nums font-mono">!{tile.intent.value}</span>
        </div>
      )}

      {/* Enemy HP Bar (Bottom) */}
      {tile.category === 'enemy' && tile.hp !== undefined && tile.maxHp !== undefined && (
        <div className="absolute bottom-1 left-1.5 right-1.5 h-1.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700/60 z-20 pointer-events-none">
          <div
            className="h-full bg-rose-500 transition-all duration-200"
            style={{ width: `${Math.max(0, Math.min(100, (tile.hp / tile.maxHp) * 100))}%` }}
          />
        </div>
      )}

      {/* Boss Locked Overlay */}
      {tile.locked && (
        <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center z-30 pointer-events-none backdrop-blur-[1px]">
          <Lock className="w-6 h-6 text-red-400 animate-pulse" />
        </div>
      )}

      {/* Meteor warning countdown */}
      {tile.meteorTurns !== undefined && tile.meteorTurns > 0 && (
        <div className="absolute inset-0 bg-orange-600/30 border-2 border-dashed border-orange-500 flex flex-col items-center justify-center z-30 pointer-events-none animate-pulse">
          <span className="text-xs font-bold text-orange-200 bg-orange-950 px-1 rounded">
            METEOR {tile.meteorTurns}
          </span>
        </div>
      )}

      {/* Hero Adjacent Highlight Indicator */}
      {isHeroAdjacent && tile.type !== 'hero' && (
        <div className="absolute inset-0 border border-emerald-400/40 rounded-xl pointer-events-none" />
      )}
    </div>
  );
};
