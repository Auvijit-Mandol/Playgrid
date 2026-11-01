import React from 'react';
import { HeroClass, MetaProfile } from '../types/game';
import { HEROES } from '../utils/storage';
import { X, Check, Lock, Shield, Heart, Sword } from 'lucide-react';

interface HeroesModalProps {
  profile: MetaProfile;
  onSelectHero: (heroId: HeroClass) => void;
  onUnlockHero: (heroId: HeroClass, cost: number) => void;
  onClose: () => void;
}

export const HeroesModal: React.FC<HeroesModalProps> = ({
  profile,
  onSelectHero,
  onUnlockHero,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Hero Roster</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose your champion. Each has distinct traits and abilities.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency balance */}
        <div className="flex items-center justify-between py-2.5 px-4 my-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">Available Eco Shards:</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{profile.ecoShards}</span>
          </div>
        </div>

        {/* Heroes Grid */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 my-2">
          {HEROES.map((hero) => {
            const isUnlocked = profile.unlockedHeroes.includes(hero.id);
            const isSelected = profile.selectedHero === hero.id;
            const canAfford = profile.ecoShards >= hero.costShards;

            return (
              <div
                key={hero.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/50'
                    : isUnlocked
                    ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800/80'
                    : 'bg-slate-900/60 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">{hero.name}</h3>
                      <span className="text-xs text-slate-400 font-medium">· {hero.title}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{hero.description}</p>
                    <div className="text-xs text-emerald-400 font-medium mt-1.5">
                      Trait: {hero.perkSummary}
                    </div>

                    {/* Stats pills (unboxed text) */}
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-2">
                      <span className="flex items-center gap-1 text-rose-300">
                        <Heart className="w-3.5 h-3.5 text-rose-400" /> {hero.baseHp} HP
                      </span>
                      <span className="flex items-center gap-1 text-amber-300">
                        <Shield className="w-3.5 h-3.5 text-amber-400" /> {hero.baseShield} Shield
                      </span>
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Sword className="w-3.5 h-3.5 text-cyan-400" /> {hero.weaponDamage} DMG
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end">
                    {isSelected ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => onSelectHero(hero.id)}
                        className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                      >
                        Choose
                      </button>
                    ) : (
                      <button
                        onClick={() => onUnlockHero(hero.id, hero.costShards)}
                        disabled={!canAfford}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock ({hero.costShards} Shards)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
