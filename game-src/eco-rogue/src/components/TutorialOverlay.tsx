import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const STEPS = [
  {
    step: 1,
    title: 'The Central Philosophy',
    heading: '“Don’t move through the world. Move the world around you.”',
    text: 'You never move the hero directly. Instead, swipe rows left/right and columns up/down on the 5×5 battlefield. Tiles wrap smoothly around the board edges!',
    tip: 'Try swiping any row horizontally or use the edge chevron buttons.',
  },
  {
    step: 2,
    title: 'Automatic Crafting',
    heading: 'Combine Resources Directly on the Board',
    text: 'When two matching resources touch horizontally or vertically (Wood + Wood, Stone + Stone, Herb + Herb), they instantly fuse into powerful items like Wooden Shields, Stone Hammers, and Healing Potions!',
    tip: 'No complex crafting menus—just shift resources together.',
  },
  {
    step: 3,
    title: 'Hero Interaction',
    heading: 'Automatic Gathering & Equipping',
    text: 'Shift resources, chests, or potions adjacent to your Hero. The hero automatically gathers wood/stone, drinks healing potions when wounded, and equips crafted shields to absorb damage.',
    tip: 'Positioning is your primary superpower.',
  },
  {
    step: 4,
    title: 'Tactical Combat',
    heading: 'Strike First, Read Enemy Intent',
    text: 'Whenever an enemy lands adjacent to your Hero, the Hero attacks automatically! Look at enemy danger indicators (like !12) to see what they will do on their turn.',
    tip: 'Keep enemies at bay until you craft a shield or strike with overwhelming damage.',
  },
  {
    step: 5,
    title: 'Roguelike Progression',
    heading: 'Survive Waves & Defeat Titans',
    text: 'Clear waves to choose 1 of 3 game-changing perks (Fire Chain, Whirlwind Shift, Resource Magnet). Reach Wave 5 to confront the Biome Boss, then earn permanent Eco Shards for the Sanctuary upgrade tree!',
    tip: 'You are ready to enter the grid. Good luck, Wanderer!',
  },
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const stepData = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
              Step {stepData.step} / {STEPS.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">{stepData.title}</span>
          </div>
          <button
            onClick={onComplete}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Content */}
        <div className="py-5">
          <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
            {stepData.heading}
          </h2>
          <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
            {stepData.text}
          </p>

          <div className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{stepData.tip}</span>
          </div>
        </div>

        {/* Step dots & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'bg-emerald-400 w-5' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span>{currentStep === STEPS.length - 1 ? 'Start Expedition' : 'Next Step'}</span>
            {currentStep === STEPS.length - 1 ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
