import React from 'react';
import { GameStats } from '../types/game';
import { sound } from '../utils/audio';
import { RotateCcw, Trophy, CircleDollarSign, Gauge, Wrench, Home, Flame } from 'lucide-react';

interface GameOverModalProps {
  finalStats: GameStats;
  isNewHighScore: boolean;
  totalCoins: number;
  onRestart: () => void;
  onOpenGarage: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  finalStats,
  isNewHighScore,
  totalCoins,
  onRestart,
  onOpenGarage,
  onHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center">
          {isNewHighScore ? (
            <div className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-950/60 border border-amber-600/60 px-3 py-1 rounded-full text-xs font-bold mb-2 animate-bounce">
              <Trophy className="w-3.5 h-3.5" />
              <span>NEW RECORD!</span>
            </div>
          ) : (
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Race Concluded
            </span>
          )}
          <h2 className="text-3xl font-black font-display text-white tracking-wide">
            {isNewHighScore ? 'LEGENDARY RUN!' : 'WRECKED!'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hull integrity compromised
          </p>
        </div>

        {/* Big Score Callout */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Final Score
          </span>
          <span className="text-3xl font-black font-mono tabular-nums text-cyan-400 mt-1">
            {finalStats.score.toLocaleString()}
          </span>
        </div>

        {/* Run Breakdown Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Distance</span>
            <span className="font-mono tabular-nums font-bold text-base text-white mt-0.5">
              {finalStats.distance} m
            </span>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Top Speed</span>
            <span className="font-mono tabular-nums font-bold text-base text-emerald-400 mt-0.5">
              {finalStats.maxSpeedReached} km/h
            </span>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Near Misses</span>
            <span className="font-mono tabular-nums font-bold text-base text-sky-400 mt-0.5 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-sky-400" />
              {finalStats.nearMissCount}
            </span>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Coins Found</span>
            <span className="font-mono tabular-nums font-bold text-base text-amber-400 mt-0.5 flex items-center gap-1">
              <CircleDollarSign className="w-3.5 h-3.5" />
              +{finalStats.coinsCollected}
            </span>
          </div>
        </div>

        {/* Wallet Total */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Bank Balance</span>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-300 font-mono tabular-nums">
            <CircleDollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>{totalCoins.toLocaleString()} Coins</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Race Again */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full h-12 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Race Again</span>
          </button>

          {/* Garage Shop */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenGarage();
            }}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>Garage & Upgrades</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="w-full h-10 rounded-xl bg-transparent hover:bg-slate-800/50 active:scale-98 text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
