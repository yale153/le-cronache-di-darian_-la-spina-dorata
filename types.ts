
export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface Spell {
  name: string;
  level: number; // 0 for cantrip
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description: string;
}

export interface SpellDefinition {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
}

export interface Item {
  name: string;
  quantity: number;
  description?: string;
  isEquipped?: boolean;
}

export interface Companion {
  name: string;
  type: string;
  description: string;
  hp: number;
  maxHp: number;
}

export interface Character {
  name: string;
  class: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  ac: number;
  gold: number;
  stats: AbilityScores;
  spells: Spell[];
  spellSlots: { [level: number]: number }; // Current available slots
  maxSpellSlots: { [level: number]: number }; // Max slots for level
  inventory: Item[];
  companions: Companion[];
  features: string[];
}

export interface LocationState {
  name: string;
  description: string;
  npcs: string[];
  imageUrl?: string;
}

export interface GameState {
  character: Character;
  location: LocationState;
  messages: ChatMessage[];
  isLoading: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSettings {
  responseLength: 'short' | 'normal' | 'long';
}

export interface GeminiResponseSchema {
  narrative: string;
  suggestedActions: string[]; // List of 3 options
  locationUpdate?: {
    name: string;
    description: string;
    npcs: string[];
  };
  characterUpdate?: {
    hpChange?: number;
    xpAwarded?: number;
    goldChange?: number;
    itemsAdded?: Item[];
    itemsRemoved?: string[];
    companionsAdded?: Companion[];
    companionsRemoved?: string[]; // Names of companions to remove
  };
}
