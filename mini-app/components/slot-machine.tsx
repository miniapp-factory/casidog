'use client';

import { useState, useEffect, useRef } from "react";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const fruits = ["apple", "banana", "cherry", "lemon"] as const;
type Fruit = typeof fruits[number];

const getRandomFruit = (): Fruit => fruits[Math.floor(Math.random() * fruits.length)];

export default function SlotMachine() {
  const [grid, setGrid] = useState<Fruit[][]>(Array.from({ length: 3 }, () => Array.from({ length: 3 }, getRandomFruit)));
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWin(false);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      setGrid(prev => {
        const newGrid = prev.map(row => [...row]);
        // shift each column down
        for (let col = 0; col < 3; col++) {
          const newFruit = getRandomFruit();
          newGrid[0][col] = newFruit;
          for (let row = 1; row < 3; row++) {
            newGrid[row][col] = prev[row - 1][col];
          }
        }
        return newGrid;
      });
      if (Date.now() - start >= 2000) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setSpinning(false);
        // check win condition
        const rows = grid;
        const cols = Array.from({ length: 3 }, (_, i) => [grid[0][i], grid[1][i], grid[2][i]]);
        const allLines = [...rows, ...cols];
        const hasWin = allLines.some(line => line.every(f => f === line[0]));
        setWin(hasWin);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2">
        {grid.flat().map((fruit, idx) => (
          <img
            key={idx}
            src={`/${fruit}.png`}
            alt={fruit}
            className="w-20 h-20 object-contain"
          />
        ))}
      </div>
      <button
        onClick={spin}
        disabled={spinning}
        className="px-4 py-2 bg-primary text-primary-foreground rounded"
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>
      {win && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-bold text-green-600">You Win!</span>
          <Share text={`I just won a fruit combo on the Fruit Slot Machine! ${url}`} />
        </div>
      )}
    </div>
  );
}
