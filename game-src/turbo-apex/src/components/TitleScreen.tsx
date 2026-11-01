import React from 'react';
import { CarDefinition, ControlMode, HighScoreRecord, TrackEnvironment } from '../types/game';
import { sound } from '../utils/audio';
import { Play, Wrench, Trophy, HelpCircle, Volume2, VolumeX, Vibrate, Download, Smartphone, CircleDollarSign } from 'lucide-react';

interface TitleScreenProps {
  selectedCar: CarDefinition;
  coins: number;
  highScore: HighScoreRecord;
  track: TrackEnvironment;
  controlMode: ControlMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  onStartRace: () => void;
  onOpenGarage: () => void;
  onOpenHowToPlay: () => void;
  onSelectTrack: (track: TrackEnvironment) => void;
  onSelectControlMode: (mode: ControlMode) => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onInstall: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedCar,
  coins,
  highScore,
  track,
  controlMode,
  soundEnabled,
  hapticsEnabled,
  isInstallable,
  isInstalled,
  onStartRace,
  onOpenGarage,
  onOpenHowToPlay,
  onSelectTrack,
  onSelectControlMode,
  onToggleSound,
  onToggleHaptics,
  onInstall,
}) => {
  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col text-slate-100 overflow-y-auto">
      {/* Top Bar Contract: Brand Wordmark - Clean Navigation / Actions */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black font-display tracking-wider text-white uppercase arcade-glow">
            Turbo Apex
          </span>
          <span className="text-xs text-cyan-400 font-mono font-semibold hidden sm:inline">2D RACER</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bank balance */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenGarage();
            }}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl hover:border-amber-500/50 transition-colors"
          >
            <CircleDollarSign className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold font-mono tabular-nums text-amber-300">
              {coins.toLocaleString()}
            </span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Haptics toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleHaptics();
            }}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Vibration"
          >
            <Vibrate className={`w-4 h-4 ${hapticsEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl mx-auto w-full p-4 flex flex-col gap-4 pb-8">
        {/* Hero Visual Card */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl min-h-[220px] flex flex-col justify-end p-5">
          <img
            src="images/hero_racing_cover_1792860098122.jpg"
            alt="Turbo Apex Street Racer"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Banner Overlaid Content */}
          <div className="relative z-10 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              High-Speed Android Racer
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-wide leading-none mt-1">
              TURBO APEX
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              Weave traffic, boost with nitro, absorb impacts with energy shields.
            </p>
          </div>
        </div>

        {/* High Score Banner */}
        {highScore.score > 0 && (
          <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800 px-4 py-2.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">All-Time Best</span>
            </div>
            <div className="flex items-baseline gap-2 font-mono tabular-nums">
              <span className="text-sm font-bold text-cyan-400">{highScore.score.toLocaleString()} pts</span>
              <span className="text-xs text-slate-500">({highScore.distance}m)</span>
            </div>
          </div>
        )}

        {/* Selected Car Highlight */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center gap-3">
            {/* 2D Mini Car Icon */}
            <div
              className="w-7 h-14 rounded-md shadow-md flex items-center justify-center relative overflow-hidden shrink-0"
              style={{ backgroundColor: selectedCar.color }}
            >
              <div
                className="w-1.5 h-full absolute"
                style={{ backgroundColor: selectedCar.accentColor }}
              />
              <div className="w-4 h-4 bg-slate-950/80 rounded-sm z-10" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Current Vehicle
              </span>
              <h3 className="text-sm font-bold text-white leading-tight">
                {selectedCar.name}
              </h3>
              <span className="text-[11px] text-slate-400">{selectedCar.tagline}</span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenGarage();
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            <span>Garage</span>
          </button>
        </div>

        {/* Track Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Track
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'NEON_CITY', label: 'Neon City', desc: 'Night Grid' },
                { id: 'DESERT_HIGHWAY', label: 'Canyon', desc: 'Desert Sun' },
                { id: 'RAINY_MIDNIGHT', label: 'Wet Asphalt', desc: 'Rain Drift' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTrack(t.id);
                }}
                className={`p-2.5 rounded-2xl border text-left flex flex-col transition-all min-h-[56px] ${
                  track === t.id
                    ? 'border-cyan-400 bg-slate-800/90 shadow-md shadow-cyan-950/40'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                <span className={`text-xs font-bold ${track === t.id ? 'text-white' : 'text-slate-300'}`}>
                  {t.label}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Control Preferences */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5" />
            Control Method
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'BUTTONS', label: 'Thumb Buttons' },
                { id: 'DRAG', label: 'Touch Drag' },
                { id: 'TILT', label: 'Gyro Tilt' },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  sound.playClick();
                  onSelectControlMode(c.id);
                }}
                className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                  controlMode === c.id
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-sm'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* PRIMARY CTA: START RACE */}
        <div className="pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onStartRace();
            }}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black font-display text-lg tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/60 active:scale-98 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START RACE</span>
          </button>
        </div>

        {/* Secondary Actions: How to Play & PWA Install */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onOpenHowToPlay();
            }}
            className="min-h-[44px] rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>How to Play</span>
          </button>

          {/* In-app PWA install button for Android & Desktop */}
          {isInstallable ? (
            <button
              onClick={onInstall}
              className="min-h-[44px] rounded-xl bg-blue-900/60 border border-blue-500/80 text-blue-200 hover:bg-blue-800/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Install PWA</span>
            </button>
          ) : isInstalled ? (
            <div className="min-h-[44px] rounded-xl bg-slate-900/40 border border-slate-800/50 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5">
              <span>App Installed</span>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onOpenGarage();
              }}
              className="min-h-[44px] rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Upgrade Shop</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
