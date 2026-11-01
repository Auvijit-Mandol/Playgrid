import React from 'react';
import { Achievement, MetaProfile } from '../types/game';
import { Trophy, X, Check, Coins, Gem, Sparkles } from 'lucide-react';

interface AchievementsModalProps {
  profile: MetaProfile;
  onClaimReward: (achievementId: string) => void;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  profile,
  onClaimReward,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Milestones &amp; Honors</h2>
              <p className="text-xs text-slate-400">
                Complete tactical challenges to earn Eco Shards, Coins, and Gems.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 my-4">
          {profile.achievements.map((ach) => {
            const isFinished = ach.progress >= ach.maxProgress;

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  ach.claimed
                    ? 'bg-slate-900/50 border-slate-800/80 opacity-60'
                    : isFinished
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-md shadow-amber-950/30'
                    : 'bg-slate-800/50 border-slate-700/60'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm tracking-tight">{ach.title}</h3>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      ({ach.progress}/{ach.maxProgress})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{ach.description}</p>

                  {/* Reward label */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mt-2">
                    {ach.rewardType === 'gems' ? (
                      <Gem className="w-3.5 h-3.5 text-purple-400" />
                    ) : ach.rewardType === 'ecoShards' ? (
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>
                      +{ach.rewardAmount} {ach.rewardType === 'gems' ? 'Gems' : ach.rewardType === 'ecoShards' ? 'Eco Shards' : 'Coins'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {ach.claimed ? (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Claimed
                    </span>
                  ) : isFinished ? (
                    <button
                      onClick={() => onClaimReward(ach.id)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold transition-all shadow-lg animate-pulse"
                    >
                      Claim Reward
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-500 text-xs font-mono">
                      In Progress
                    </span>
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
