
import React, { useState } from 'react';
import { Character, Spell, Item, Companion, AbilityScores } from '../types';
import { BARD_LEVEL_PROGRESSION, SKILLS_MAPPING } from '../constants';

interface CharacterSheetProps {
  character: Character;
  onCastSpell: (spell: Spell) => void;
  onRest: () => void;
  onRemoveSpell: (index: number) => void;
  onOpenSpellBook?: () => void;
  onSkillRoll?: (skillName: string, stat: keyof AbilityScores) => void;
  onStatRoll?: (stat: keyof AbilityScores) => void;
  isMobile?: boolean;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ 
    character, 
    onCastSpell, 
    onRest, 
    onRemoveSpell, 
    onOpenSpellBook,
    onSkillRoll,
    onStatRoll,
    isMobile = false 
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'spells' | 'inv' | 'pets'>('stats');
  const [selectedSpell, setSelectedSpell] = useState<number | null>(null);

  const proficiencyBonus = Math.ceil(1 + (character.level / 4));
  const chaMod = Math.floor((character.stats.cha - 10) / 2);
  const spellSaveDC = 8 + proficiencyBonus + chaMod;
  const spellAttackBonus = proficiencyBonus + chaMod;

  // Limits
  const limits = BARD_LEVEL_PROGRESSION[character.level] || { cantrips: 3, spellsKnown: 8 };
  const currentCantrips = character.spells.filter(s => s.level === 0).length;
  const currentSpells = character.spells.filter(s => s.level > 0).length;

  const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
        activeTab === id 
        ? 'bg-amber-500 text-slate-900' 
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`flex flex-col h-full bg-slate-900 ${isMobile ? 'w-full' : 'w-full'} border-l border-slate-700`}>
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 shrink-0">
        <h2 className="text-xl font-bold text-amber-400 font-serif">{character.name}</h2>
        <div className="text-slate-400 text-sm italic">{character.class}</div>
        <div className="flex justify-between mt-2 text-sm">
            <span className="text-white">Livello <span className="text-amber-400">{character.level}</span></span>
            <span className="text-slate-500">{character.xp} XP</span>
        </div>
        
        {/* Vitals */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-slate-900 p-2 rounded border border-slate-700">
                <div className="text-xs text-slate-500 uppercase">PV (HP)</div>
                <div className="font-bold text-red-400">{character.hp} / {character.maxHp}</div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700">
                <div className="text-xs text-slate-500 uppercase">CA (AC)</div>
                <div className="font-bold text-blue-400">{character.ac}</div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700">
                <div className="text-xs text-slate-500 uppercase">Oro</div>
                <div className="font-bold text-amber-400">{character.gold}</div>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-slate-800 shrink-0">
        <TabButton id="stats" label="Stat" />
        <TabButton id="spells" label="Magie" />
        <TabButton id="inv" label="Inv" />
        <TabButton id="pets" label="Alleati" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        
        {activeTab === 'stats' && (
            <div className="space-y-4">
                {/* Ability Scores */}
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(character.stats).map(([key, val]) => {
                        const score = val as number;
                        const mod = Math.floor((score - 10) / 2);
                        const k = key as keyof AbilityScores;
                        return (
                            <button 
                                key={key} 
                                onClick={() => onStatRoll && onStatRoll(k)}
                                className="flex justify-between items-center bg-slate-800 p-2 rounded px-3 hover:bg-slate-700 hover:border-amber-500 border border-transparent transition-all group"
                                title="Clicca per tirare su questa caratteristica"
                            >
                                <span className="uppercase text-slate-400 font-bold group-hover:text-amber-400">{key}</span>
                                <div className="text-right">
                                    <span className="text-white font-mono text-lg block leading-none">{score}</span>
                                    <span className="text-xs text-slate-500">{mod >= 0 ? '+' : ''}{mod}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
                
                {/* Stats Summary */}
                <div className="bg-slate-800 p-3 rounded border border-slate-700">
                     <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Bonus Competenza</span>
                        <span className="text-amber-500 font-bold">+{proficiencyBonus}</span>
                     </div>
                     <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">CD Salvezza Inc.</span>
                        <span className="text-amber-500 font-bold">{spellSaveDC}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Attacco Inc.</span>
                        <span className="text-amber-500 font-bold">+{spellAttackBonus}</span>
                     </div>
                </div>

                {/* Skills List */}
                <div>
                    <h3 className="text-amber-500 text-sm font-bold uppercase mb-2">Abilità</h3>
                    <div className="bg-slate-800 rounded border border-slate-700 p-2 space-y-1">
                        {SKILLS_MAPPING.map((skill) => {
                            const mod = Math.floor((character.stats[skill.stat] - 10) / 2);
                            // Simple logic: Add proficiency to all for now (Jack of All Trades + Proficiency mix approximation)
                            // Or better: Assume proficiency in core bard skills + Jack (half) in others.
                            // For simplicity in this UI, we just show the base calculation and let the App handler add proficiency.
                            return (
                                <button 
                                    key={skill.name}
                                    onClick={() => onSkillRoll && onSkillRoll(skill.name, skill.stat)}
                                    className="flex w-full justify-between items-center text-xs p-1 hover:bg-slate-700 rounded group"
                                >
                                    <span className="text-slate-300 group-hover:text-white">{skill.name} <span className="text-slate-600">({skill.stat})</span></span>
                                    <span className="text-slate-400 group-hover:text-amber-400">Tira 🎲</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-amber-500 text-sm font-bold uppercase mb-2">Tratti & Talenti</h3>
                    <ul className="text-sm text-slate-300 space-y-1 list-disc pl-4">
                        {character.features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
            </div>
        )}

        {activeTab === 'spells' && (
            <div className="space-y-4">
                 
                 {/* Spell Slots */}
                 <div className="bg-slate-800 p-3 rounded border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs text-slate-400 uppercase font-bold">Slot Incantesimo</h3>
                        <button onClick={onRest} className="text-xs bg-slate-700 hover:bg-green-600 text-white px-2 py-1 rounded transition">Riposo Lungo</button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {Object.entries(character.maxSpellSlots).map(([lvl, max]) => {
                            const current = character.spellSlots[parseInt(lvl)] || 0;
                            return (
                                <div key={lvl} className="bg-slate-950 p-2 rounded text-center min-w-[3rem] border border-slate-700">
                                    <div className="text-xs text-amber-500 mb-1">Lvl {lvl}</div>
                                    <div className={`font-mono font-bold ${current === 0 ? 'text-red-500' : 'text-white'}`}>
                                        {current}/{max}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 </div>
                 
                 {/* Spells Known Limit Indicator */}
                 <div className="grid grid-cols-2 gap-2 text-xs text-center">
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="block text-slate-500 uppercase font-bold">Trucchetti</span>
                        <span className={`${currentCantrips >= limits.cantrips ? 'text-amber-500' : 'text-white'}`}>{currentCantrips}/{limits.cantrips}</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="block text-slate-500 uppercase font-bold">Magie</span>
                        <span className={`${currentSpells >= limits.spellsKnown ? 'text-amber-500' : 'text-white'}`}>{currentSpells}/{limits.spellsKnown}</span>
                    </div>
                 </div>

                 {/* Spell List */}
                 <div className="space-y-2">
                 {character.spells.map((spell, i) => {
                     const isExpanded = selectedSpell === i;
                     const hasSlots = spell.level === 0 || (character.spellSlots[spell.level] > 0);
                     
                     return (
                     <div key={i} className={`bg-slate-800 rounded border transition ${isExpanded ? 'border-amber-500' : 'border-transparent hover:border-slate-600'}`}>
                         <div 
                            className="p-3 cursor-pointer flex justify-between items-center"
                            onClick={() => setSelectedSpell(isExpanded ? null : i)}
                         >
                             <div>
                                <div className="font-bold text-purple-300">{spell.name}</div>
                                <div className="text-xs text-slate-500">{spell.level === 0 ? 'Trucchetto' : `Livello ${spell.level}`} • {spell.school}</div>
                             </div>
                             {isExpanded ? 
                                <span className="text-amber-500">▼</span> : 
                                <span className="text-slate-600">▶</span>
                             }
                         </div>
                         
                         {isExpanded && (
                             <div className="px-3 pb-3 border-t border-slate-700 pt-2 bg-slate-900/50">
                                 {/* Stats Block */}
                                 <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400 mb-3 border-b border-slate-800 pb-2">
                                     <div><span className="font-bold text-slate-300">Tempo:</span> {spell.castingTime || "-"}</div>
                                     <div><span className="font-bold text-slate-300">Gittata:</span> {spell.range || "-"}</div>
                                     <div><span className="font-bold text-slate-300">Comp:</span> {spell.components || "-"}</div>
                                     <div><span className="font-bold text-slate-300">Durata:</span> {spell.duration || "-"}</div>
                                 </div>

                                 <p className="text-sm text-slate-300 mb-3 whitespace-pre-line leading-relaxed">{spell.description}</p>
                                 
                                 <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                     <div className="bg-slate-800 p-1 rounded text-center">
                                        <span className="block text-slate-500">Tiro per Colpire</span>
                                        <span className="text-white font-bold">+{spellAttackBonus}</span>
                                     </div>
                                     <div className="bg-slate-800 p-1 rounded text-center">
                                        <span className="block text-slate-500">CD Salvezza</span>
                                        <span className="text-white font-bold">{spellSaveDC}</span>
                                     </div>
                                 </div>

                                 <div className="flex gap-2">
                                     <button 
                                        onClick={() => onCastSpell(spell)}
                                        disabled={!hasSlots}
                                        className={`flex-1 font-bold py-1 px-2 rounded text-xs uppercase ${
                                            hasSlots 
                                            ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                     >
                                        {hasSlots ? 'Lancia' : 'Slot Esauriti'}
                                     </button>
                                     <button 
                                        onClick={() => onRemoveSpell(i)}
                                        className="bg-red-900/50 hover:bg-red-800 text-red-200 py-1 px-3 rounded text-xs"
                                        title="Rimuovi Magia per liberare slot conosciuto"
                                     >
                                        Scorda
                                     </button>
                                 </div>
                             </div>
                         )}
                     </div>
                 )})}
                 </div>
                 
                 {onOpenSpellBook && (
                    <button 
                        onClick={onOpenSpellBook}
                        className="w-full mt-4 py-2 border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 rounded text-sm uppercase font-bold transition-colors"
                    >
                        + Gestisci Incantesimi
                    </button>
                 )}
            </div>
        )}

        {activeTab === 'inv' && (
            <ul className="space-y-2">
                {character.inventory.map((item, i) => (
                    <li key={i} className="flex justify-between items-start text-sm border-b border-slate-800 pb-2">
                        <div>
                            <span className="text-slate-200">{item.name}</span>
                            {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                        </div>
                        <span className="text-amber-500 font-mono">x{item.quantity}</span>
                    </li>
                ))}
            </ul>
        )}

        {activeTab === 'pets' && (
             <div className="space-y-3">
             {character.companions.map((comp, i) => (
                 <div key={i} className="bg-slate-800 p-3 rounded border border-slate-700">
                     <div className="flex justify-between text-slate-200 font-bold">
                         {comp.name}
                         <span className="text-red-400 text-xs">PV: {comp.hp}/{comp.maxHp}</span>
                     </div>
                     <div className="text-xs text-amber-500 mb-1">{comp.type}</div>
                     <p className="text-xs text-slate-400">{comp.description}</p>
                 </div>
             ))}
        </div>
        )}

      </div>
    </div>
  );
};
