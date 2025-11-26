
import React, { useState, useEffect, useRef } from 'react';
import { Character, ChatMessage, LocationState, GeminiResponseSchema, Spell, ChatSettings, AbilityScores } from './types';
import { INITIAL_CHARACTER, INITIAL_LOCATION, BARD_SLOTS_TABLE } from './constants';
import { CharacterSheet } from './components/CharacterSheet';
import { DiceRoller } from './components/DiceRoller';
import { LevelUpModal } from './components/LevelUpModal';
import { SpellBookModal } from './components/SpellBookModal';
import { sendGameAction, resetSession } from './services/geminiService';

interface HistoryState {
  character: Character;
  location: LocationState;
  messages: ChatMessage[];
  suggestedActions: string[];
}

const App: React.FC = () => {
  // Game State
  const [character, setCharacter] = useState<Character>(INITIAL_CHARACTER);
  const [location, setLocation] = useState<LocationState>(INITIAL_LOCATION);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  
  // App State
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [chatSettings, setChatSettings] = useState<ChatSettings>({ responseLength: 'normal' });
  const [levelUpData, setLevelUpData] = useState<{newLevel: number, oldChar: Character} | null>(null);
  
  // Modals
  const [showSpellBook, setShowSpellBook] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  // UI State
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || process.env.API_KEY || '');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial settings show logic
  useEffect(() => {
     if (!apiKey) setShowSettings(true);
  }, [apiKey]);

  // Save current state to history
  const pushToHistory = (newChar: Character, newLoc: LocationState, newMsgs: ChatMessage[], newActions: string[]) => {
    const newState: HistoryState = { 
        character: newChar, 
        location: newLoc, 
        messages: newMsgs,
        suggestedActions: newActions
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevState = history[prevIndex];
      setCharacter(prevState.character);
      setLocation(prevState.location);
      setMessages(prevState.messages);
      setSuggestedActions(prevState.suggestedActions);
      setHistoryIndex(prevIndex);
      
      // CRITICAL: Reset AI session so it forgets the undone future
      resetSession();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      setCharacter(nextState.character);
      setLocation(nextState.location);
      setMessages(nextState.messages);
      setSuggestedActions(nextState.suggestedActions);
      setHistoryIndex(nextIndex);
      
      // We also reset here to ensure consistency
      resetSession();
    }
  };

  const saveApiKey = (key: string) => {
      setApiKey(key);
      localStorage.setItem('gemini_api_key', key);
      setShowSettings(false);
  };

  // --- SAVE / LOAD SYSTEMS ---

  // 1. Browser Save (LocalStorage)
  const handleBrowserSave = () => {
      const gameState = { character, location, messages, historyIndex, history, suggestedActions };
      localStorage.setItem('darian_autosave', JSON.stringify(gameState));
      alert("Stato salvato nel browser!");
  };

  const loadFromBrowser = () => {
      const saved = localStorage.getItem('darian_autosave');
      if (saved) {
          try {
              const data = JSON.parse(saved);
              setCharacter(data.character);
              setLocation(data.location);
              setMessages(data.messages);
              setSuggestedActions(data.suggestedActions || []);
              setHistory(data.history || []);
              setHistoryIndex(data.historyIndex || -1);
              resetSession(); // Ensure AI starts fresh with loaded state
              return true;
          } catch (e) {
              console.error("Failed to load autosave", e);
          }
      }
      return false;
  };

  // 2. Online Save (Blob)
const handleOnlineSave = async () => {
    const sessionCode = prompt("Inserisci un codice per questa sessione (es. mia-partita):");
    if (!sessionCode || sessionCode.trim() === '') return;

    const storyText = messages.map(m => {
        const sender = m.role === 'user' ? 'Darian Crane' : 'Dungeon Master';
        return `**${sender}**: ${m.text}`;
    }).join('\n\n');

    const gameState = { character, location, messages, historyIndex, history, suggestedActions };
    const hiddenData = `<!-- DATA_BLOCK_START\n${JSON.stringify(gameState)}\nDATA_BLOCK_END -->`;

    const fileContent = `# Le Cronache di Darian\n\n${storyText}\n\n${hiddenData}`;
    const filename = sessionCode.trim() + '.md';

    try {
        const response = await fetch('/api/upload-game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, content: fileContent }),
        });
        const data = await response.json();
        if (data.url) {
            alert(`Sessione salvata con codice: ${sessionCode}. Puoi caricarla inserendo questo codice.`);
        }
    } catch (error) {
        alert('Errore nel salvataggio online');
    }
};

// 3. Online Load (Blob)
const handleOnlineLoad = async () => {
    const sessionCode = prompt("Inserisci il codice della sessione da caricare:");
    if (!sessionCode || sessionCode.trim() === '') return;

    const url = `https://blob.vercel-storage.com/v1/le-cronache-di-darian-la-spina-dora.vercel.app/${sessionCode.trim()}.md`;

    try {
        const response = await fetch(`/api/load-game?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        if (data.content) {
            const text = data.content;
            const match = text.match(/DATA_BLOCK_START\n([\s\S]*?)\nDATA_BLOCK_END/);
            
            if (match && match[1]) {
                const gameData = JSON.parse(match[1]);
                if (gameData.character && gameData.location && gameData.messages) {
                    setCharacter(gameData.character);
                    setLocation(gameData.location);
                    setMessages(gameData.messages);
                    setSuggestedActions(gameData.suggestedActions || []);
                    setHistory(gameData.history || []);
                    setHistoryIndex(gameData.historyIndex || -1);
                    resetSession();
                    alert("Sessione caricata con successo!");
                } else {
                    throw new Error("Dati corrotti");
                }
            } else {
                alert("Impossibile trovare dati di salvataggio validi per questo codice.");
            }
        } else {
            alert("Sessione non trovata. Controlla il codice.");
        }
    } catch (err) {
        alert("Errore nel caricamento.");
        console.error(err);
    }
};

  // Spell Logic
  const handleCastSpell = (spell: Spell) => {
      if (spell.level > 0 && character.spellSlots[spell.level] <= 0) {
          alert("Slot esauriti per questo livello!");
          return;
      }

      // Decrement slot locally
      let newSlots = { ...character.spellSlots };
      if (spell.level > 0) {
          newSlots[spell.level] = (newSlots[spell.level] || 0) - 1;
      }
      
      const newChar = { ...character, spellSlots: newSlots };
      setCharacter(newChar);

      // Send action to AI
      const actionMsg = `Lancio ${spell.name} (Livello ${spell.level})!`;
      handleSend(actionMsg, newChar); 
      setShowMobileSheet(false); // Close mobile sheet on action
  };

  const handleRest = () => {
      const newChar = { ...character, spellSlots: { ...character.maxSpellSlots }, hp: character.maxHp };
      setCharacter(newChar);
      const msg = "Mi prendo un momento per riposare e recuperare le forze (Riposo Lungo completato: HP e Magie ripristinate).";
      handleSend(msg, newChar);
      setShowMobileSheet(false);
  };

  const handleRemoveSpell = (index: number) => {
      if (confirm("Sei sicuro di voler dimenticare questa magia?")) {
        const newSpells = character.spells.filter((_, i) => i !== index);
        const newChar = { ...character, spells: newSpells };
        setCharacter(newChar);
      }
  };
  
  const handleLearnSpell = (newChar: Character) => {
      setCharacter(newChar);
      setShowSpellBook(false);
  };

  // Level Up Logic
  const handleLevelUpConfirm = (updatedChar: Character) => {
      setCharacter(updatedChar);
      setLevelUpData(null);
      const msg = `[SISTEMA] Ho completato il livellamento al livello ${updatedChar.level}. I miei nuovi HP Max sono ${updatedChar.maxHp}. Ho imparato nuove magie.`;
      handleSend(msg, updatedChar); 
  };

  // Skill Checks
  const handleSkillRoll = (skillName: string, stat: keyof AbilityScores) => {
      const d20 = Math.floor(Math.random() * 20) + 1;
      let rollValue = d20;
      
      // Eloquence Bard: Silver Tongue
      // If Persuasion or Deception and roll is 9 or lower, treat as 10.
      let silverTongueTriggered = false;
      if ((skillName === 'Persuasione' || skillName === 'Inganno') && d20 < 10) {
          rollValue = 10;
          silverTongueTriggered = true;
      }

      const mod = Math.floor((character.stats[stat] - 10) / 2);
      const profBonus = Math.ceil(1 + (character.level / 4));
      
      const total = rollValue + mod + profBonus;

      let msg = `[Prova Abilità: ${skillName}] Totale: **${total}**\n`;
      msg += `(Dado: ${d20}${silverTongueTriggered ? '->10 (Lingua d\'Argento)' : ''} + Mod: ${mod} + Comp: ${profBonus})`;

      handleSend(msg);
      setShowMobileSheet(false);
  };

  const handleStatRoll = (stat: keyof AbilityScores) => {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const mod = Math.floor((character.stats[stat] - 10) / 2);
      const total = d20 + mod;
      
      let msg = `[Prova Caratteristica: ${stat.toUpperCase()}] Totale: **${total}** (Dado: ${d20} + Mod: ${mod})`;
      if (d20 === 20) msg += " CRITICO!";
      if (d20 === 1) msg += " FALLIMENTO!";
      
      handleSend(msg);
      setShowMobileSheet(false);
  };

  // Initial Game Start
  useEffect(() => {
    if (!apiKey) return;

    const startAdventure = async () => {
        // Try to load browser save first if history is empty
        if (history.length === 0) {
            const loaded = loadFromBrowser();
            if (loaded) return; 
        }
        
        // If still empty history after checking save, start new
        if (history.length === 0 && messages.length === 0) {
            setIsLoading(true);
            try {
                // Initial send with empty history
                const response = await sendGameAction(
                    "Descrivi la scena mentre mi trovo davanti alla bacheca de La Spina Dorata. Cosa vedo?", 
                    character, 
                    apiKey, 
                    chatSettings, 
                    []
                );
                processDmResponse(response, INITIAL_CHARACTER, INITIAL_LOCATION, []);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    // Slight delay to allow render
    if (history.length === 0 && messages.length === 0) {
         setTimeout(startAdventure, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, suggestedActions]);

  const processDmResponse = (
      response: GeminiResponseSchema, 
      currentChar: Character, 
      currentLoc: LocationState, 
      currentMsgs: ChatMessage[]
    ) => {
      
      const newMessages = [...currentMsgs, { role: 'model', text: response.narrative, timestamp: Date.now() } as ChatMessage];

      let newLocation = { ...currentLoc };
      if (response.locationUpdate) {
          newLocation = { ...newLocation, ...response.locationUpdate };
      }

      let newCharacter = { ...currentChar };
      if (response.characterUpdate) {
          const update = response.characterUpdate;
          let newHp = newCharacter.hp + (update.hpChange || 0);
          if (newHp > newCharacter.maxHp) newHp = newCharacter.maxHp;
          if (newHp < 0) newHp = 0;

          let newInventory = [...newCharacter.inventory];
          if (update.itemsAdded) {
              update.itemsAdded.forEach(newItem => {
                  const existing = newInventory.find(i => i.name === newItem.name);
                  if (existing) existing.quantity += newItem.quantity;
                  else newInventory.push({ ...newItem, isEquipped: false });
              });
          }
          if (update.itemsRemoved) {
              newInventory = newInventory.filter(i => !update.itemsRemoved?.includes(i.name));
          }
          
          let newCompanions = [...newCharacter.companions, ...(update.companionsAdded || [])];
          if (update.companionsRemoved) {
              newCompanions = newCompanions.filter(c => !update.companionsRemoved?.includes(c.name));
          }

          // Level Up Detection
          let finalLevel = newCharacter.level;
          const newXp = newCharacter.xp + (update.xpAwarded || 0);
          
          if (newCharacter.level === 5 && newXp >= 14000) finalLevel = 6;

          newCharacter = {
              ...newCharacter,
              hp: newHp,
              xp: newXp,
              gold: newCharacter.gold + (update.goldChange || 0),
              inventory: newInventory,
              companions: newCompanions,
              level: finalLevel
          };

          if (finalLevel > currentChar.level) {
              setLevelUpData({ newLevel: finalLevel, oldChar: newCharacter });
          }
      }

      const newActions = response.suggestedActions || [];
      
      setMessages(newMessages);
      setLocation(newLocation);
      setCharacter(newCharacter);
      setSuggestedActions(newActions);
      pushToHistory(newCharacter, newLocation, newMessages, newActions);
  };

  const handleSend = async (overrideText?: string, overrideChar?: Character) => {
    const textToSend = overrideText || input;
    const charState = overrideChar || character;

    if (!textToSend.trim() || isLoading || !apiKey) return;

    if (!overrideText) setInput('');
    setSuggestedActions([]); // Clear suggestions while thinking
    
    // 1. Optimistically update UI
    const tempMessages: ChatMessage[] = [...messages, { role: 'user', text: textToSend, timestamp: Date.now() }];
    setMessages(tempMessages);
    setIsLoading(true);

    try {
        const response = await sendGameAction(textToSend, charState, apiKey, chatSettings, messages);
        processDmResponse(response, charState, location, tempMessages);
    } catch (error) {
        setMessages(prev => [...prev, { role: 'model', text: "Errore di connessione arcana...", timestamp: Date.now() }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDiceRoll = (result: string) => {
    handleSend(`[Tiro di Dado] ${result}`);
    setShowMobileSheet(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Level Up Modal */}
      {levelUpData && (
          <LevelUpModal 
              newLevel={levelUpData.newLevel}
              oldCharacter={levelUpData.oldChar}
              onConfirm={handleLevelUpConfirm}
          />
      )}

      {/* Spell Book Modal */}
      {showSpellBook && (
          <SpellBookModal 
             character={character}
             onLearnSpell={handleLearnSpell}
             onClose={() => setShowSpellBook(false)}
          />
      )}

      {/* Settings Modal */}
      {showSettings && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-amber-600 p-6 rounded-lg max-w-md w-full shadow-2xl">
                  <h2 className="text-2xl font-serif text-amber-500 mb-4">Configurazione Arcanum</h2>
                  
                  <div className="mb-4">
                      <label className="block text-slate-400 text-sm mb-2">API Key Gemini</label>
                      <input 
                        type="password" 
                        placeholder="Incolla qui la tua API Key"
                        className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-amber-500 outline-none"
                        defaultValue={apiKey}
                        onBlur={(e) => saveApiKey(e.target.value)}
                      />
                  </div>

                  <div className="mb-6">
                      <label className="block text-slate-400 text-sm mb-2">Lunghezza Risposte</label>
                      <div className="flex gap-2">
                          {(['short', 'normal', 'long'] as const).map(mode => (
                              <button
                                key={mode}
                                onClick={() => setChatSettings({...chatSettings, responseLength: mode})}
                                className={`flex-1 py-2 rounded text-xs uppercase font-bold border ${
                                    chatSettings.responseLength === mode 
                                    ? 'bg-amber-600 text-white border-amber-600' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                {mode === 'short' ? 'Brevi' : mode === 'long' ? 'Lunghe' : 'Normale'}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex justify-end gap-2">
                     <button 
                        onClick={() => { if(apiKey) setShowSettings(false); }}
                        disabled={!apiKey}
                        className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-4 py-2 rounded font-bold uppercase text-sm"
                     >
                        Chiudi
                     </button>
                  </div>
              </div>
          </div>
      )}

      {/* Mobile Character Sheet Overlay */}
      {showMobileSheet && (
          <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col md:hidden animate-fade-in">
              <div className="p-4 bg-slate-900 border-b border-amber-900/30 flex justify-between items-center">
                  <h2 className="text-xl font-serif text-amber-500">Scheda Personaggio</h2>
                  <button onClick={() => setShowMobileSheet(false)} className="text-slate-400 hover:text-white p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                  <CharacterSheet 
                      character={character} 
                      onCastSpell={handleCastSpell}
                      onRest={handleRest}
                      onRemoveSpell={handleRemoveSpell}
                      onOpenSpellBook={() => setShowSpellBook(true)}
                      onSkillRoll={handleSkillRoll}
                      onStatRoll={handleStatRoll}
                      isMobile={true}
                  />
                  <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
                      <DiceRoller onRoll={handleDiceRoll} />
                  </div>
              </div>
          </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Top Bar */}
        <div className="bg-slate-900 border-b border-amber-900/30 p-2 md:p-4 shadow-lg flex flex-col gap-2 z-10">
            {/* Title & Description */}
            <div className="flex justify-between items-center">
                <div className="overflow-hidden">
                    <h1 className="text-lg md:text-2xl font-serif text-amber-500 truncate">{location.name}</h1>
                    <p className="hidden md:block text-xs md:text-sm text-slate-400 truncate">{location.description}</p>
                </div>
                {/* Mobile Toggle Button */}
                <button 
                    onClick={() => setShowMobileSheet(true)}
                    className="md:hidden bg-slate-800 text-amber-500 px-3 py-1 rounded border border-slate-700 text-sm font-bold uppercase"
                >
                    Scheda
                </button>
            </div>
            
            {/* Controls Toolbar */}
            <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end">
                
                <div className="flex gap-1 items-center bg-slate-800/50 p-1 rounded">
    {/* Browser Save */}
    <button onClick={handleBrowserSave} className="text-slate-400 hover:text-green-400 p-2 rounded hover:bg-slate-800 transition" title="Salva su Browser">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
        </svg>
    </button>
    
    {/* Online Save */}
<button onClick={handleOnlineSave} className="text-slate-400 hover:text-blue-400 p-2 rounded hover:bg-slate-800 transition" title="Salva Online con Codice">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
</button>

    {/* Online Load */}
<button onClick={handleOnlineLoad} className="text-slate-400 hover:text-purple-400 p-2 rounded hover:bg-slate-800 transition" title="Carica da Codice">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17,8 12,3 7,8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
</button>
</div>

                {/* Undo/Redo */}
                <div className="flex gap-1 bg-slate-800/50 p-1 rounded">
                    <button 
                        onClick={handleUndo} 
                        disabled={historyIndex <= 0 || isLoading}
                        className="p-2 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                    </button>
                    <button 
                        onClick={handleRedo} 
                        disabled={historyIndex >= history.length - 1 || isLoading}
                        className="p-2 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 3.7"/></svg>
                    </button>
                </div>

                <button onClick={() => setShowSettings(true)} className="text-slate-500 hover:text-amber-500 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar scroll-smooth" ref={scrollRef}>
            {messages.length === 0 && !isLoading && (
                <div className="text-center text-slate-500 mt-10">In attesa dell'inizializzazione del mondo...</div>
            )}
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[75%] rounded-lg p-3 md:p-4 shadow-md leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-br-none' 
                        : 'bg-slate-900/80 border border-amber-900/20 text-slate-200 font-serif rounded-bl-none'
                    }`}>
                        {msg.text.split('\n').map((line, i) => (
                            <p key={i} className={line.trim() === '' ? 'h-2' : 'mb-2 last:mb-0'}>{line}</p>
                        ))}
                    </div>
                </div>
            ))}
            
            {/* Suggested Actions */}
            {suggestedActions.length > 0 && !isLoading && (
                 <div className="flex flex-col md:flex-row gap-2 justify-center mt-4 px-4 animate-fade-in">
                     {suggestedActions.map((action, i) => (
                         <button
                            key={i}
                            onClick={() => handleSend(action)}
                            className="bg-slate-800 hover:bg-amber-900/50 text-amber-500 border border-amber-900/30 hover:border-amber-500 rounded px-4 py-2 text-sm font-serif transition-colors text-center"
                         >
                            {i+1}. {action}
                         </button>
                     ))}
                 </div>
            )}

            {isLoading && (
                 <div className="flex justify-start animate-pulse">
                     <div className="bg-slate-900 p-4 rounded-lg text-amber-500 italic text-sm border border-amber-900/20">
                         Il DM sta pensando...
                     </div>
                 </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
            <div className="max-w-4xl mx-auto relative flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Cosa fa Darian Crane?"
                    disabled={isLoading || !apiKey}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg py-3 pl-4 pr-4 text-white focus:outline-none focus:border-amber-500 transition-colors shadow-inner disabled:opacity-50 text-base"
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={isLoading || !apiKey}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 md:px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-wider shrink-0"
                >
                    <span className="hidden md:inline">AGISCI</span>
                    <span className="md:hidden">➤</span>
                </button>
            </div>
        </div>

      </div>

      {/* Right Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col border-l border-slate-800 bg-slate-900 h-full w-96 shrink-0">
         <CharacterSheet 
            character={character} 
            onCastSpell={handleCastSpell}
            onRest={handleRest}
            onRemoveSpell={handleRemoveSpell}
            onOpenSpellBook={() => setShowSpellBook(true)}
            onSkillRoll={handleSkillRoll}
            onStatRoll={handleStatRoll}
         />
         <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
             <DiceRoller onRoll={handleDiceRoll} />
         </div>
      </div>

    </div>
  );
};

export default App;
