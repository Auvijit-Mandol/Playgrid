import React from 'react';
import { Perk, PerkRarity } from '../types/game';
import { Sparkles, Sword, Shield, Flame, Biohazard, Snowflake, RotateCw, Gem, Sun, Magnet, Crosshair, ShieldAlert } from 'lucide-react';

interface PerkModalProps {
  perks: Perk[];
  waveNumber: number;
  onSelectPerk: (perk: Perk) => void;
  onReroll: () => void;
  rerollsLeft: number;
}

const RARITY_COLORS: Record<PerkRarity, { border: string; bg: string; text: string; glow: string }> = {
  common: {
    border: 'border-slate-500/50',
    bg: 'bg-slate-900/80',
    text: 'text-slate-300',
    glow: 'hover:border-slate-400',
  },
  rare: {
    border: 'border-sky-500/60',
    bg: 'bg-sky-950/40',
    text: 'text-sky-300',
    glow: 'hover:border-sky-400 hover:shadow-sky-500/20',
  },
  epic: {
    border: 'border-purple-500/60',
    bg: 'bg-purple-950/40',
    text: 'text-purple-300',
    glow: 'hover:border-purple-400 hover:shadow-purple-500/25',
  },
  legendary: {
    border: 'border-amber-500/70',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    glow: 'hover:border-amber-400 hover:shadow-amber-500/30',
  },
};

const getPerkIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sword': return <Sword className="w-6 h-6" />;
    case 'Shield': return <Shield className="w-6 h-6" />;
    case 'Flame': return <Flame className="w-6 h-6" />;
    case 'Biohazard': return <Biohazard className="w-6 h-6" />;
    case 'Snowflake': return <Snowflake className="w-6 h-6" />;
    case 'RotateCw': return <RotateCw className="w-6 h-6" />;
    case 'Gem': return <Gem className="w-6 h-6" />;
    case 'Sun': return <Sun className="w-6 h-6" />;
    case 'Magnet': return <Magnet className="w-6 h-6" />;
    case 'Crosshair': return <Crosshair className="w-6 h-6" />;
    case 'ShieldAlert': return <ShieldAlert className="w-6 h-6" />;
    default: return <Sparkles className="w-6 h-6" />;
  }
};

export const PerkModal: React.FC<PerkModalProps> = ({
  perks,
  waveNumber,
  onSelectPerk,
  onReroll,
  rerollsLeft,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-1">
            Wave {waveNumber} Completed
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Choose Your Boon</h2>
          <p className="text-sm text-slate-400 mt-1">
            Shape your build with an environmental or combat perk.
          </p>
        </div>

        {/* 3 Perk Cards */}
        <div className="w-full flex flex-col gap-3">
          {perks.map((perk) => {
            const colors = RARITY_COLORS[perk.rarity];
            return (
              <button
                key={perk.id}
                onClick={() => onSelectPerk(perk)}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all duration-200 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.99] ${colors.border} ${colors.bg} ${colors.glow}`}
              >
                <div className={`p-3 rounded-xl bg-slate-800/90 ${colors.text} shrink-0`}>
                  {getPerkIcon(perk.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-white text-base tracking-tight truncate">
                      {perk.name}
                    </h3>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${colors.text}`}>
                      {perk.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {perk.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Reroll Action */}
        <div className="mt-5 flex items-center justify-between w-full pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <span>Rerolls Remaining: <strong className="text-white tabular-nums">{rerollsLeft}</strong></span>
          <button
            onClick={onReroll}
            disabled={rerollsLeft <= 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 font-medium transition-colors"
          >
            Reroll Perks
          </button>
        </div>
      </div>
    </div>
  );
};
