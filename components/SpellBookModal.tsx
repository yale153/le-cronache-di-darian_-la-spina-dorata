
import React, { useState } from 'react';
import { SpellDefinition, Spell, Character } from '../types';
import { BARD_SPELL_LIBRARY, BARD_LEVEL_PROGRESSION } from '../constants';

interface SpellBookModalProps {
  character: Character;
  onLearnSpell: (newChar: Character) => void;
  onClose: () => void;
}

export const SpellBookModal: React.FC<SpellBookModalProps> = ({ character, onLearnSpell, onClose }) => {
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  // Get Progression Limits based on current level
  const limits = BARD_LEVEL_PROGRESSION[character.level] || { cantrips: 3, spellsKnown: 8 };
  
  // Calculate current counts
  const currentCantrips = character.spells.filter(s => s.level === 0).length;
  const currentSpells = character.spells.filter(s => s.level > 0).length;

  // Filter spells that the character doesn't know yet
  const unknownSpells = BARD_SPELL_LIBRARY.filter(
    s => !character.spells.some(cs => cs.name === s.name)
  );

  const filteredSpells = selectedLevel === 'all' 
    ? unknownSpells 
    : unknownSpells.filter(s => s.level === selectedLevel);

  const handleLearn = (spellDef: SpellDefinition) => {
      const isCantrip = spellDef.level === 0;
      
      // Validation
      if (isCantrip && currentCantrips >= limits.cantrips) {
          return; // Should be handled by button disable, but double check
      }
      if (!isCantrip && currentSpells >= limits.spellsKnown) {
          return; // Should be handled by button disable, but double check
      }

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

      // Add and Sort Spells: First by level, then by name
      const updatedSpells = [...character.spells, newSpell].sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          return a.name.localeCompare(b.name);
      });

      const updatedChar = {
          ...character,
          spells: updatedSpells
      };
      
      onLearnSpell(updatedChar);
  };

  return (
    <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl">
        
        <div className="p-4 bg-purple-900/30 border-b border-purple-900 flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-xl font-serif text-purple-300">Grimorio Arcano</h2>
                <div className="flex gap-4 text-xs text-slate-400 mt-1">
                    <span className={currentCantrips >= limits.cantrips ? 'text-red-400 font-bold' : 'text-green-400'}>
                        Trucchetti: {currentCantrips}/{limits.cantrips}
                    </span>
                    <span className={currentSpells >= limits.spellsKnown ? 'text-red-400 font-bold' : 'text-green-400'}>
                        Magie Conosciute: {currentSpells}/{limits.spellsKnown}
                    </span>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white font-bold px-2 py-1">✕</button>
        </div>

        <div className="p-4 bg-slate-950 border-b border-slate-800 shrink-0">
             <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <button 
                    onClick={() => setSelectedLevel('all')}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase shrink-0 ${selectedLevel === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                    Tutti
                </button>
                {[0,1,2,3,4,5].map(lvl => (
                    <button 
                        key={lvl}
                        onClick={() => setSelectedLevel(lvl)}
                        className={`px-3 py-1 rounded text-xs font-bold uppercase shrink-0 ${selectedLevel === lvl ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                        Liv {lvl}
                    </button>
                ))}
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredSpells.length === 0 && (
                <div className="text-center text-slate-500 py-10">Nessun incantesimo trovato per questo livello o li conosci già tutti.</div>
            )}

            {filteredSpells.map(spell => {
                const isExpanded = expandedSpell === spell.name;
                const isCantrip = spell.level === 0;
                const isFull = isCantrip 
                    ? currentCantrips >= limits.cantrips 
                    : currentSpells >= limits.spellsKnown;

                return (
                    <div key={spell.name} className={`bg-slate-800 rounded border transition ${isFull ? 'border-slate-700 opacity-75' : 'border-slate-600 hover:border-purple-500/50'}`}>
                         <div 
                            className="p-3 cursor-pointer flex justify-between items-center"
                            onClick={() => setExpandedSpell(isExpanded ? null : spell.name)}
                         >
                             <div>
                                <div className="font-bold text-white">{spell.name}</div>
                                <div className="text-xs text-purple-400">Livello {spell.level} • {spell.school}</div>
                             </div>
                             <div className="flex items-center gap-3">
                                {isFull ? (
                                    <span className="text-[10px] text-red-500 font-bold uppercase border border-red-900/50 px-2 py-1 rounded bg-red-900/10">
                                        Limite Raggiunto
                                    </span>
                                ) : (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLearn(spell);
                                        }}
                                        className="bg-green-700 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded uppercase"
                                    >
                                        Impara
                                    </button>
                                )}
                             </div>
                         </div>
                         
                         {isExpanded && (
                             <div className="px-3 pb-3 border-t border-slate-700 pt-3 bg-slate-900/50 text-sm">
                                 {isFull && (
                                     <div className="mb-3 text-xs text-red-400 italic">
                                         Nota: Non puoi imparare altri {isCantrip ? 'trucchetti' : 'incantesimi'} al momento. Devi dimenticarne uno esistente ("Gestione Magie" sulla scheda) o salire di livello.
                                     </div>
                                 )}
                                 <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-slate-400">
                                     <div><span className="font-bold text-slate-300">Tempo:</span> {spell.castingTime}</div>
                                     <div><span className="font-bold text-slate-300">Gittata:</span> {spell.range}</div>
                                     <div><span className="font-bold text-slate-300">Comp:</span> {spell.components}</div>
                                     <div><span className="font-bold text-slate-300">Durata:</span> {spell.duration}</div>
                                 </div>
                                 <p className="text-slate-300 leading-relaxed whitespace-pre-line">{spell.description}</p>
                             </div>
                         )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
