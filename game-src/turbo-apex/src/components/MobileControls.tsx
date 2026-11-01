import React from 'react';
import { ControlMode } from '../types/game';
import { ArrowLeft, ArrowRight, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { haptics } from '../utils/haptics';

interface MobileControlsProps {
  controlMode: ControlMode;
  isNitroActive: boolean;
  nitroFuel: number;
  onSteerLeft: (active: boolean) => void;
  onSteerRight: (active: boolean) => void;
  onAccelerate: (active: boolean) => void;
  onBrake: (active: boolean) => void;
  onNitro: (active: boolean) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  controlMode,
  isNitroActive,
  nitroFuel,
  onSteerLeft,
  onSteerRight,
  onAccelerate,
  onBrake,
  onNitro,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none z-20 pb-4 px-3 md:px-6 flex justify-between items-end w-full max-w-xl mx-auto select-none">
      {/* Left Thumb Cluster: Steering Buttons (in BUTTONS mode) or Tilt/Drag Indicator */}
      {controlMode === 'BUTTONS' ? (
        <div className="pointer-events-auto flex items-center gap-2.5">
          {/* Steer Left */}
          <button
            type="button"
            className="w-16 h-16 rounded-2xl bg-slate-900/85 active:bg-blue-600/70 backdrop-blur-lg border border-slate-700/80 active:border-cyan-400 flex items-center justify-center text-slate-100 shadow-xl shadow-black/40 active:scale-95 transition-all touch-none"
            onTouchStart={(e) => {
              e.preventDefault();
              haptics.light();
              onSteerLeft(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onSteerLeft(false);
            }}
            onPointerDown={() => {
              haptics.light();
              onSteerLeft(true);
            }}
            onPointerUp={() => onSteerLeft(false)}
            onPointerLeave={() => onSteerLeft(false)}
            aria-label="Steer Left"
          >
            <ArrowLeft className="w-8 h-8 text-cyan-300" />
          </button>

          {/* Steer Right */}
          <button
            type="button"
            className="w-16 h-16 rounded-2xl bg-slate-900/85 active:bg-blue-600/70 backdrop-blur-lg border border-slate-700/80 active:border-cyan-400 flex items-center justify-center text-slate-100 shadow-xl shadow-black/40 active:scale-95 transition-all touch-none"
            onTouchStart={(e) => {
              e.preventDefault();
              haptics.light();
              onSteerRight(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onSteerRight(false);
            }}
            onPointerDown={() => {
              haptics.light();
              onSteerRight(true);
            }}
            onPointerUp={() => onSteerRight(false)}
            onPointerLeave={() => onSteerRight(false)}
            aria-label="Steer Right"
          >
            <ArrowRight className="w-8 h-8 text-cyan-300" />
          </button>
        </div>
      ) : (
        <div className="pointer-events-none bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
          {controlMode === 'DRAG' ? 'Touch & slide anywhere to steer' : 'Tilt phone left/right to steer'}
        </div>
      )}

      {/* Right Thumb Cluster: Nitro Boost, Gas, Brake */}
      <div className="pointer-events-auto flex items-end gap-2.5">
        {/* Brake Button */}
        <button
          type="button"
          className="w-14 h-14 rounded-2xl bg-slate-900/85 active:bg-red-700/80 backdrop-blur-lg border border-slate-700/80 active:border-red-500 flex flex-col items-center justify-center text-slate-200 shadow-xl shadow-black/40 active:scale-95 transition-all touch-none"
          onTouchStart={(e) => {
            e.preventDefault();
            haptics.light();
            onBrake(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onBrake(false);
          }}
          onPointerDown={() => {
            haptics.light();
            onBrake(true);
          }}
          onPointerUp={() => onBrake(false)}
          onPointerLeave={() => onBrake(false)}
          aria-label="Brake"
        >
          <ChevronDown className="w-5 h-5 text-red-400" />
          <span className="text-[10px] font-bold text-slate-300 tracking-wider">BRAKE</span>
        </button>

        {/* Accelerate Gas Pedal */}
        <button
          type="button"
          className="w-14 h-16 rounded-2xl bg-slate-900/85 active:bg-emerald-600/80 backdrop-blur-lg border border-slate-700/80 active:border-emerald-400 flex flex-col items-center justify-center text-slate-100 shadow-xl shadow-black/40 active:scale-95 transition-all touch-none"
          onTouchStart={(e) => {
            e.preventDefault();
            haptics.light();
            onAccelerate(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onAccelerate(false);
          }}
          onPointerDown={() => {
            haptics.light();
            onAccelerate(true);
          }}
          onPointerUp={() => onAccelerate(false)}
          onPointerLeave={() => onAccelerate(false)}
          aria-label="Gas Accelerator"
        >
          <ChevronUp className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-bold text-slate-200 tracking-wider">GAS</span>
        </button>

        {/* NITRO BOOST Big Button */}
        <button
          type="button"
          disabled={nitroFuel <= 0}
          className={`w-16 h-18 rounded-2xl flex flex-col items-center justify-center shadow-xl shadow-cyan-950/40 active:scale-95 transition-all touch-none ${
            nitroFuel > 0
              ? 'bg-gradient-to-t from-cyan-600 to-blue-500 border border-cyan-300/80 text-white shadow-cyan-500/20 active:from-cyan-500 active:to-blue-400'
              : 'bg-slate-900/60 border border-slate-800 text-slate-600 opacity-60'
          }`}
          onTouchStart={(e) => {
            e.preventDefault();
            if (nitroFuel > 0) {
              haptics.nitro();
              onNitro(true);
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onNitro(false);
          }}
          onPointerDown={() => {
            if (nitroFuel > 0) {
              haptics.nitro();
              onNitro(true);
            }
          }}
          onPointerUp={() => onNitro(false)}
          onPointerLeave={() => onNitro(false)}
          aria-label="Nitro Boost"
        >
          <Zap className="w-7 h-7 text-white fill-current animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-wider text-white">
            NITRO
          </span>
        </button>
      </div>
    </div>
  );
};
