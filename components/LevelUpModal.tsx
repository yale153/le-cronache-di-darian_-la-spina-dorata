
import React, { useState } from 'react';
import { Character, Spell, SpellDefinition } from '../types';
import { BARD_SPELL_LIBRARY, BARD_SLOTS_TABLE } from '../constants';

interface LevelUpModalProps {
  newLevel: number;
  oldCharacter: Character;
  onConfirm: (newChar: Character) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, oldCharacter, onConfirm }) => {
  const hpIncrease = 5 + Math.floor((oldCharacter.stats.con - 10) / 2); // Average d8 (5) + CON
  
  // Create a copy of spells to manipulate
  const [currentSpells, setCurrentSpells] = useState<Spell[]>(oldCharacter.spells);
  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState(1);
  const [newSpellDesc, setNewSpellDesc] = useState('');

  // Determine slot updates
  const newSlots = BARD_SLOTS_TABLE[newLevel] || oldCharacter.maxSpellSlots;

  const handleAddSpellFromLib = (spellDef: SpellDefinition) => {
      const newSpell: Spell = {
          name: spellDef.name,
          level: spellDef.level,
          description: spellDef.description,
          school: spellDef.school,
          castingTime: spellDef.castingTime,
          range: spellDef.range,
          components: spellDef.components,
          duration: spellDef.duration
      };
      setCurrentSpells([...currentSpells, newSpell]);
  };

  const handleAddCustomSpell = () => {
      if(!newSpellName) return;
      const newSpell: Spell = {
          name: newSpellName,
          level: newSpellLevel,
          description: newSpellDesc || "Magia personalizzata",
          school: "Universale"
      };
      setCurrentSpells([...currentSpells, newSpell]);
      setNewSpellName('');
      setNewSpellDesc('');
  };

  const handleRemoveSpell = (index: number) => {
      setCurrentSpells(currentSpells.filter((_, i) => i !== index));
  };

  const finishLevelUp = () => {
      // Sort Spells: First by level, then by name
      const sortedSpells = [...currentSpells].sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          return a.name.localeCompare(b.name);
      });

      const updatedChar: Character = {
          ...oldCharacter,
          level: newLevel,
          maxHp: oldCharacter.maxHp + hpIncrease,
          hp: oldCharacter.hp + hpIncrease, // Heal the gained amount
          spellSlots: newSlots, // Refresh slots on level up? Or just update max? Let's update max.
          maxSpellSlots: newSlots,
          spells: sortedSpells
      };
      onConfirm(updatedChar);
  };

  return (
    <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(245,158,11,0.3)]">
        
        <div className="p-6 bg-amber-900/20 border-b border-amber-900/50 text-center">
            <h2 className="text-3xl font-serif text-amber-500 mb-2">LIVELLO {newLevel} RAGGIUNTO!</h2>
            <p className="text-slate-300">Il tuo potere arcano cresce.</p>
        </div>

        <div className="p-6 space-y-6">
            {/* HP Growth */}
            <div className="bg-slate-950 p-4 rounded border border-slate-700 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-red-400">Salute Aumentata</h3>
                    <p className="text-sm text-slate-500">Dado Vita (Media) + Costituzione</p>
                </div>
                <div className="text-2xl font-bold text-white">+{hpIncrease} PV</div>
            </div>

            {/* Spell Slots */}
            <div className="bg-slate-950 p-4 rounded border border-slate-700">
                <h3 className="text-lg font-bold text-purple-400 mb-2">Nuovi Slot Incantesimo</h3>
                <div className="flex gap-4">
                    {Object.entries(newSlots).map(([lvl, val]) => {
                        const amount = val as number;
                        return (
                        <div key={lvl} className="text-center">
                            <div className="text-xs text-slate-500 uppercase">Liv {lvl}</div>
                            <div className="font-bold text-white text-xl">{amount}</div>
                             {amount > (oldCharacter.maxSpellSlots[parseInt(lvl)] || 0) && (
                                 <span className="text-xs text-green-500">(+{amount - (oldCharacter.maxSpellSlots[parseInt(lvl)] || 0)})</span>
                             )}
                        </div>
                    )})}
                </div>
            </div>

            {/* Spell Management */}
            <div className="bg-slate-950 p-4 rounded border border-slate-700">
                <h3 className="text-lg font-bold text-blue-400 mb-4">Grimorio Arcano</h3>
                <p className="text-sm text-slate-400 mb-4">Gestisci le tue magie conosciute. Puoi impararne di nuove o sostituirne di vecchie.</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Current Spells */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Magie Attuali ({currentSpells.length})</h4>
                        <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {currentSpells.map((s, i) => (
                                <li key={i} className="flex justify-between items-center bg-slate-800 p-2 rounded text-sm">
                                    <span className="text-purple-300 truncate">{s.name} <span className="text-slate-500 text-xs">({s.level})</span></span>
                                    <button onClick={() => handleRemoveSpell(i)} className="text-red-500 hover:text-red-300 text-xs uppercase font-bold">X</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Learn New */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Impara Nuova</h4>
                        <div className="space-y-4">
                            {/* Library */}
                            <div>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300"
                                    onChange={(e) => {
                                        const spell = BARD_SPELL_LIBRARY.find(s => s.name === e.target.value);
                                        if (spell) handleAddSpellFromLib(spell);
                                        e.target.value = "";
                                    }}
                                >
                                    <option value="">-- Scegli dalla Lista --</option>
                                    {BARD_SPELL_LIBRARY.filter(s => !currentSpells.find(cs => cs.name === s.name)).map(s => (
                                        <option key={s.name} value={s.name}>{s.name} (Lv {s.level})</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Custom */}
                            <div className="border-t border-slate-800 pt-2">
                                <div className="text-xs text-slate-500 mb-2">O aggiungi personalizzata:</div>
                                <input 
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white mb-2" 
                                    placeholder="Nome Magia"
                                    value={newSpellName}
                                    onChange={e => setNewSpellName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <select 
                                        className="bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                                        value={newSpellLevel}
                                        onChange={e => setNewSpellLevel(parseInt(e.target.value))}
                                    >
                                        {[0,1,2,3,4,5].map(n => <option key={n} value={n}>Lv {n}</option>)}
                                    </select>
                                    <button 
                                        onClick={handleAddCustomSpell}
                                        disabled={!newSpellName}
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold disabled:opacity-50"
                                    >
                                        AGGIUNGI
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={finishLevelUp}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded font-serif font-bold text-xl shadow-lg border border-amber-400"
            >
                COMPLETA LIVELLAMENTO
            </button>
        </div>
      </div>
    </div>
  );
};
