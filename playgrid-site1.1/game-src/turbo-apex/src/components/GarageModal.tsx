import React, { useState } from 'react';
import { CarDefinition } from '../types/game';
import { UPGRADE_COSTS, MAX_UPGRADE_LEVEL } from '../utils/carData';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import { ArrowLeft, Check, CircleDollarSign, Gauge, Shield, Zap, Wrench, Sparkles } from 'lucide-react';

interface GarageModalProps {
  cars: CarDefinition[];
  selectedCarId: string;
  coins: number;
  onSelectCar: (carId: string) => void;
  onBuyCar: (carId: string) => void;
  onUpgradeStat: (carId: string, stat: 'speed' | 'accel' | 'handling' | 'shieldMax' | 'nitroCap') => void;
  onBack: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  cars,
  selectedCarId,
  coins,
  onSelectCar,
  onBuyCar,
  onUpgradeStat,
  onBack,
}) => {
  const [activeCarId, setActiveCarId] = useState<string>(selectedCarId);
  const activeCar = cars.find((c) => c.id === activeCarId) || cars[0];

  const handleSelect = () => {
    sound.playClick();
    haptics.light();
    onSelectCar(activeCar.id);
  };

  const handleBuy = () => {
    if (coins >= activeCar.price) {
      sound.playPowerup();
      haptics.powerup();
      onBuyCar(activeCar.id);
    }
  };

  const handleUpgrade = (stat: 'speed' | 'accel' | 'handling' | 'shieldMax' | 'nitroCap') => {
    const currentLevel = activeCar.upgrades[stat];
    if (currentLevel >= MAX_UPGRADE_LEVEL) return;
    const cost = UPGRADE_COSTS[currentLevel] || 500;
    if (coins >= cost) {
      sound.playPowerup();
      haptics.light();
      onUpgradeStat(activeCar.id, stat);
    }
  };

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

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <CircleDollarSign className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold font-mono tabular-nums text-amber-300">
            {coins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Garage View */}
      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full p-4 gap-4">
        {/* Showroom Podium */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 min-h-[200px] flex flex-col items-center justify-center p-6 shadow-2xl">
          {/* Background Workshop Image */}
          <img
            src="images/garage_showroom_1792860097990.jpg"
            alt="Garage Showroom"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Car Display Vector */}
          <div className="relative z-10 flex flex-col items-center">
            {/* 2D Top-down car preview */}
            <div
              className="relative w-16 h-32 rounded-xl shadow-2xl transition-transform duration-300 transform hover:scale-105"
              style={{
                backgroundColor: activeCar.color,
                boxShadow: `0 0 25px ${activeCar.glowColor}55`,
              }}
            >
              {/* Racing Stripe */}
              <div
                className="absolute inset-x-6 inset-y-0"
                style={{ backgroundColor: activeCar.accentColor }}
              />
              {/* Cabin Glass */}
              <div className="absolute inset-x-2 top-8 bottom-10 bg-slate-950 rounded-lg">
                <div className="absolute inset-x-1 top-1 h-3 bg-cyan-400/80 rounded" />
                <div className="absolute inset-x-1 bottom-1 h-2 bg-blue-500/80 rounded" />
              </div>
              {/* Headlights */}
              <div className="absolute top-0 left-1 w-2.5 h-1.5 bg-yellow-200 rounded-t shadow-sm" />
              <div className="absolute top-0 right-1 w-2.5 h-1.5 bg-yellow-200 rounded-t shadow-sm" />
              {/* Taillights */}
              <div className="absolute bottom-0 left-1 w-2.5 h-1.5 bg-red-600 rounded-b shadow-sm" />
              <div className="absolute bottom-0 right-1 w-2.5 h-1.5 bg-red-600 rounded-b shadow-sm" />
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold font-display text-white tracking-wide">
                {activeCar.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{activeCar.tagline}</p>
            </div>
          </div>
        </div>

        {/* Car Selection Carousel / Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {cars.map((car) => {
            const isCurrent = car.id === activeCarId;
            const isEquipped = car.id === selectedCarId;
            return (
              <button
                key={car.id}
                onClick={() => {
                  sound.playClick();
                  setActiveCarId(car.id);
                }}
                className={`relative p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all min-h-[58px] ${
                  isCurrent
                    ? 'border-cyan-400 bg-slate-800/90 shadow-md shadow-cyan-950/50'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/50'
                }`}
              >
                <div
                  className="w-4 h-8 rounded-sm"
                  style={{ backgroundColor: car.color }}
                />
                <span className="text-[11px] font-semibold truncate w-full text-center">
                  {car.name}
                </span>

                {isEquipped && (
                  <span className="text-[9px] font-bold text-cyan-400 uppercase">
                    Active
                  </span>
                )}
                {!car.unlocked && (
                  <span className="text-[9px] font-medium text-amber-400">
                    {car.price}c
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Buy or Select Action */}
        <div>
          {activeCar.unlocked ? (
            <button
              onClick={handleSelect}
              disabled={activeCar.id === selectedCarId}
              className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 ${
                activeCar.id === selectedCarId
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30'
              }`}
            >
              {activeCar.id === selectedCarId ? (
                <>
                  <Check className="w-4 h-4 text-cyan-400" />
                  Currently Equipped
                </>
              ) : (
                'Equip Car'
              )}
            </button>
          ) : (
            <button
              onClick={handleBuy}
              disabled={coins < activeCar.price}
              className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 ${
                coins >= activeCar.price
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-900/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <CircleDollarSign className="w-4 h-4" />
              {coins >= activeCar.price
                ? `Unlock for ${activeCar.price} Coins`
                : `Need ${activeCar.price - coins} more coins`}
            </button>
          )}
        </div>

        {/* Upgrades Section */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-cyan-400" />
              Performance Upgrades
            </h3>
            <span className="text-xs text-slate-500">Max Level {MAX_UPGRADE_LEVEL}</span>
          </div>

          {/* Upgrades List */}
          {(
            [
              { key: 'speed', label: 'Top Speed', icon: Gauge },
              { key: 'accel', label: 'Acceleration', icon: Sparkles },
              { key: 'handling', label: 'Handling', icon: Wrench },
              { key: 'shieldMax', label: 'Shield Capacity', icon: Shield },
              { key: 'nitroCap', label: 'Nitro Duration', icon: Zap },
            ] as const
          ).map(({ key, label, icon: Icon }) => {
            const level = activeCar.upgrades[key];
            const isMax = level >= MAX_UPGRADE_LEVEL;
            const cost = UPGRADE_COSTS[level] || 500;
            const canAfford = coins >= cost;

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3 py-2 border-b border-slate-800/80 last:border-none"
              >
                <div className="flex items-center gap-2.5 min-w-[120px]">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-200">{label}</span>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: MAX_UPGRADE_LEVEL }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3.5 h-1.5 rounded-sm ${
                            i < level ? 'bg-cyan-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {activeCar.unlocked ? (
                  <button
                    onClick={() => handleUpgrade(key)}
                    disabled={isMax || !canAfford}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 min-h-[36px] transition-colors ${
                      isMax
                        ? 'bg-slate-800 text-slate-500 cursor-default'
                        : canAfford
                        ? 'bg-cyan-900/60 border border-cyan-500 text-cyan-200 hover:bg-cyan-800/60 active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {isMax ? (
                      'MAX'
                    ) : (
                      <>
                        <CircleDollarSign className="w-3.5 h-3.5 text-amber-400" />
                        <span>{cost}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-slate-500">Locked</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
