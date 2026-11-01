import React from 'react';
import { ControlMode } from '../types/game';
import { sound } from '../utils/audio';
import { Play, RotateCcw, Home, Volume2, VolumeX, Smartphone, Vibrate } from 'lucide-react';

interface PauseModalProps {
  controlMode: ControlMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onChangeControlMode: (mode: ControlMode) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  controlMode,
  soundEnabled,
  hapticsEnabled,
  onResume,
  onRestart,
  onHome,
  onToggleSound,
  onToggleHaptics,
  onChangeControlMode,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-black font-display text-white tracking-wide">
            RACE PAUSED
          </h2>
          <p className="text-xs text-slate-400 mt-1">Adjust controls or take a breather</p>
        </div>

        {/* Controls segmented tabs */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Control Mode
          </span>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(
              [
                { id: 'BUTTONS', label: 'Buttons' },
                { id: 'DRAG', label: 'Drag' },
                { id: 'TILT', label: 'Tilt Gyro' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onChangeControlMode(item.id);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                  controlMode === item.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Toggles: Sound & Haptics */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Sound {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleHaptics();
            }}
            className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-colors ${
              hapticsEnabled
                ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <Vibrate className="w-4 h-4" />
            <span>Vibrate {hapticsEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          {/* Resume */}
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full h-12 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Race</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Race</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="w-full h-11 rounded-xl bg-transparent hover:bg-slate-800/50 active:scale-98 text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Exit to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
