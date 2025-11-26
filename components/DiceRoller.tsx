import React, { useState } from 'react';

interface DiceRollerProps {
  onRoll: (result: string) => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll }) => {
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastDie, setLastDie] = useState<string>("");

  const roll = (sides: number) => {
    const result = Math.floor(Math.random() * sides) + 1;
    setLastRoll(result);
    setLastDie(`d${sides}`);
    
    // Check for crits on d20
    let text = `Tirato d${sides}: ${result}`;
    if (sides === 20 && result === 20) text += " (CRITICO!)";
    if (sides === 20 && result === 1) text += " (FALLIMENTO CRITICO!)";
    
    onRoll(text);
  };

  const dice = [4, 6, 8, 10, 12, 20];

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <h3 className="text-amber-400 font-bold mb-3 uppercase text-sm tracking-wider">Tira Dadi</h3>
      <div className="grid grid-cols-3 gap-2">
        {dice.map((d) => (
          <button
            key={d}
            onClick={() => roll(d)}
            className="bg-slate-700 hover:bg-amber-600 hover:text-white text-amber-500 font-bold py-2 rounded transition-colors flex flex-col items-center justify-center border border-slate-600"
          >
            <span>d{d}</span>
          </button>
        ))}
      </div>
      {lastRoll !== null && (
        <div className="mt-4 text-center animate-pulse">
            <span className="text-slate-400 text-xs">Risultato {lastDie}</span>
            <div className={`text-3xl font-bold ${lastRoll === 20 && lastDie === 'd20' ? 'text-green-400' : lastRoll === 1 && lastDie === 'd20' ? 'text-red-500' : 'text-white'}`}>
                {lastRoll}
            </div>
        </div>
      )}
    </div>
  );
};