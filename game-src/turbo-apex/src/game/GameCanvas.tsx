import React, { useEffect, useRef } from 'react';
import { CarDefinition, ControlMode, GameStats, PowerUpType, TrackEnvironment } from '../types/game';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';

interface GameCanvasProps {
  car: CarDefinition;
  track: TrackEnvironment;
  controlMode: ControlMode;
  tiltX: number;
  isSteeringLeft: boolean;
  isSteeringRight: boolean;
  isAccelerating: boolean;
  isBraking: boolean;
  isNitroPressed: boolean;
  onGameOver: (finalStats: GameStats) => void;
  onStatsUpdate: (stats: GameStats) => void;
  isPaused: boolean;
}

interface Obstacle {
  id: number;
  type: 'sedan' | 'semi' | 'sports' | 'police' | 'oil_slick' | 'road_barrier' | 'pothole';
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  lane: number;
  targetLane?: number;
  laneChangeTimer?: number;
  blinkerTimer?: number;
  passedPlayer?: boolean;
}

interface Pickup {
  id: number;
  type: PowerUpType | 'gem';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface SkidMark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  car,
  track,
  controlMode,
  tiltX,
  isSteeringLeft,
  isSteeringRight,
  isAccelerating,
  isBraking,
  isNitroPressed,
  onGameOver,
  onStatsUpdate,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game state held in refs for 60fps loop without React re-render lag
  const gameStateRef = useRef<{
    carX: number;
    carY: number;
    carWidth: number;
    carHeight: number;
    carAngle: number;
    speed: number;
    maxSpeed: number;
    score: number;
    distance: number;
    maxSpeedReached: number;
    coins: number;
    nearMissCount: number;
    comboMultiplier: number;
    comboResetTimer: number;
    health: number;
    maxHealth: number;
    shieldHits: number;
    maxShieldHits: number;
    nitroFuel: number;
    isNitroActive: boolean;
    nitroTimer: number;
    magnetTimer: number;
    slowMoTimer: number;
    oilSpinTimer: number;
    obstacles: Obstacle[];
    pickups: Pickup[];
    particles: Particle[];
    skidMarks: SkidMark[];
    floatingTexts: FloatingText[];
    roadOffset: number;
    nextSpawnDistance: number;
    nextPickupDistance: number;
    cameraShake: number;
    lastTime: number;
    isGameOver: boolean;
  }>({
    carX: 0,
    carY: 0,
    carWidth: 38,
    carHeight: 72,
    carAngle: 0,
    speed: 0,
    maxSpeed: 160 + car.upgrades.speed * 20,
    score: 0,
    distance: 0,
    maxSpeedReached: 0,
    coins: 0,
    nearMissCount: 0,
    comboMultiplier: 1,
    comboResetTimer: 0,
    health: 100,
    maxHealth: 100,
    shieldHits: car.upgrades.shieldMax,
    maxShieldHits: car.upgrades.shieldMax,
    nitroFuel: 100,
    isNitroActive: false,
    nitroTimer: 0,
    magnetTimer: 0,
    slowMoTimer: 0,
    oilSpinTimer: 0,
    obstacles: [],
    pickups: [],
    particles: [],
    skidMarks: [],
    floatingTexts: [],
    roadOffset: 0,
    nextSpawnDistance: 120,
    nextPickupDistance: 80,
    cameraShake: 0,
    lastTime: 0,
    isGameOver: false,
  });

  // Direct pointer drag tracking
  const pointerDragRef = useRef<{ isDragging: boolean; startX: number; carStartX: number }>({
    isDragging: false,
    startX: 0,
    carStartX: 0,
  });

  useEffect(() => {
    const s = gameStateRef.current;
    s.maxSpeed = 160 + car.upgrades.speed * 20;
    s.shieldHits = car.upgrades.shieldMax;
    s.maxShieldHits = car.upgrades.shieldMax;
  }, [car]);

  // Main Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sound.startEngine();

    let animationFrameId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      // Initialize car position centered
      if (gameStateRef.current.carX === 0) {
        gameStateRef.current.carX = rect.width / 2;
        gameStateRef.current.carY = rect.height - 140;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Pointer events for direct touch dragging anywhere on road
    const handlePointerDown = (e: PointerEvent) => {
      if (controlMode !== 'DRAG') return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      pointerDragRef.current = {
        isDragging: true,
        startX: x,
        carStartX: gameStateRef.current.carX,
      };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!pointerDragRef.current.isDragging || controlMode !== 'DRAG') return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const delta = (x - pointerDragRef.current.startX) * 1.2;
      gameStateRef.current.carX = pointerDragRef.current.carStartX + delta;
    };

    const handlePointerUp = () => {
      pointerDragRef.current.isDragging = false;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Game loop tick
    const loop = (currentTime: number) => {
      const s = gameStateRef.current;
      if (!s.lastTime) s.lastTime = currentTime;
      const dt = Math.min((currentTime - s.lastTime) / 1000, 0.1);
      s.lastTime = currentTime;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Road bounds: responsive centered road
      const roadWidth = Math.min(width * 0.88, 480);
      const roadLeft = (width - roadWidth) / 2;
      const roadRight = roadLeft + roadWidth;
      const laneCount = 4;
      const laneWidth = roadWidth / laneCount;

      if (!isPaused && !s.isGameOver) {
        // --- 1. ACCELERATION & SPEED ---
        const accelRate = (40 + car.upgrades.accel * 12) * dt;
        const brakeRate = 80 * dt;
        const naturalFriction = 20 * dt;

        // Nitro handling
        const wantsNitro = isNitroPressed && s.nitroFuel > 0;
        if (wantsNitro) {
          s.isNitroActive = true;
          s.nitroFuel = Math.max(0, s.nitroFuel - 25 * dt);
          s.cameraShake = Math.max(s.cameraShake, 2);
          haptics.nitro();
        } else {
          s.isNitroActive = false;
          // Slowly regenerate nitro when not boosting
          s.nitroFuel = Math.min(100, s.nitroFuel + 6 * dt);
        }

        const effectiveMaxSpeed = s.isNitroActive ? s.maxSpeed * 1.45 : s.maxSpeed;

        if (isAccelerating || wantsNitro) {
          s.speed = Math.min(effectiveMaxSpeed, s.speed + accelRate * (s.isNitroActive ? 2.0 : 1.0));
        } else if (isBraking) {
          s.speed = Math.max(30, s.speed - brakeRate);
        } else {
          // Cruise along
          const cruiseSpeed = s.maxSpeed * 0.7;
          if (s.speed < cruiseSpeed) {
            s.speed = Math.min(cruiseSpeed, s.speed + accelRate * 0.5);
          } else if (s.speed > cruiseSpeed) {
            s.speed = Math.max(cruiseSpeed, s.speed - naturalFriction);
          }
        }

        if (s.speed > s.maxSpeedReached) {
          s.maxSpeedReached = Math.round(s.speed);
        }

        // Distance & score calculation
        const speedKmh = s.speed;
        const distanceDelta = (speedKmh * 1000) / 3600 * dt;
        s.distance += distanceDelta;
        s.score += Math.round(distanceDelta * 2 * s.comboMultiplier * (s.isNitroActive ? 1.8 : 1.0));
        s.roadOffset = (s.roadOffset + (speedKmh * 3.5 * dt)) % 80;

        // Sound update
        sound.updateEngine(s.speed / s.maxSpeed, s.isNitroActive);

        // SlowMo timer
        if (s.slowMoTimer > 0) {
          s.slowMoTimer -= dt;
        }

        // Magnet timer
        if (s.magnetTimer > 0) {
          s.magnetTimer -= dt;
        }

        // Combo timer
        if (s.comboMultiplier > 1) {
          s.comboResetTimer -= dt;
          if (s.comboResetTimer <= 0) {
            s.comboMultiplier = 1;
          }
        }

        // Camera shake decay
        if (s.cameraShake > 0) {
          s.cameraShake = Math.max(0, s.cameraShake - dt * 10);
        }

        // --- 2. STEERING & LATERAL PHYSICS ---
        let steerDirection = 0;
        if (controlMode === 'BUTTONS') {
          if (isSteeringLeft) steerDirection -= 1;
          if (isSteeringRight) steerDirection += 1;
        } else if (controlMode === 'TILT') {
          steerDirection = tiltX;
        }

        // Oil slick spin effect
        if (s.oilSpinTimer > 0) {
          s.oilSpinTimer -= dt;
          steerDirection += Math.sin(currentTime * 0.02) * 1.5;
          sound.playDrift();
        }

        const handlingBase = 220 + car.upgrades.handling * 35;
        const lateralSpeed = handlingBase * steerDirection * dt;
        s.carX += lateralSpeed;

        // Target angle based on lateral movement
        const targetAngle = (lateralSpeed / (handlingBase * dt || 1)) * 0.28;
        s.carAngle = s.carAngle * 0.75 + targetAngle * 0.25;

        // Boundary constraints (stay within road shoulders)
        const minCarX = roadLeft + s.carWidth / 2 + 8;
        const maxCarX = roadRight - s.carWidth / 2 - 8;
        if (s.carX < minCarX) {
          s.carX = minCarX;
          s.carAngle = 0;
          s.cameraShake = Math.max(s.cameraShake, 1.5);
          haptics.light();
        } else if (s.carX > maxCarX) {
          s.carX = maxCarX;
          s.carAngle = 0;
          s.cameraShake = Math.max(s.cameraShake, 1.5);
          haptics.light();
        }

        // --- 3. EXHAUST & TIRE PARTICLES ---
        if (s.speed > 50) {
          // Exhaust smoke or nitro fire
          const rearY = s.carY + s.carHeight / 2;
          const leftPipeX = s.carX - 10;
          const rightPipeX = s.carX + 10;

          if (s.isNitroActive) {
            // Intense dual cyan & orange nitro thruster flames
            for (let i = 0; i < 3; i++) {
              s.particles.push({
                x: leftPipeX + (Math.random() - 0.5) * 4,
                y: rearY + Math.random() * 6,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() * 80 + 140) * (s.speed / 100),
                size: Math.random() * 6 + 4,
                color: Math.random() > 0.4 ? '#06b6d4' : '#f97316',
                alpha: 0.9,
                life: 0.18,
                maxLife: 0.18,
              });
              s.particles.push({
                x: rightPipeX + (Math.random() - 0.5) * 4,
                y: rearY + Math.random() * 6,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() * 80 + 140) * (s.speed / 100),
                size: Math.random() * 6 + 4,
                color: Math.random() > 0.4 ? '#06b6d4' : '#f97316',
                alpha: 0.9,
                life: 0.18,
                maxLife: 0.18,
              });
            }
          } else if (Math.random() < 0.35) {
            // Subtle exhaust puff
            s.particles.push({
              x: s.carX + (Math.random() - 0.5) * 14,
              y: rearY,
              vx: (Math.random() - 0.5) * 10,
              vy: Math.random() * 30 + 40,
              size: Math.random() * 4 + 2,
              color: '#94a3b8',
              alpha: 0.4,
              life: 0.25,
              maxLife: 0.25,
            });
          }

          // Tire skid marks during sharp turn
          if (Math.abs(s.carAngle) > 0.14) {
            s.skidMarks.push({
              x1: s.carX - 12,
              y1: rearY,
              x2: s.carX - 12 - lateralSpeed * 0.4,
              y2: rearY - 6,
              alpha: 0.45,
            });
            s.skidMarks.push({
              x1: s.carX + 12,
              y1: rearY,
              x2: s.carX + 12 - lateralSpeed * 0.4,
              y2: rearY - 6,
              alpha: 0.45,
            });
          }
        }

        // --- 4. SPAWN OBSTACLES & PICKUPS ---
        const trafficSpeedModifier = s.slowMoTimer > 0 ? 0.35 : 1.0;
        const relativeWorldSpeed = (s.speed * 4.5 * dt) * trafficSpeedModifier;

        s.nextSpawnDistance -= relativeWorldSpeed;
        if (s.nextSpawnDistance <= 0) {
          // Dynamic interval based on speed to ensure challenging but playable gaps
          s.nextSpawnDistance = Math.max(140, 280 - (s.distance / 500) * 20);

          const lane = Math.floor(Math.random() * laneCount);
          const laneCenterX = roadLeft + lane * laneWidth + laneWidth / 2;

          // Pick obstacle type based on game progress
          const rand = Math.random();
          let type: Obstacle['type'] = 'sedan';
          let obsWidth = 36;
          let obsHeight = 68;
          let obsSpeed = s.maxSpeed * (0.35 + Math.random() * 0.25);
          let obsColor = ['#3b82f6', '#e2e8f0', '#10b981', '#64748b'][Math.floor(Math.random() * 4)];

          if (rand < 0.28) {
            type = 'semi';
            obsWidth = 44;
            obsHeight = 120;
            obsSpeed = s.maxSpeed * 0.32;
            obsColor = '#d97706';
          } else if (rand < 0.5) {
            type = 'sports';
            obsWidth = 36;
            obsHeight = 66;
            obsSpeed = s.maxSpeed * 0.55;
            obsColor = '#ef4444';
          } else if (rand < 0.65 && s.distance > 300) {
            type = 'police';
            obsWidth = 38;
            obsHeight = 70;
            obsSpeed = s.maxSpeed * 0.48;
            obsColor = '#1e293b';
          } else if (rand < 0.78) {
            type = 'oil_slick';
            obsWidth = 48;
            obsHeight = 40;
            obsSpeed = 0; // stationary on asphalt
            obsColor = '#18181b';
          } else if (rand < 0.9) {
            type = 'road_barrier';
            obsWidth = 52;
            obsHeight = 24;
            obsSpeed = 0;
            obsColor = '#ea580c';
          }

          s.obstacles.push({
            id: Date.now() + Math.random(),
            type,
            x: laneCenterX,
            y: -obsHeight - 20,
            width: obsWidth,
            height: obsHeight,
            speed: obsSpeed,
            color: obsColor,
            lane,
            targetLane: lane,
            laneChangeTimer: type === 'sports' ? Math.random() * 2 + 1 : 0,
            blinkerTimer: 0,
          });
        }

        // Spawn Pickups
        s.nextPickupDistance -= relativeWorldSpeed;
        if (s.nextPickupDistance <= 0) {
          s.nextPickupDistance = Math.random() * 120 + 90;
          const lane = Math.floor(Math.random() * laneCount);
          const laneCenterX = roadLeft + lane * laneWidth + laneWidth / 2;

          const pRand = Math.random();
          let pType: Pickup['type'] = 'coin';
          if (pRand < 0.45) {
            pType = 'coin';
          } else if (pRand < 0.6) {
            pType = 'gem';
          } else if (pRand < 0.72) {
            pType = 'nitro';
          } else if (pRand < 0.82) {
            pType = 'shield';
          } else if (pRand < 0.9) {
            pType = 'magnet';
          } else if (pRand < 0.96) {
            pType = 'time_warp';
          } else {
            pType = 'wrench';
          }

          s.pickups.push({
            id: Date.now() + Math.random(),
            type: pType,
            x: laneCenterX + (Math.random() - 0.5) * 20,
            y: -40,
            width: 28,
            height: 28,
            angle: 0,
          });
        }

        // --- 5. UPDATE OBSTACLES & COLLISIONS ---
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];

          // Sports car lane change AI
          if (obs.type === 'sports' && obs.laneChangeTimer !== undefined) {
            obs.laneChangeTimer -= dt;
            if (obs.laneChangeTimer <= 0) {
              const currentLane = obs.lane;
              const possibleLanes = [];
              if (currentLane > 0) possibleLanes.push(currentLane - 1);
              if (currentLane < laneCount - 1) possibleLanes.push(currentLane + 1);
              if (possibleLanes.length > 0) {
                obs.targetLane = possibleLanes[Math.floor(Math.random() * possibleLanes.length)];
                obs.blinkerTimer = 1.2;
              }
              obs.laneChangeTimer = Math.random() * 4 + 3;
            }

            if (obs.targetLane !== undefined && obs.targetLane !== obs.lane) {
              const targetX = roadLeft + obs.targetLane * laneWidth + laneWidth / 2;
              obs.x += (targetX - obs.x) * 3.5 * dt;
              if (Math.abs(targetX - obs.x) < 4) {
                obs.lane = obs.targetLane;
              }
            }
          }

          // Move obstacle relative to player speed
          const relativeSpeed = (s.speed - obs.speed) * 3.6 * dt * trafficSpeedModifier;
          obs.y += relativeSpeed;

          // Near Miss Detection: Player safely overtakes vehicle closely at high speed
          if (!obs.passedPlayer && obs.y > s.carY - 10 && obs.speed > 0) {
            const dx = Math.abs(s.carX - obs.x);
            const closeThreshold = (s.carWidth + obs.width) / 2 + 18;
            const collisionThreshold = (s.carWidth + obs.width) / 2 - 4;

            if (dx > collisionThreshold && dx < closeThreshold && s.speed > 100) {
              obs.passedPlayer = true;
              s.nearMissCount += 1;
              s.comboMultiplier = Math.min(5, s.comboMultiplier + 1);
              s.comboResetTimer = 3.5;
              const bonusScore = 150 * s.comboMultiplier;
              s.score += bonusScore;
              sound.playNearMiss();
              haptics.light();

              s.floatingTexts.push({
                x: s.carX,
                y: s.carY - 30,
                text: `NEAR MISS! +${bonusScore} (${s.comboMultiplier}x)`,
                color: '#38bdf8',
                alpha: 1.0,
                scale: 1.2,
              });
            }
          }

          // Collision Check
          const playerLeft = s.carX - s.carWidth / 2 + 4;
          const playerRight = s.carX + s.carWidth / 2 - 4;
          const playerTop = s.carY - s.carHeight / 2 + 6;
          const playerBottom = s.carY + s.carHeight / 2 - 6;

          const obsLeft = obs.x - obs.width / 2;
          const obsRight = obs.x + obs.width / 2;
          const obsTop = obs.y - obs.height / 2;
          const obsBottom = obs.y + obs.height / 2;

          const isColliding =
            playerLeft < obsRight &&
            playerRight > obsLeft &&
            playerTop < obsBottom &&
            playerBottom > obsTop;

          if (isColliding) {
            if (obs.type === 'oil_slick') {
              s.oilSpinTimer = 1.2;
              sound.playDrift();
              haptics.medium();
              s.floatingTexts.push({
                x: s.carX,
                y: s.carY - 20,
                text: 'OIL SLICK!',
                color: '#f59e0b',
                alpha: 1.0,
                scale: 1.0,
              });
              s.obstacles.splice(i, 1);
              continue;
            }

            // Nitro Ram / Energy Shield protection
            if (s.isNitroActive) {
              // Destroy obstacle while blasting forward
              sound.playCrash();
              haptics.heavy();
              s.cameraShake = 5;
              s.score += 250;

              // Spark burst
              for (let p = 0; p < 18; p++) {
                s.particles.push({
                  x: obs.x,
                  y: obs.y,
                  vx: (Math.random() - 0.5) * 200,
                  vy: (Math.random() - 0.5) * 200,
                  size: Math.random() * 5 + 3,
                  color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
                  alpha: 1,
                  life: 0.35,
                  maxLife: 0.35,
                });
              }

              s.floatingTexts.push({
                x: obs.x,
                y: obs.y,
                text: 'RAMMED! +250',
                color: '#f97316',
                alpha: 1.0,
                scale: 1.3,
              });

              s.obstacles.splice(i, 1);
              continue;
            }

            if (s.shieldHits > 0) {
              // Shield absorbs the collision
              s.shieldHits -= 1;
              sound.playShieldHit();
              haptics.heavy();
              s.cameraShake = 4;
              s.speed = Math.max(50, s.speed * 0.7);

              // Shield ripple particles
              for (let p = 0; p < 14; p++) {
                s.particles.push({
                  x: s.carX,
                  y: s.carY,
                  vx: (Math.random() - 0.5) * 150,
                  vy: (Math.random() - 0.5) * 150,
                  size: Math.random() * 4 + 2,
                  color: '#38bdf8',
                  alpha: 1,
                  life: 0.3,
                  maxLife: 0.3,
                });
              }

              s.floatingTexts.push({
                x: s.carX,
                y: s.carY - 24,
                text: 'SHIELD ABSORBED!',
                color: '#38bdf8',
                alpha: 1.0,
                scale: 1.1,
              });

              s.obstacles.splice(i, 1);
              continue;
            }

            // Normal Hit: Damage car and reduce speed
            const damage = obs.type === 'semi' ? 50 : obs.type === 'road_barrier' ? 35 : 30;
            s.health = Math.max(0, s.health - damage);
            s.speed = Math.max(30, s.speed * 0.35);
            s.cameraShake = 8;
            s.comboMultiplier = 1;
            sound.playCrash();
            haptics.heavy();

            // Debris explosion particles
            for (let p = 0; p < 24; p++) {
              s.particles.push({
                x: s.carX,
                y: s.carY,
                vx: (Math.random() - 0.5) * 220,
                vy: (Math.random() - 0.5) * 220,
                size: Math.random() * 6 + 3,
                color: Math.random() > 0.4 ? '#ef4444' : '#e2e8f0',
                alpha: 1,
                life: 0.45,
                maxLife: 0.45,
              });
            }

            s.floatingTexts.push({
              x: s.carX,
              y: s.carY - 24,
              text: `CRUNCH! -${damage}%`,
              color: '#ef4444',
              alpha: 1.0,
              scale: 1.2,
            });

            s.obstacles.splice(i, 1);

            if (s.health <= 0) {
              s.isGameOver = true;
              sound.stopEngine();
              haptics.heavy();
              onGameOver({
                score: s.score,
                distance: Math.floor(s.distance),
                speed: Math.round(s.speed),
                maxSpeedReached: s.maxSpeedReached,
                coinsCollected: s.coins,
                nearMissCount: s.nearMissCount,
                comboMultiplier: s.comboMultiplier,
                health: 0,
                maxHealth: s.maxHealth,
                shieldHits: s.shieldHits,
                maxShieldHits: s.maxShieldHits,
                nitroFuel: s.nitroFuel,
                isNitroActive: false,
                timeRemainingSlowMo: 0,
              });
              return;
            }
          }

          // Despawn off-screen obstacles
          if (obs.y > height + 100) {
            s.obstacles.splice(i, 1);
          }
        }

        // --- 6. UPDATE PICKUPS & MAGNET PHYSICS ---
        const magnetActive = s.magnetTimer > 0;
        const magnetRadius = 180;

        for (let i = s.pickups.length - 1; i >= 0; i--) {
          const p = s.pickups[i];
          p.y += relativeWorldSpeed;
          p.angle += dt * 4;

          // Magnet suction logic
          if (magnetActive && (p.type === 'coin' || p.type === 'gem')) {
            const dx = s.carX - p.x;
            const dy = s.carY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < magnetRadius) {
              p.x += (dx / dist) * 350 * dt;
              p.y += (dy / dist) * 350 * dt;
            }
          }

          // Collection Check
          const distToPlayer = Math.hypot(p.x - s.carX, p.y - s.carY);
          if (distToPlayer < 36) {
            if (p.type === 'coin') {
              s.coins += 1;
              s.score += 50 * s.comboMultiplier;
              sound.playCoin();
              haptics.coin();
              s.floatingTexts.push({
                x: p.x,
                y: p.y,
                text: `+1 COIN`,
                color: '#fbbf24',
                alpha: 1,
                scale: 1,
              });
            } else if (p.type === 'gem') {
              s.coins += 5;
              s.score += 250 * s.comboMultiplier;
              sound.playCoin();
              haptics.powerup();
              s.floatingTexts.push({
                x: p.x,
                y: p.y,
                text: `+5 GEMS!`,
                color: '#38bdf8',
                alpha: 1,
                scale: 1.2,
              });
            } else if (p.type === 'nitro') {
              s.nitroFuel = 100;
              sound.playPowerup();
              haptics.powerup();
              s.floatingTexts.push({
                x: p.x,
                y: p.y,
                text: `NITRO TANK FULL!`,
                color: '#06b6d4',
                alpha: 1,
                scale: 1.2,
              });
            } else if (p.type === 'shield') {
              s.shieldHits = Math.min(s.maxShieldHits + 1, 5);
              sound.playPowerup();
              haptics.powerup();
              s.floatingTexts.push({
                x: p.x,
                y: p.y,
                text: `SHIELD READY!`,
                color: '#60a5fa',
                alpha: 1,
                scale: 1.2,
              });
            } else if (p.type === 'magnet') {
              s.magnetTimer = 8.0;
              sound.playPowerup();
              haptics.powerup();
              s.floatingTexts.push({
                x: p.x,
                y: p.y,
                text: `MAGNET ACTIVE!`,
                color: '#f43f5e',
                alpha: 1,
                scale: 1.2,
              });
            } else if (p.type === 'time_warp') {
              s.slowMoTimer = 6.0;
              sound.playPowerup();
              haptics.powerup();
              s.floatingTexts.push({
                x: p.x,
                y: p.y,
                text: `CHRONO SLOW-MO!`,
                color: '#10b981',
                alpha: 1,
                scale: 1.2,
              });
            } else if (p.type === 'wrench') {
              s.health = Math.min(s.maxHealth, s.health + 40);
              sound.playPowerup();
              haptics.powerup();
              s.floatingTexts.push({
                x: p.x,
                y: p.y,
                text: `HULL REPAIRED +40%`,
                color: '#22c55e',
                alpha: 1,
                scale: 1.1,
              });
            }

            s.pickups.splice(i, 1);
            continue;
          }

          if (p.y > height + 80) {
            s.pickups.splice(i, 1);
          }
        }

        // --- 7. PARTICLES & SKID MARKS ---
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const pt = s.particles[i];
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.life -= dt;
          pt.alpha = Math.max(0, pt.life / pt.maxLife);
          if (pt.life <= 0) {
            s.particles.splice(i, 1);
          }
        }

        for (let i = s.skidMarks.length - 1; i >= 0; i--) {
          const sm = s.skidMarks[i];
          sm.y1 += relativeWorldSpeed;
          sm.y2 += relativeWorldSpeed;
          sm.alpha -= dt * 0.15;
          if (sm.y1 > height + 20 || sm.alpha <= 0) {
            s.skidMarks.splice(i, 1);
          }
        }

        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y -= 45 * dt;
          ft.alpha -= dt * 0.9;
          if (ft.alpha <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // Sync Stats with HUD
        onStatsUpdate({
          score: s.score,
          distance: Math.floor(s.distance),
          speed: Math.round(s.speed),
          maxSpeedReached: s.maxSpeedReached,
          coinsCollected: s.coins,
          nearMissCount: s.nearMissCount,
          comboMultiplier: s.comboMultiplier,
          health: s.health,
          maxHealth: s.maxHealth,
          shieldHits: s.shieldHits,
          maxShieldHits: s.maxShieldHits,
          nitroFuel: s.nitroFuel,
          isNitroActive: s.isNitroActive,
          timeRemainingSlowMo: s.slowMoTimer,
        });
      }

      // =========================================================
      // --- RENDERING ---
      // =========================================================
      ctx.save();

      // Camera Shake
      if (s.cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.cameraShake * 4;
        const shakeY = (Math.random() - 0.5) * s.cameraShake * 4;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Background / Road Shoulders
      if (track === 'NEON_CITY') {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);

        // Neon city skyline grids and lighting
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, roadLeft, height);
        ctx.fillRect(roadRight, 0, width - roadRight, height);

        // Building blocks passing by
        ctx.fillStyle = '#1e293b';
        const buildingStep = 180;
        for (let y = -buildingStep + (s.roadOffset * 2) % buildingStep; y < height; y += buildingStep) {
          ctx.fillRect(15, y, Math.max(10, roadLeft - 30), 120);
          ctx.fillRect(roadRight + 15, y, Math.max(10, width - roadRight - 30), 120);

          // Neon windows
          ctx.fillStyle = Math.sin(y) > 0 ? '#38bdf8' : '#ec4899';
          ctx.fillRect(25, y + 20, 8, 12);
          ctx.fillRect(25, y + 45, 8, 12);
          ctx.fillRect(roadRight + 25, y + 20, 8, 12);
          ctx.fillRect(roadRight + 25, y + 45, 8, 12);
          ctx.fillStyle = '#1e293b';
        }
      } else if (track === 'DESERT_HIGHWAY') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 0, width, height);

        // Sandy shoulder
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 0, roadLeft, height);
        ctx.fillRect(roadRight, 0, width - roadRight, height);

        // Cacti & boulders
        ctx.fillStyle = '#92400e';
        const boulderStep = 220;
        for (let y = -boulderStep + (s.roadOffset * 2) % boulderStep; y < height; y += boulderStep) {
          ctx.beginPath();
          ctx.arc(roadLeft - 25, y, 16, 0, Math.PI * 2);
          ctx.arc(roadRight + 25, y + 80, 18, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // RAINY_MIDNIGHT
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, roadLeft, height);
        ctx.fillRect(roadRight, 0, width - roadRight, height);
      }

      // 2. Asphalt Road
      ctx.fillStyle = track === 'RAINY_MIDNIGHT' ? '#111827' : '#1e2430';
      ctx.fillRect(roadLeft, 0, roadWidth, height);

      // Kerb Edges (Red/White or Neon Cyan/Magenta)
      const kerbWidth = 8;
      const kerbStep = 40;
      for (let y = -kerbStep + (s.roadOffset * 2) % kerbStep; y < height; y += kerbStep) {
        const isWhite = Math.floor(y / kerbStep) % 2 === 0;
        ctx.fillStyle = track === 'NEON_CITY'
          ? (isWhite ? '#06b6d4' : '#ec4899')
          : (isWhite ? '#ffffff' : '#ef4444');

        ctx.fillRect(roadLeft - kerbWidth, y, kerbWidth, kerbStep);
        ctx.fillRect(roadRight, y, kerbWidth, kerbStep);
      }

      // Lane Markings (Dashed white lines)
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.7;
      for (let l = 1; l < laneCount; l++) {
        const lx = roadLeft + l * laneWidth;
        const dashLen = 30;
        const dashGap = 35;
        const totalPattern = dashLen + dashGap;
        for (let y = -totalPattern + (s.roadOffset * 2.2) % totalPattern; y < height; y += totalPattern) {
          ctx.fillRect(lx - 2, y, 4, dashLen);
        }
      }
      ctx.globalAlpha = 1.0;

      // Skid marks
      for (const sm of s.skidMarks) {
        ctx.strokeStyle = `rgba(10, 10, 12, ${sm.alpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sm.x1, sm.y1);
        ctx.lineTo(sm.x2, sm.y2);
        ctx.stroke();
      }

      // 3. Render Pickups
      for (const p of s.pickups) {
        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.type === 'coin') {
          // Spinning gold coin
          ctx.rotate(p.angle * 0.2);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#b45309';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 1);
        } else if (p.type === 'gem') {
          // Blue diamond gem
          ctx.rotate(p.angle);
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(12, 0);
          ctx.lineTo(0, 14);
          ctx.lineTo(-12, 0);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#a5f3fc';
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(7, 0);
          ctx.lineTo(0, 8);
          ctx.lineTo(-7, 0);
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'nitro') {
          // Nitro tank
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-8, -12, 16, 24);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-6, -10, 12, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('N₂O', 0, 3);
        } else if (p.type === 'shield') {
          // Shield orb
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 13, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🛡️', 0, 4);
        } else if (p.type === 'magnet') {
          ctx.fillStyle = '#ef4444';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🧲', 0, 6);
        } else if (p.type === 'time_warp') {
          ctx.fillStyle = '#10b981';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⏱️', 0, 6);
        } else if (p.type === 'wrench') {
          ctx.fillStyle = '#22c55e';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔧', 0, 6);
        }

        ctx.restore();
      }

      // 4. Render Obstacles
      for (const obs of s.obstacles) {
        ctx.save();
        ctx.translate(obs.x, obs.y);

        if (obs.type === 'oil_slick') {
          // Iridescent dark oil slick on ground
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(0, 0, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (obs.type === 'road_barrier') {
          // Construction barrier
          ctx.fillStyle = '#f97316';
          ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
          ctx.fillStyle = '#ffffff';
          // Chevron stripes
          for (let sx = -obs.width / 2; sx < obs.width / 2; sx += 12) {
            ctx.beginPath();
            ctx.moveTo(sx, -obs.height / 2);
            ctx.lineTo(sx + 6, -obs.height / 2);
            ctx.lineTo(sx + 12, obs.height / 2);
            ctx.lineTo(sx + 6, obs.height / 2);
            ctx.closePath();
            ctx.fill();
          }
          // Flashing top hazard lights
          const flash = Math.floor(currentTime * 0.008) % 2 === 0;
          ctx.fillStyle = flash ? '#facc15' : '#713f12';
          ctx.beginPath();
          ctx.arc(-obs.width / 2 + 6, -obs.height / 2 - 3, 3, 0, Math.PI * 2);
          ctx.arc(obs.width / 2 - 6, -obs.height / 2 - 3, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'semi') {
          // Semi Truck (Cab + long trailer)
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-obs.width / 2 - 2, -obs.height / 2 - 2, obs.width + 4, obs.height + 4); // shadow

          // Trailer
          ctx.fillStyle = obs.color;
          ctx.fillRect(-obs.width / 2, -obs.height / 2 + 25, obs.width, obs.height - 30);
          // Trailer roof corrugation lines
          ctx.fillStyle = '#94a3b8';
          for (let ry = -obs.height / 2 + 35; ry < obs.height / 2 - 10; ry += 12) {
            ctx.fillRect(-obs.width / 2 + 4, ry, obs.width - 8, 2);
          }
          // Cab
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-obs.width / 2 + 2, -obs.height / 2, obs.width - 4, 25);
          // Windshield
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-obs.width / 2 + 6, -obs.height / 2 + 4, obs.width - 12, 8);
          // Taillights
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-obs.width / 2 + 4, obs.height / 2 - 4, 8, 3);
          ctx.fillRect(obs.width / 2 - 12, obs.height / 2 - 4, 8, 3);
        } else {
          // Sedans, Sports Cars, Police Interceptor
          // Car Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.roundRect(-obs.width / 2 - 2, -obs.height / 2 - 2, obs.width + 4, obs.height + 4, 6);
          ctx.fill();

          // Body
          ctx.fillStyle = obs.color;
          ctx.beginPath();
          ctx.roundRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height, 6);
          ctx.fill();

          // Roof / Cabin
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(-obs.width / 2 + 4, -obs.height / 2 + 16, obs.width - 8, obs.height - 32, 4);
          ctx.fill();

          // Front windshield
          ctx.fillStyle = '#67e8f9';
          ctx.fillRect(-obs.width / 2 + 5, -obs.height / 2 + 18, obs.width - 10, 7);

          // Rear window
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-obs.width / 2 + 5, obs.height / 2 - 24, obs.width - 10, 5);

          // Headlights
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-obs.width / 2 + 2, -obs.height / 2, 6, 3);
          ctx.fillRect(obs.width / 2 - 8, -obs.height / 2, 6, 3);

          // Taillights
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-obs.width / 2 + 2, obs.height / 2 - 3, 6, 3);
          ctx.fillRect(obs.width / 2 - 8, obs.height / 2 - 3, 6, 3);

          // Police strobe lights
          if (obs.type === 'police') {
            const strobe = Math.floor(currentTime * 0.015) % 2 === 0;
            ctx.fillStyle = strobe ? '#ef4444' : '#3b82f6';
            ctx.fillRect(-6, -obs.height / 2 + 24, 6, 4);
            ctx.fillStyle = strobe ? '#3b82f6' : '#ef4444';
            ctx.fillRect(0, -obs.height / 2 + 24, 6, 4);
          }

          // Sports car blinker
          if (obs.type === 'sports' && obs.blinkerTimer && obs.blinkerTimer > 0) {
            const blink = Math.floor(currentTime * 0.01) % 2 === 0;
            if (blink) {
              ctx.fillStyle = '#f59e0b';
              const blinkerX = obs.targetLane! > obs.lane ? obs.width / 2 - 4 : -obs.width / 2;
              ctx.fillRect(blinkerX, -obs.height / 2 + 4, 4, 4);
              ctx.fillRect(blinkerX, obs.height / 2 - 8, 4, 4);
            }
          }
        }

        ctx.restore();
      }

      // 5. Render Player Car
      ctx.save();
      ctx.translate(s.carX, s.carY);
      ctx.rotate(s.carAngle);

      // Headlight Beams illuminating the road ahead
      const beamGrad = ctx.createLinearGradient(0, 0, 0, -220);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-14, -s.carHeight / 2);
      ctx.lineTo(-45, -220);
      ctx.lineTo(45, -220);
      ctx.lineTo(14, -s.carHeight / 2);
      ctx.closePath();
      ctx.fill();

      // Car Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.roundRect(-s.carWidth / 2 - 4, -s.carHeight / 2 - 2, s.carWidth + 8, s.carHeight + 6, 8);
      ctx.fill();

      // Wheels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-s.carWidth / 2 - 3, -s.carHeight / 2 + 10, 4, 14); // Front-Left
      ctx.fillRect(s.carWidth / 2 - 1, -s.carHeight / 2 + 10, 4, 14);  // Front-Right
      ctx.fillRect(-s.carWidth / 2 - 3, s.carHeight / 2 - 24, 4, 14);  // Rear-Left
      ctx.fillRect(s.carWidth / 2 - 1, s.carHeight / 2 - 24, 4, 14);   // Rear-Right

      // Car Main Body
      ctx.fillStyle = car.color;
      ctx.beginPath();
      ctx.roundRect(-s.carWidth / 2, -s.carHeight / 2, s.carWidth, s.carHeight, 8);
      ctx.fill();

      // Racing Stripes / Accents
      ctx.fillStyle = car.accentColor;
      ctx.fillRect(-4, -s.carHeight / 2, 8, s.carHeight);

      // Cabin / Roof
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(-s.carWidth / 2 + 4, -s.carHeight / 2 + 18, s.carWidth - 8, s.carHeight - 34, 5);
      ctx.fill();

      // Front Windshield
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-s.carWidth / 2 + 6, -s.carHeight / 2 + 20, s.carWidth - 12, 9);

      // Rear Window
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-s.carWidth / 2 + 6, s.carHeight / 2 - 24, s.carWidth - 12, 6);

      // Aerodynamic Rear Wing / Spoiler
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-s.carWidth / 2 - 2, s.carHeight / 2 - 6, s.carWidth + 4, 4);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-s.carWidth / 2 + 3, -s.carHeight / 2, 7, 3);
      ctx.fillRect(s.carWidth / 2 - 10, -s.carHeight / 2, 7, 3);

      // Taillights with red glow
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.fillRect(-s.carWidth / 2 + 3, s.carHeight / 2 - 3, 7, 3);
      ctx.fillRect(s.carWidth / 2 - 10, s.carHeight / 2 - 3, 7, 3);
      ctx.shadowBlur = 0;

      // Shield Bubble
      if (s.shieldHits > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, s.carHeight / 2 + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Magnet Halo
      if (s.magnetTimer > 0) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, s.carHeight / 2 + 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();

      // 6. Particles (smoke, nitro fire, sparks)
      for (const pt of s.particles) {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Floating Combat / Combo Texts
      for (const ft of s.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = `bold ${Math.round(15 * ft.scale)}px Outfit, sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 8. Rain effect for Rainy track
      if (track === 'RAINY_MIDNIGHT') {
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 40; i++) {
          const rx = (i * 29 + s.distance * 2) % width;
          const ry = (i * 47 + currentTime * 0.9) % height;
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 20);
        }
        ctx.stroke();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      sound.stopEngine();
    };
  }, [car, track, controlMode, tiltX, isSteeringLeft, isSteeringRight, isAccelerating, isBraking, isNitroPressed, isPaused, onGameOver, onStatsUpdate]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-xl mx-auto block touch-none"
        style={{ display: 'block' }}
      />
    </div>
  );
};
