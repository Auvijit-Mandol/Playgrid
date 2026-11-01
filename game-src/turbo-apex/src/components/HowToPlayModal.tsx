import React from 'react';
import { sound } from '../utils/audio';
import { ArrowLeft, Zap, Shield, Magnet, Clock, Wrench, CircleDollarSign, AlertTriangle, Smartphone } from 'lucide-react';

interface HowToPlayModalProps {
  onBack: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col text-slate-100 overflow-y-auto">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="min-h-[44px] min-w-[44px] flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-semibold">Back to Menu</span>
        </button>
        <span className="text-sm font-bold text-white">Pilot Manual</span>
      </div>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full p-4 gap-5 pb-12">
        {/* Intro */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="text-lg font-bold text-white font-display">Mission Briefing</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Weave through heavy highway traffic at blistering speeds. Near-miss overtakes multiply your score. Collect coins to unlock faster hypercars and upgrade handling in your garage!
          </p>
        </div>

        {/* Controls Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" />
            Android & Mobile Steering Modes
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block font-semibold mb-0.5">1. Thumb Buttons (Default)</strong>
              <p className="text-slate-400">Tap Left/Right arrows on your left thumb. Hold Gas and Nitro with your right thumb.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block font-semibold mb-0.5">2. Direct Touch Drag</strong>
              <p className="text-slate-400">Touch and slide anywhere on the highway to guide your car directly under your finger.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block font-semibold mb-0.5">3. Gyroscope / Device Tilt</strong>
              <p className="text-slate-400">Tilt your phone left or right like a real steering wheel!</p>
            </div>
          </div>
        </div>

        {/* Power-ups Catalog */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            Pickups & Power-Ups
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Nitro Booster</span>
                <span className="text-slate-400 text-[11px]">Blazing acceleration & invulnerability to small traffic.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50">
              <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Kinetic Shield</span>
                <span className="text-slate-400 text-[11px]">Absorbs heavy crash impacts without damage.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50">
              <Magnet className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Coin Magnet</span>
                <span className="text-slate-400 text-[11px]">Pulls all nearby gold coins and gems to your car.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Chrono Slow-Mo</span>
                <span className="text-slate-400 text-[11px]">Slows down traffic vehicles while you keep full speed.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50">
              <CircleDollarSign className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Coins & Rare Gems</span>
                <span className="text-slate-400 text-[11px]">Collect to buy cars and tuning upgrades in the garage.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50">
              <Wrench className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Repair Wrench</span>
                <span className="text-slate-400 text-[11px]">Restores +40% hull integrity.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic & Hazard Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Traffic & Road Hazards
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-300">
              <span className="text-cyan-400 font-bold shrink-0">•</span>
              <span><strong>Sports Cars:</strong> Watch for flashing orange blinkers! They change lanes unpredictably.</span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <span className="text-amber-400 font-bold shrink-0">•</span>
              <span><strong>Semi-Trucks:</strong> Long 18-wheelers that take time to overtake. Don't get trapped behind them.</span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <span className="text-purple-400 font-bold shrink-0">•</span>
              <span><strong>Oil Slicks:</strong> Dark pavement spills that cause severe drift spinouts.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
