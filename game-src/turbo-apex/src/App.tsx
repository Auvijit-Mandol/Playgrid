/**
 * Turbo Apex - 2D Arcade Car Racing Game
 * Optimized for Android and Mobile Touch Devices
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CarDefinition,
  ControlMode,
  GameState,
  GameStats,
  HighScoreRecord,
  TrackEnvironment,
} from './types/game';
import {
  loadCars,
  loadCoins,
  loadHighScore,
  loadSelectedCarId,
  loadSettings,
  saveCars,
  saveCoins,
  saveHighScore,
  saveSelectedCarId,
  saveSettings,
} from './utils/storage';
import { UPGRADE_COSTS } from './utils/carData';
import { sound } from './utils/audio';
import { haptics } from './utils/haptics';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useDeviceTilt } from './hooks/useDeviceTilt';
import { GameCanvas } from './game/GameCanvas';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { TitleScreen } from './components/TitleScreen';
import { GarageModal } from './components/GarageModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';

export default function App() {
  // --- Persistent Storage State ---
  const [cars, setCars] = useState<CarDefinition[]>(() => loadCars());
  const [selectedCarId, setSelectedCarId] = useState<string>(() => loadSelectedCarId());
  const [coins, setCoins] = useState<number>(() => loadCoins());
  const [highScore, setHighScore] = useState<HighScoreRecord>(() => loadHighScore());
  const [settings, setSettings] = useState(() => loadSettings());

  // --- Session Game State ---
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [currentStats, setCurrentStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    speed: 0,
    maxSpeedReached: 0,
    coinsCollected: 0,
    nearMissCount: 0,
    comboMultiplier: 1,
    health: 100,
    maxHealth: 100,
    shieldHits: 2,
    maxShieldHits: 2,
    nitroFuel: 100,
    isNitroActive: false,
    timeRemainingSlowMo: 0,
  });

  const [lastRunStats, setLastRunStats] = useState<GameStats | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // --- Real-Time Control Inputs ---
  const [isSteeringLeft, setIsSteeringLeft] = useState(false);
  const [isSteeringRight, setIsSteeringRight] = useState(false);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isBraking, setIsBraking] = useState(false);
  const [isNitroPressed, setIsNitroPressed] = useState(false);

  // PWA & Device Tilt Hooks
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { tiltX } = useDeviceTilt(gameState === 'PLAYING' && settings.controlMode === 'TILT');

  // Selected car object
  const currentCar = cars.find((c) => c.id === selectedCarId) || cars[0];

  // Sync settings with audio and haptics
  useEffect(() => {
    sound.setSoundEnabled(settings.soundEnabled);
    haptics.setEnabled(settings.hapticsEnabled);
    saveSettings(settings);
  }, [settings]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (gameState !== 'PLAYING') {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          if (gameState === 'PAUSED') setGameState('PLAYING');
        }
        return;
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          setIsSteeringLeft(true);
          break;
        case 'ArrowRight':
        case 'KeyD':
          setIsSteeringRight(true);
          break;
        case 'ArrowUp':
        case 'KeyW':
          setIsAccelerating(true);
          break;
        case 'ArrowDown':
        case 'KeyS':
          setIsBraking(true);
          break;
        case 'Space':
        case 'KeyN':
          setIsNitroPressed(true);
          break;
        case 'Escape':
        case 'KeyP':
          setGameState('PAUSED');
          sound.stopEngine();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          setIsSteeringLeft(false);
          break;
        case 'ArrowRight':
        case 'KeyD':
          setIsSteeringRight(false);
          break;
        case 'ArrowUp':
        case 'KeyW':
          setIsAccelerating(false);
          break;
        case 'ArrowDown':
        case 'KeyS':
          setIsBraking(false);
          break;
        case 'Space':
        case 'KeyN':
          setIsNitroPressed(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Reset inputs when switching states
  const clearInputs = useCallback(() => {
    setIsSteeringLeft(false);
    setIsSteeringRight(false);
    setIsAccelerating(false);
    setIsBraking(false);
    setIsNitroPressed(false);
  }, []);

  // --- Handlers ---
  const handleStartRace = () => {
    clearInputs();
    setGameState('PLAYING');
  };

  const handlePause = () => {
    clearInputs();
    setGameState('PAUSED');
    sound.stopEngine();
  };

  const handleResume = () => {
    clearInputs();
    setGameState('PLAYING');
  };

  const handleRestart = () => {
    clearInputs();
    setGameState('PLAYING');
  };

  const handleHome = () => {
    clearInputs();
    sound.stopEngine();
    setGameState('TITLE');
  };

  const handleGameOver = useCallback((finalStats: GameStats) => {
    clearInputs();
    setLastRunStats(finalStats);

    // Update wallet coins
    const newCoinsTotal = coins + finalStats.coinsCollected;
    setCoins(newCoinsTotal);
    saveCoins(newCoinsTotal);

    // Check for high score
    let isRecord = false;
    if (finalStats.score > highScore.score) {
      isRecord = true;
      const newRecord: HighScoreRecord = {
        score: finalStats.score,
        distance: finalStats.distance,
        topSpeed: finalStats.maxSpeedReached,
        date: new Date().toLocaleDateString(),
      };
      setHighScore(newRecord);
      saveHighScore(newRecord);
    }
    setIsNewHighScore(isRecord);
    setGameState('GAME_OVER');
  }, [coins, highScore, clearInputs]);

  // Car Selection & Upgrades
  const handleSelectCar = (carId: string) => {
    setSelectedCarId(carId);
    saveSelectedCarId(carId);
  };

  const handleBuyCar = (carId: string) => {
    const carToBuy = cars.find((c) => c.id === carId);
    if (!carToBuy || coins < carToBuy.price) return;

    const updatedCoins = coins - carToBuy.price;
    const updatedCars = cars.map((c) => (c.id === carId ? { ...c, unlocked: true } : c));

    setCoins(updatedCoins);
    saveCoins(updatedCoins);
    setCars(updatedCars);
    saveCars(updatedCars);
    setSelectedCarId(carId);
    saveSelectedCarId(carId);
  };

  const handleUpgradeStat = (
    carId: string,
    stat: 'speed' | 'accel' | 'handling' | 'shieldMax' | 'nitroCap'
  ) => {
    const carToUpgrade = cars.find((c) => c.id === carId);
    if (!carToUpgrade) return;
    const currentLevel = carToUpgrade.upgrades[stat];
    const cost = UPGRADE_COSTS[currentLevel] || 500;
    if (coins < cost) return;

    const updatedCoins = coins - cost;
    const updatedCars = cars.map((c) => {
      if (c.id === carId) {
        return {
          ...c,
          upgrades: {
            ...c.upgrades,
            [stat]: currentLevel + 1,
          },
        };
      }
      return c;
    });

    setCoins(updatedCoins);
    saveCoins(updatedCoins);
    setCars(updatedCars);
    saveCars(updatedCars);
  };

  // Settings Toggles
  const handleToggleSound = () => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleToggleHaptics = () => {
    setSettings((prev) => ({ ...prev, hapticsEnabled: !prev.hapticsEnabled }));
  };

  const handleSelectTrack = (track: TrackEnvironment) => {
    setSettings((prev) => ({ ...prev, track }));
  };

  const handleSelectControlMode = (controlMode: ControlMode) => {
    setSettings((prev) => ({ ...prev, controlMode }));
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none">
      {/* 1. TITLE SCREEN */}
      {gameState === 'TITLE' && (
        <TitleScreen
          selectedCar={currentCar}
          coins={coins}
          highScore={highScore}
          track={settings.track}
          controlMode={settings.controlMode}
          soundEnabled={settings.soundEnabled}
          hapticsEnabled={settings.hapticsEnabled}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          onStartRace={handleStartRace}
          onOpenGarage={() => setGameState('GARAGE')}
          onOpenHowToPlay={() => setGameState('HOW_TO_PLAY')}
          onSelectTrack={handleSelectTrack}
          onSelectControlMode={handleSelectControlMode}
          onToggleSound={handleToggleSound}
          onToggleHaptics={handleToggleHaptics}
          onInstall={install}
        />
      )}

      {/* 2. PLAYING CANVAS & ACTIVE CONTROLS */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <div className="relative w-full h-full flex-1 overflow-hidden">
          {/* Game Canvas */}
          <GameCanvas
            car={currentCar}
            track={settings.track}
            controlMode={settings.controlMode}
            tiltX={tiltX}
            isSteeringLeft={isSteeringLeft}
            isSteeringRight={isSteeringRight}
            isAccelerating={isAccelerating}
            isBraking={isBraking}
            isNitroPressed={isNitroPressed}
            onGameOver={handleGameOver}
            onStatsUpdate={setCurrentStats}
            isPaused={gameState === 'PAUSED'}
          />

          {/* HUD Overlay */}
          <HUD
            stats={currentStats}
            highScore={highScore.score}
            onPause={handlePause}
          />

          {/* Mobile Touch Pedals & Steering Buttons */}
          <MobileControls
            controlMode={settings.controlMode}
            isNitroActive={currentStats.isNitroActive}
            nitroFuel={currentStats.nitroFuel}
            onSteerLeft={setIsSteeringLeft}
            onSteerRight={setIsSteeringRight}
            onAccelerate={setIsAccelerating}
            onBrake={setIsBraking}
            onNitro={setIsNitroPressed}
          />
        </div>
      )}

      {/* 3. PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <PauseModal
          controlMode={settings.controlMode}
          soundEnabled={settings.soundEnabled}
          hapticsEnabled={settings.hapticsEnabled}
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          onToggleSound={handleToggleSound}
          onToggleHaptics={handleToggleHaptics}
          onChangeControlMode={handleSelectControlMode}
        />
      )}

      {/* 4. GAME OVER RESULTS */}
      {gameState === 'GAME_OVER' && lastRunStats && (
        <GameOverModal
          finalStats={lastRunStats}
          isNewHighScore={isNewHighScore}
          totalCoins={coins}
          onRestart={handleRestart}
          onOpenGarage={() => setGameState('GARAGE')}
          onHome={handleHome}
        />
      )}

      {/* 5. GARAGE & SHOWROOM */}
      {gameState === 'GARAGE' && (
        <GarageModal
          cars={cars}
          selectedCarId={selectedCarId}
          coins={coins}
          onSelectCar={handleSelectCar}
          onBuyCar={handleBuyCar}
          onUpgradeStat={handleUpgradeStat}
          onBack={() => setGameState('TITLE')}
        />
      )}

      {/* 6. HOW TO PLAY / PILOT MANUAL */}
      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlayModal onBack={() => setGameState('TITLE')} />
      )}
    </div>
  );
}
