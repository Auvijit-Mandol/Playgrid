import React, { useEffect } from 'react';
import { HeroClass, BiomeType, MetaProfile } from '../types/game';
import { HEROES, BIOMES } from '../utils/storage';
import { Play, Shield, Sparkles, Trophy, BookOpen, Volume2, VolumeX } from 'lucide-react';

interface TitleScreenProps {
  profile: MetaProfile;
  selectedHero: HeroClass;
  selectedBiome: BiomeType;
  onSelectHero: (hero: HeroClass) => void;
  onSelectBiome: (biome: BiomeType) => void;
  onStartGame: () => void;
  onOpenUpgrades: () => void;
  onOpenHeroes: () => void;
  onOpenAchievements: () => void;
  onOpenTutorial: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  profile,
  selectedHero,
  selectedBiome,
  onSelectHero,
  onSelectBiome,
  onStartGame,
  onOpenUpgrades,
  onOpenHeroes,
  onOpenAchievements,
  onOpenTutorial,
  isMuted,
  onToggleMute,
}) => {
  const currentHero = HEROES.find((h) => h.id === selectedHero) || HEROES[0];
  const currentBiome = BIOMES.find((b) => b.id === selectedBiome) || BIOMES[0];

  // Enter or Space key to start game immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className={`relative w-full h-full min-h-screen flex flex-col justify-between items-center bg-gradient-to-b ${currentBiome.bgGradient} p-4 sm:p-6 overflow-hidden select-none`}>
      {/* Background Animated Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Header Row: Currencies & Audio */}
      <header className="relative z-10 w-full max-w-xl flex items-center justify-between py-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-emerald-400 font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="tabular-nums">{profile.ecoShards}</span>
            <span className="text-[10px] text-slate-400 font-normal">Shards</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-amber-400 font-bold font-mono">
            <span>🪙</span>
            <span className="tabular-nums">{profile.coins}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTutorial}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="How to Play"
            aria-label="How to Play"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Hero Centerpiece & Bespoke Title Lockup (30-40% negative space) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg w-full text-center my-4">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="mb-4">
          <svg viewBox="0 0 360 84" className="w-72 sm:w-88 h-auto drop-shadow-2xl">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Hexagon rune / Shift brackets */}
            <path d="M 32 20 L 16 42 L 32 64" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 328 20 L 344 42 L 328 64" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Main Wordmark */}
            <text x="180" y="44" textAnchor="middle" fill="url(#titleGrad)" fontFamily="Outfit, system-ui, sans-serif" fontWeight="900" fontSize="38" letterSpacing="3">
              ECO-ROGUE
            </text>
            {/* Sub-kicker */}
            <text x="180" y="68" textAnchor="middle" fill="#CBD5E1" fontFamily="Outfit, system-ui, sans-serif" fontWeight="700" fontSize="13" letterSpacing="6">
              SHIFT &amp; SURVIVE
            </text>
          </svg>
          <div className="text-xs text-emerald-300 font-medium tracking-wider mt-1 opacity-90">
            “Don't move through the world. Move the world around you.”
          </div>
        </div>

        {/* Hero Interactive Avatar Centerpiece */}
        <div className="relative my-4 flex flex-col items-center">
          <div className="relative w-28 h-28 rounded-3xl bg-slate-900/80 border-2 border-emerald-500/50 shadow-2xl flex items-center justify-center p-3 animate-glow">
            {/* Ambient Particle Ring */}
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-transparent to-amber-500/20" />
            <svg viewBox="0 0 48 48" className="w-16 h-16 drop-shadow-xl z-10 animate-float">
              <circle cx="24" cy="20" r="12" fill="#10B981" stroke="#064E3B" strokeWidth="2.5" />
              <circle cx="20" cy="19" r="2.5" fill="#FFFFFF" />
              <circle cx="28" cy="19" r="2.5" fill="#FFFFFF" />
              <circle cx="20" cy="19" r="1.4" fill="#022C22" />
              <circle cx="28" cy="19" r="1.4" fill="#022C22" />
              <path d="M15 28 C 19 36, 29 36, 33 28 C 31 39, 17 39, 15 28 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
              <path d="M10 40 Q 24 33 38 40 L 40 48 L 8 48 Z" fill="#065F46" stroke="#022C22" strokeWidth="2" />
              <polygon points="24,8 28,13 24,18 20,13" fill="#FBBF24" />
            </svg>
          </div>
          <div className="mt-2 text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>{currentHero.name}</span>
            <span className="text-xs text-slate-400 font-normal">· {currentHero.title}</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mt-0.5 leading-normal">
            {currentHero.perkSummary}
          </p>
        </div>

        {/* Primary Start CTA */}
        <div className="w-full max-w-xs mt-3">
          <button
            onClick={onStartGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-lg tracking-wide shadow-2xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>START EXPEDITION</span>
          </button>
          {/* Flat Single Control-Hint Line */}
          <div className="text-[11px] text-slate-400 font-mono mt-2 tracking-wide">
            Press Enter / Space to start · Swipe to shift grid
          </div>
        </div>
      </div>

      {/* Bottom Nav Cards: Biome, Heroes, Upgrades, Milestones */}
      <div className="relative z-10 w-full max-w-xl grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
        {/* Biome selector */}
        <button
          onClick={() => {
            const biomesList: BiomeType[] = ['forest', 'volcano', 'frozen'];
            const nextIdx = (biomesList.indexOf(selectedBiome) + 1) % biomesList.length;
            onSelectBiome(biomesList[nextIdx]);
          }}
          className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-left transition-colors"
        >
          <div className="text-[10px] text-slate-400 font-medium uppercase">Biome</div>
          <div className="text-xs font-bold text-white truncate mt-0.5">{currentBiome.name}</div>
        </button>

        {/* Heroes Roster */}
        <button
          onClick={onOpenHeroes}
          className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-left transition-colors"
        >
          <div className="text-[10px] text-slate-400 font-medium uppercase">Hero</div>
          <div className="text-xs font-bold text-white truncate mt-0.5">{currentHero.name}</div>
        </button>

        {/* Upgrades */}
        <button
          onClick={onOpenUpgrades}
          className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-left transition-colors"
        >
          <div className="text-[10px] text-emerald-400 font-medium uppercase flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Talents
          </div>
          <div className="text-xs font-bold text-white truncate mt-0.5">Sanctuary</div>
        </button>

        {/* Achievements */}
        <button
          onClick={onOpenAchievements}
          className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-left transition-colors"
        >
          <div className="text-[10px] text-amber-400 font-medium uppercase flex items-center gap-1">
            <Trophy className="w-2.5 h-2.5" /> Honors
          </div>
          <div className="text-xs font-bold text-white truncate mt-0.5">Milestones</div>
        </button>
      </div>
    </div>
  );
};
