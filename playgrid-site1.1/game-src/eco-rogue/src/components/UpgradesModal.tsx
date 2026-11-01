import React from 'react';
import { PermanentUpgrades, MetaProfile } from '../types/game';
import { Heart, Shield, Sword, Sparkles, RefreshCw, X, Coins, Gem } from 'lucide-react';

interface UpgradesModalProps {
  profile: MetaProfile;
  onUpgrade: (key: keyof PermanentUpgrades, costShards: number, costCoins: number) => void;
  onClose: () => void;
}

interface UpgradeItem {
  key: keyof PermanentUpgrades;
  title: string;
  description: string;
  icon: React.ReactNode;
  maxLevel: number;
  baseCostShards: number;
  baseCostCoins: number;
}

const UPGRADE_ITEMS: UpgradeItem[] = [
  {
    key: 'maxHpLevel',
    title: 'Vitality Core',
    description: '+10 Maximum HP permanently across all heroes.',
    icon: <Heart className="w-5 h-5 text-rose-400" />,
    maxLevel: 5,
    baseCostShards: 5,
    baseCostCoins: 40,
  },
  {
    key: 'startingShieldLevel',
    title: 'Guardian Aegis',
    description: '+8 starting Shield at the beginning of each run.',
    icon: <Shield className="w-5 h-5 text-amber-400" />,
    maxLevel: 5,
    baseCostShards: 5,
    baseCostCoins: 50,
  },
  {
    key: 'attackPowerLevel',
    title: 'Keen Edge',
    description: '+3 base Weapon Damage for all weapons.',
    icon: <Sword className="w-5 h-5 text-cyan-400" />,
    maxLevel: 5,
    baseCostShards: 8,
    baseCostCoins: 60,
  },
  {
    key: 'resourceLuckLevel',
    title: 'Abundant Soil',
    description: '+15% chance to spawn rare crystals and metal.',
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    maxLevel: 5,
    baseCostShards: 10,
    baseCostCoins: 75,
  },
  {
    key: 'craftEfficiencyLevel',
    title: 'Artisan Synergy',
    description: 'Crafting items restores +6 HP immediately.',
    icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
    maxLevel: 5,
    baseCostShards: 12,
    baseCostCoins: 80,
  },
  {
    key: 'revivesAvailable',
    title: 'Phoenix Tear',
    description: 'Revive once upon fatal damage with 50% HP.',
    icon: <RefreshCw className="w-5 h-5 text-orange-400" />,
    maxLevel: 3,
    baseCostShards: 25,
    baseCostCoins: 150,
  },
];

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  profile,
  onUpgrade,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Ancient Sanctuary</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently strengthen your heroes using Eco Shards and Coins.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency Bar */}
        <div className="flex items-center gap-4 py-3 px-4 my-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="tabular-nums font-mono">{profile.ecoShards}</span>
            <span className="text-slate-400 font-normal">Eco Shards</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Coins className="w-3.5 h-3.5" />
            <span className="tabular-nums font-mono">{profile.coins}</span>
            <span className="text-slate-400 font-normal">Coins</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-400 font-bold ml-auto">
            <Gem className="w-3.5 h-3.5" />
            <span className="tabular-nums font-mono">{profile.gems}</span>
            <span className="text-slate-400 font-normal">Gems</span>
          </div>
        </div>

        {/* Upgrades List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 my-2">
          {UPGRADE_ITEMS.map((item) => {
            const currentLevel = profile.upgrades[item.key] || 0;
            const isMax = currentLevel >= item.maxLevel;
            const costShards = item.baseCostShards * (currentLevel + 1);
            const costCoins = item.baseCostCoins * (currentLevel + 1);
            const canAfford = profile.ecoShards >= costShards && profile.coins >= costCoins;

            return (
              <div
                key={item.key}
                className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm tracking-tight">{item.title}</h3>
                      <span className="text-[11px] font-mono text-emerald-400 tabular-nums">
                        Lv {currentLevel}/{item.maxLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 leading-normal">{item.description}</p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  {isMax ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-600/50 text-[11px] font-bold text-emerald-300">
                      MAX
                    </span>
                  ) : (
                    <button
                      onClick={() => onUpgrade(item.key, costShards, costCoins)}
                      disabled={!canAfford}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                      <span>Upgrade</span>
                      <span className="text-[10px] text-emerald-200">
                        {costShards}💎 {costCoins}🪙
                      </span>
                    </button>
                  )}
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
