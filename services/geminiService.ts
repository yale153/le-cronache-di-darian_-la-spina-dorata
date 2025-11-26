
import { GoogleGenAI, Type, Content } from "@google/genai";
import { Character, GeminiResponseSchema, ChatSettings, ChatMessage } from "../types";

const BASE_CONTEXT = `
Sei il Dungeon Master per una campagna in solitaria di D&D 5e.
Il giocatore è **Darian "Danny" Crane** (Livello 5 Bardo, Collegio dell'Eloquenza).
Danny è incredibilmente ricco (50.000 MO), viaggia in una carrozza con 6 cavalli e un cocchiere di nome Jeeves.
È modellato su Denny Crane di Boston Legal: arrogante, affascinante, ossessionato dal suo nome, convinto di essere imbattuto in combattimenti legali/sociali.

**Ambientazione Attuale:**
La città di Veridia è alle spalle. Il giocatore si trova a "La Spina Dorata", una vivace locanda crocevia sulla strada commerciale per Eryndale.
C'è una bacheca con un sigillo della magistratura: "Richiesto gruppo indipendente per indagine interna urgente."

**Regole di Narrazione (IMPORTANTE):**
1. Tu agisci come il DM. Narra il mondo, gli NPC e il combattimento in ITALIANO.
2. **Co-Autore Teatrale:** Se il giocatore scrive un input breve o scarno (es. "Apro la porta", "Lo persuado"), NON rispondere solo "ok". Interpreta l'azione in modo teatrale basandoti sulla personalità sgargiante di Danny Crane. Descrivi COME lo fa (es. "Con un gesto teatrale e un sorriso smagliante, spalanchi i battenti...").
3. **Non rubare l'esito:** Arricchisci la descrizione dell'azione, ma se l'azione richiede un tiro di dado incerto, chiedi il tiro prima di narrare il successo o il fallimento.

**Regole di Gioco:**
1. Usa le regole di D&D 5e.
2. Gestisci XP e Livellamento automaticamente.
3. Se un NPC si unisce al gruppo o se ne va, aggiorna la lista companions.
4. **Opzioni:** Alla fine di OGNI risposta, fornisci SEMPRE 3 opzioni ("suggestedActions") concise e distinte su cosa il giocatore potrebbe fare dopo.

**FORMATO OUTPUT CRITICO:**
Devi rispondere con un oggetto JSON che aderisce a questo schema. NON fornire testo semplice fuori dal JSON.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    narrative: { type: Type.STRING, description: "La narrazione del DM e la risposta al giocatore in Italiano." },
    suggestedActions: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Esattamente 3 brevi opzioni d'azione per il giocatore (es. 'Attacco il goblin', 'Provo a persuaderlo', 'Scappo')."
    },
    locationUpdate: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        npcs: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    characterUpdate: {
      type: Type.OBJECT,
      properties: {
        hpChange: { type: Type.INTEGER, description: "Negativo per danni, positivo per cure. 0 se nessun cambiamento." },
        xpAwarded: { type: Type.INTEGER },
        goldChange: { type: Type.INTEGER },
        itemsAdded: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.INTEGER },
              description: { type: Type.STRING },
            },
          },
        },
        itemsRemoved: { type: Type.ARRAY, items: { type: Type.STRING } },
        companionsAdded: {
           type: Type.ARRAY,
           items: {
             type: Type.OBJECT,
             properties: {
               name: { type: Type.STRING },
               type: { type: Type.STRING },
               description: { type: Type.STRING },
               hp: { type: Type.INTEGER },
               maxHp: { type: Type.INTEGER },
             }
           }
        },
        companionsRemoved: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Nomi dei compagni che lasciano il gruppo."
        }
      },
    },
  },
  required: ["narrative", "suggestedActions"],
};

let chatSession: any = null;
let currentApiKey: string | null = null;
let currentSettings: string = "";

// Force reset of the session (used on Undo)
export const resetSession = () => {
    chatSession = null;
    console.log("Gemini session reset due to Undo.");
};

export const initializeGemini = async (apiKey: string, settings: ChatSettings, historyMessages: ChatMessage[]) => {
  const settingsString = JSON.stringify(settings);
  
  if (chatSession && currentApiKey === apiKey && currentSettings === settingsString) return;
  
  const ai = new GoogleGenAI({ apiKey: apiKey });
  currentApiKey = apiKey;
  currentSettings = settingsString;

  let lengthInstruction = "Mantieni le risposte concise ma evocative.";
  if (settings.responseLength === 'long') lengthInstruction = "Sii molto descrittivo, verboso, teatrale e atmosferico.";
  if (settings.responseLength === 'short') lengthInstruction = "Sii estremamente breve e diretto. Massimo 2-3 frasi.";

  // Convert app messages to Gemini Content format for context restoration
  const historyContents: Content[] = historyMessages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
  }));

  chatSession = ai.chats.create({
    model: "gemini-2.5-flash",
    history: historyContents,
    config: {
      systemInstruction: `${BASE_CONTEXT}\n\nPreferenza Lunghezza: ${lengthInstruction}`,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });
};

export const sendGameAction = async (
  action: string,
  currentState: Character,
  apiKey: string,
  settings: ChatSettings,
  historyMessages: ChatMessage[] 
): Promise<GeminiResponseSchema> => {
  if (!apiKey) {
      throw new Error("Chiave API mancante");
  }

  await initializeGemini(apiKey, settings, historyMessages);

  // Passiamo un riepilogo leggero dello stato attuale così il DM sa se siamo morti o al verde
  const contextMessage = `
    [Stato Attuale: HP ${currentState.hp}/${currentState.maxHp}, Oro: ${currentState.gold}, Livello: ${currentState.level}, XP: ${currentState.xp}]
    [Compagni Attuali: ${currentState.companions.map(c => c.name).join(", ")}]
    [Slot Incantesimi Rimanenti: ${JSON.stringify(currentState.spellSlots)}]
    Azione Giocatore: ${action}
  `;

  try {
    const result = await chatSession.sendMessage({ message: contextMessage });
    const responseText = result.text;
    
    const parsedData = JSON.parse(responseText) as GeminiResponseSchema;
    return parsedData;
  } catch (error) {
    console.error("Gemini Interaction Error:", error);
    return {
      narrative: "La trama della magia vacilla... (Errore API: Controlla la tua chiave o riprova)",
      suggestedActions: ["Riprova l'azione", "Controlla la scheda", "Attendi..."]
    };
  }
};
