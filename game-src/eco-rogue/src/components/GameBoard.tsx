import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TileData, HeroState, BiomeType, FloatingText, HeroClass } from '../types/game';
import { TileRenderer } from './TileRenderer';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface GameBoardProps {
  board: TileData[][];
  hero: HeroState;
  heroRow: number;
  heroCol: number;
  biome: BiomeType;
  floatingTexts: FloatingText[];
  isLockedRow?: number | null;
  onShiftRow: (rowIdx: number, direction: 'left' | 'right') => void;
  onShiftCol: (colIdx: number, direction: 'up' | 'down') => void;
  isProcessingTurn: boolean;
  screenShake: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  hero,
  heroRow,
  heroCol,
  biome,
  floatingTexts,
  isLockedRow,
  onShiftRow,
  onShiftCol,
  isProcessingTurn,
  screenShake,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag interaction state
  const [activeDrag, setActiveDrag] = useState<{
    type: 'row' | 'col';
    index: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Mouse / Touch handlers for dragging
  const handlePointerDown = (e: React.PointerEvent, r: number, c: number) => {
    if (isProcessingTurn) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setActiveDrag({
      type: 'row', // will determine on move
      index: r,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag || isProcessingTurn) return;

    const dx = e.clientX - activeDrag.startX;
    const dy = e.clientY - activeDrag.startY;

    // Lock direction after initial movement
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      if (Math.abs(dx) >= Math.abs(dy)) {
        setActiveDrag((prev) => (prev ? { ...prev, type: 'row', currentX: e.clientX, currentY: e.clientY } : null));
      } else {
        // Vertical shift: lock to the column of the initial touch
        const colIdx = Math.floor(
          ((activeDrag.startX - (containerRef.current?.getBoundingClientRect().left || 0)) /
            (containerRef.current?.getBoundingClientRect().width || 1)) *
            5
        );
        const clampedCol = Math.max(0, Math.min(4, colIdx));
        setActiveDrag((prev) => (prev ? { ...prev, type: 'col', index: clampedCol, currentX: e.clientX, currentY: e.clientY } : null));
      }
    } else {
      setActiveDrag((prev) => (prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!activeDrag || isProcessingTurn) {
      setActiveDrag(null);
      return;
    }

    const dx = e.clientX - activeDrag.startX;
    const dy = e.clientY - activeDrag.startY;
    const SWIPE_THRESHOLD = 32;

    if (activeDrag.type === 'row') {
      if (dx < -SWIPE_THRESHOLD) {
        onShiftRow(activeDrag.index, 'left');
      } else if (dx > SWIPE_THRESHOLD) {
        onShiftRow(activeDrag.index, 'right');
      }
    } else if (activeDrag.type === 'col') {
      if (dy < -SWIPE_THRESHOLD) {
        onShiftCol(activeDrag.index, 'up');
      } else if (dy > SWIPE_THRESHOLD) {
        onShiftCol(activeDrag.index, 'down');
      }
    }

    setActiveDrag(null);
  };

  // Keyboard navigation hotkeys (1-5 to select row, arrow keys to shift)
  const [selectedRow, setSelectedRow] = useState<number>(2);
  const [selectedCol, setSelectedCol] = useState<number>(2);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isProcessingTurn) return;

      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        setSelectedRow(idx);
        setSelectedCol(idx);
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onShiftRow(selectedRow, 'left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onShiftRow(selectedRow, 'right');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onShiftCol(selectedCol, 'up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onShiftCol(selectedCol, 'down');
      }
    },
    [isProcessingTurn, onShiftRow, onShiftCol, selectedRow, selectedCol]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Compute live visual drag offset for the active row or column
  const getDragTransform = (r: number, c: number) => {
    if (!activeDrag) return '';

    if (activeDrag.type === 'row' && activeDrag.index === r) {
      const dx = Math.max(-80, Math.min(80, activeDrag.currentX - activeDrag.startX));
      return `translateX(${dx}px)`;
    }

    if (activeDrag.type === 'col' && activeDrag.index === c) {
      const dy = Math.max(-80, Math.min(80, activeDrag.currentY - activeDrag.startY));
      return `translateY(${dy}px)`;
    }

    return '';
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none touch-none"
      style={{
        transform: screenShake > 0 ? `translate(${(Math.random() - 0.5) * screenShake * 6}px, ${(Math.random() - 0.5) * screenShake * 6}px)` : 'none',
        transition: 'transform 0.05s ease-out',
      }}
    >
      {/* Top Column Shift Buttons */}
      <div className="flex items-center justify-center gap-1.5 mb-1.5 w-full max-w-[390px] px-8">
        {[0, 1, 2, 3, 4].map((colIdx) => (
          <div key={`col-top-${colIdx}`} className="flex-1 flex justify-center">
            <button
              onClick={() => onShiftCol(colIdx, 'up')}
              disabled={isProcessingTurn}
              aria-label={`Shift column ${colIdx + 1} up`}
              className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 text-slate-300 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Middle row container: Left Shift Buttons + 5x5 Board + Right Shift Buttons */}
      <div className="flex items-center justify-center gap-1.5 w-full max-w-[430px]">
        {/* Left Row Shift Buttons */}
        <div className="flex flex-col gap-1.5 justify-between py-1">
          {[0, 1, 2, 3, 4].map((rowIdx) => (
            <button
              key={`row-left-${rowIdx}`}
              onClick={() => onShiftRow(rowIdx, 'left')}
              disabled={isProcessingTurn || isLockedRow === rowIdx}
              aria-label={`Shift row ${rowIdx + 1} left`}
              className={`p-1.5 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none ${
                isLockedRow === rowIdx
                  ? 'bg-red-950 text-red-400 border border-red-700/60'
                  : 'bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 text-slate-300 hover:text-white'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* 5x5 Central Battlefield Grid */}
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative grid grid-cols-5 gap-1.5 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md w-[340px] h-[340px] sm:w-[380px] sm:h-[380px]"
        >
          {board.map((row, r) =>
            row.map((tile, c) => {
              const isHero = r === heroRow && c === heroCol;
              const isAdjacent = Math.abs(r - heroRow) + Math.abs(c - heroCol) === 1;
              const isLocked = isLockedRow === r;

              return (
                <div
                  key={tile?.id || `tile-${r}-${c}`}
                  onPointerDown={(e) => handlePointerDown(e, r, c)}
                  style={{
                    transform: getDragTransform(r, c),
                    transition: activeDrag ? 'none' : 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className={`relative rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors duration-150 overflow-hidden ${
                    isHero
                      ? 'bg-emerald-950/70 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : isLocked
                      ? 'bg-red-950/50 border border-red-700/50'
                      : isAdjacent
                      ? 'bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-400/60'
                      : 'bg-slate-800/60 border border-slate-700/40 hover:bg-slate-800/80'
                  }`}
                >
                  {tile ? (
                    <TileRenderer
                      tile={tile}
                      isHeroAdjacent={isAdjacent}
                      heroClass={hero.classId}
                    />
                  ) : null}
                </div>
              );
            })
          )}

          {/* Floating Combat Text / FX Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
            {floatingTexts.map((f) => (
              <div
                key={f.id}
                className="absolute font-black tracking-tight drop-shadow-md animate-float"
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: f.color,
                  fontSize: f.scale ? `${f.scale * 15}px` : '15px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                }}
              >
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Row Shift Buttons */}
        <div className="flex flex-col gap-1.5 justify-between py-1">
          {[0, 1, 2, 3, 4].map((rowIdx) => (
            <button
              key={`row-right-${rowIdx}`}
              onClick={() => onShiftRow(rowIdx, 'right')}
              disabled={isProcessingTurn || isLockedRow === rowIdx}
              aria-label={`Shift row ${rowIdx + 1} right`}
              className={`p-1.5 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none ${
                isLockedRow === rowIdx
                  ? 'bg-red-950 text-red-400 border border-red-700/60'
                  : 'bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 text-slate-300 hover:text-white'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Column Shift Buttons */}
      <div className="flex items-center justify-center gap-1.5 mt-1.5 w-full max-w-[390px] px-8">
        {[0, 1, 2, 3, 4].map((colIdx) => (
          <div key={`col-bottom-${colIdx}`} className="flex-1 flex justify-center">
            <button
              onClick={() => onShiftCol(colIdx, 'down')}
              disabled={isProcessingTurn}
              aria-label={`Shift column ${colIdx + 1} down`}
              className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 text-slate-300 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Control Hint Line (Anti-slop compliant, clean typography) */}
      <div className="mt-2 text-[11px] text-slate-500 font-medium tracking-wide">
        Swipe any row or column · Arrows / 1–5 keys · Don’t move hero
      </div>
    </div>
  );
};
