import React from 'react';
import { Sparkles, Trophy, Skull, RefreshCw, ArrowRight, Coins, Gem } from 'lucide-react';

interface VictoryModalProps {
  wave: number;
  monstersSlain: number;
  itemsCrafted: number;
  shiftsMade: number;
  shardsEarned: number;
  coinsEarned: number;
  gemsEarned: number;
  onNewRun: () => void;
  onOpenUpgrades: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  wave,
  monstersSlain,
  itemsCrafted,
  shiftsMade,
  shardsEarned,
  coinsEarned,
  gemsEarned,
  onNewRun,
  onOpenUpgrades,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Crest */}
        <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-3 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
          Expedition Triumphant
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight mt-1">
          BIOME PURIFIED
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-xs">
          You mastered the shifting battlefield and vanquished the ancient titan.
        </p>

        {/* Rewards Cluster */}
        <div className="w-full grid grid-cols-3 gap-2 my-4 p-3 bg-slate-950/70 rounded-2xl border border-slate-800">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">+{shardsEarned}</span>
            <span className="text-[10px] text-slate-400">Eco Shards</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">+{coinsEarned}</span>
            <span className="text-[10px] text-slate-400">Coins</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-purple-400 font-mono tabular-nums">+{gemsEarned}</span>
            <span className="text-[10px] text-slate-400">Gems</span>
          </div>
        </div>

        {/* Run Stats */}
        <div className="w-full flex items-center justify-around text-xs text-slate-400 py-2 border-y border-slate-800/80 mb-5 font-mono">
          <div><strong className="text-white">{monstersSlain}</strong> Slain</div>
          <div><strong className="text-white">{itemsCrafted}</strong> Crafted</div>
          <div><strong className="text-white">{shiftsMade}</strong> Shifts</div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onNewRun}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>Embark on New Run</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenUpgrades}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Visit Ancient Sanctuary (Upgrades)
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  wave: number;
  monstersSlain: number;
  itemsCrafted: number;
  shiftsMade: number;
  shardsEarned: number;
  coinsEarned: number;
  canRevive: boolean;
  onRevive: () => void;
  onRetry: () => void;
  onOpenUpgrades: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  wave,
  monstersSlain,
  itemsCrafted,
  shiftsMade,
  shardsEarned,
  coinsEarned,
  canRevive,
  onRevive,
  onRetry,
  onOpenUpgrades,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Skull Icon */}
        <div className="p-4 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-3">
          <Skull className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
          Fallen on Wave {wave}
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight mt-1">
          EXPEDITION FAILED
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-xs">
          The environment overwhelmed you. Bank your salvaged shards and return stronger.
        </p>

        {/* Salvaged Loot */}
        <div className="w-full grid grid-cols-2 gap-2 my-4 p-3 bg-slate-950/70 rounded-2xl border border-slate-800">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">+{shardsEarned}</span>
            <span className="text-[10px] text-slate-400">Salvaged Shards</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">+{coinsEarned}</span>
            <span className="text-[10px] text-slate-400">Salvaged Coins</span>
          </div>
        </div>

        {/* Run Stats */}
        <div className="w-full flex items-center justify-around text-xs text-slate-400 py-2 border-y border-slate-800/80 mb-5 font-mono">
          <div><strong className="text-white">{monstersSlain}</strong> Slain</div>
          <div><strong className="text-white">{itemsCrafted}</strong> Crafted</div>
          <div><strong className="text-white">{shiftsMade}</strong> Shifts</div>
        </div>

        {/* Revive Button (Rewarded ad simulation) */}
        {canRevive && (
          <button
            onClick={onRevive}
            className="w-full py-3 mb-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Second Wind (Revive with 50% HP)</span>
          </button>
        )}

        {/* Retry / Sanctuary */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onRetry}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-sm transition-all shadow"
          >
            Try Again
          </button>
          <button
            onClick={onOpenUpgrades}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-colors border border-slate-800"
          >
            Visit Sanctuary (Upgrade Talents)
          </button>
        </div>
      </div>
    </div>
  );
};
