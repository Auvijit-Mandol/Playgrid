import React from 'react';
import { GameStats } from '../types/game';
import { Pause, Shield, Zap, CircleDollarSign, Magnet, Clock } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  highScore: number;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({ stats, highScore, onPause }) => {
  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-20 flex flex-col p-3 md:p-4 text-white">
      {/* Top Bar: Pause, Score, High Score & Coins */}
      <div className="flex items-center justify-between gap-3 w-full max-w-xl mx-auto">
        {/* Pause Button */}
        <button
          onClick={onPause}
          className="pointer-events-auto min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 active:scale-95 transition-transform"
          aria-label="Pause Game"
        >
          <Pause className="w-5 h-5" />
        </button>

        {/* Center: Score & Distance */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800/80 shadow-lg">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Score</span>
            <span className="text-base md:text-lg font-bold font-mono tabular-nums text-white leading-tight">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="w-px h-6 bg-slate-700/60" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Dist</span>
            <span className="text-base md:text-lg font-bold font-mono tabular-nums text-amber-400 leading-tight">
              {stats.distance}m
            </span>
          </div>

          {stats.comboMultiplier > 1 && (
            <>
              <div className="w-px h-6 bg-slate-700/60" />
              <div className="flex items-center gap-1 text-cyan-400 animate-pulse font-bold text-xs">
                <span>{stats.comboMultiplier}x</span>
              </div>
            </>
          )}
        </div>

        {/* Right: Collected Coins */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 shadow-lg">
          <CircleDollarSign className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold font-mono tabular-nums text-amber-300">
            {stats.coinsCollected}
          </span>
        </div>
      </div>

      {/* Speedometer & Status Strips */}
      <div className="flex items-center justify-between gap-3 w-full max-w-xl mx-auto mt-2">
        {/* Speedometer Gauge */}
        <div className="flex items-baseline gap-1 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800/80">
          <span className="text-xl md:text-2xl font-black font-mono tabular-nums tracking-tight text-white">
            {stats.speed}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase">km/h</span>
          {stats.isNitroActive && (
            <span className="ml-1 text-[10px] font-extrabold text-cyan-400 uppercase animate-pulse">
              BOOST
            </span>
          )}
        </div>

        {/* Health & Shield Bar */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80">
          {/* Health indicator */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
              <span>HULL</span>
              <span className="font-mono tabular-nums">{Math.round(stats.health)}%</span>
            </div>
            <div className="w-20 md:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  stats.health > 50
                    ? 'bg-emerald-500'
                    : stats.health > 25
                    ? 'bg-amber-500'
                    : 'bg-red-500 animate-pulse'
                }`}
                style={{ width: `${Math.max(0, stats.health)}%` }}
              />
            </div>
          </div>

          {/* Shield Charges */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-700/60">
            <Shield className={`w-3.5 h-3.5 ${stats.shieldHits > 0 ? 'text-cyan-400' : 'text-slate-600'}`} />
            <span className="text-xs font-mono font-bold text-cyan-300">
              {stats.shieldHits}
            </span>
          </div>
        </div>
      </div>

      {/* Active Powerup Timers & Nitro Bar */}
      <div className="flex items-center justify-between gap-2 w-full max-w-xl mx-auto mt-2">
        {/* Nitro Meter */}
        <div className="flex items-center gap-2 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800/60">
          <Zap className={`w-3.5 h-3.5 ${stats.nitroFuel > 20 ? 'text-cyan-400' : 'text-slate-500'}`} />
          <div className="w-16 md:w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all ${
                stats.isNitroActive ? 'animate-pulse' : ''
              }`}
              style={{ width: `${stats.nitroFuel}%` }}
            />
          </div>
        </div>

        {/* Active Powerups */}
        <div className="flex items-center gap-1.5">
          {stats.timeRemainingSlowMo > 0 && (
            <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-600/60 px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-300">
              <Clock className="w-3 h-3 animate-spin" />
              <span>{Math.ceil(stats.timeRemainingSlowMo)}s</span>
            </div>
          )}
          {stats.shieldHits > 0 && (
            <div className="flex items-center gap-1 bg-cyan-950/80 border border-cyan-600/60 px-2 py-0.5 rounded-md text-[11px] font-semibold text-cyan-300">
              <Shield className="w-3 h-3" />
              <span>ARMOR</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
