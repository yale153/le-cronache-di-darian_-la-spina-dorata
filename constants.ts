
import { Character, SpellDefinition, AbilityScores } from "./types";

// Bard Spell Slots per Level (5e)
export const BARD_SLOTS_TABLE: { [level: number]: { [slotLevel: number]: number } } = {
  1: { 1: 2 },
  2: { 1: 3 },
  3: { 1: 4, 2: 2 },
  4: { 1: 4, 2: 3 },
  5: { 1: 4, 2: 3, 3: 2 },
  6: { 1: 4, 2: 3, 3: 3 },
  7: { 1: 4, 2: 3, 3: 3, 4: 1 },
  8: { 1: 4, 2: 3, 3: 3, 4: 2 },
  9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
};

// Bard Progression: Cantrips Known and Spells Known
export const BARD_LEVEL_PROGRESSION: { [level: number]: { cantrips: number; spellsKnown: number } } = {
    1: { cantrips: 2, spellsKnown: 4 },
    2: { cantrips: 2, spellsKnown: 5 },
    3: { cantrips: 2, spellsKnown: 6 },
    4: { cantrips: 3, spellsKnown: 7 },
    5: { cantrips: 3, spellsKnown: 8 },
    6: { cantrips: 3, spellsKnown: 9 },
    7: { cantrips: 3, spellsKnown: 10 },
    8: { cantrips: 3, spellsKnown: 11 },
    9: { cantrips: 3, spellsKnown: 12 },
    10: { cantrips: 4, spellsKnown: 14 },
    11: { cantrips: 4, spellsKnown: 15 },
    12: { cantrips: 4, spellsKnown: 15 },
    13: { cantrips: 4, spellsKnown: 16 },
    14: { cantrips: 4, spellsKnown: 18 },
    15: { cantrips: 4, spellsKnown: 19 },
    16: { cantrips: 4, spellsKnown: 19 },
    17: { cantrips: 4, spellsKnown: 20 },
    18: { cantrips: 4, spellsKnown: 22 },
    19: { cantrips: 4, spellsKnown: 22 },
    20: { cantrips: 4, spellsKnown: 22 },
};

export const SKILLS_MAPPING: { name: string; stat: keyof AbilityScores }[] = [
    { name: "Acrobazia", stat: "dex" },
    { name: "Addestrare Animali", stat: "wis" },
    { name: "Arcano", stat: "int" },
    { name: "Atletica", stat: "str" },
    { name: "Furtività", stat: "dex" },
    { name: "Indagare", stat: "int" },
    { name: "Inganno", stat: "cha" },
    { name: "Intimidire", stat: "cha" },
    { name: "Intuizione", stat: "wis" },
    { name: "Medicina", stat: "wis" },
    { name: "Natura", stat: "int" },
    { name: "Percezione", stat: "wis" },
    { name: "Persuasione", stat: "cha" },
    { name: "Rapidità di Mano", stat: "dex" },
    { name: "Religione", stat: "int" },
    { name: "Sopravvivenza", stat: "wis" },
    { name: "Storia", stat: "int" }
];

export const INITIAL_CHARACTER: Character = {
  name: "Darian 'Danny' Crane",
  class: "Bardo (Collegio dell'Eloquenza)",
  level: 5,
  xp: 6500, 
  hp: 38,
  maxHp: 38,
  ac: 14,
  gold: 50000,
  stats: {
    str: 8,
    dex: 14,
    con: 14,
    int: 12,
    wis: 10,
    cha: 18,
  },
  features: [
    "Lingua d'Argento (Min 10 su Persuasione/Inganno)",
    "Parole Inquietanti",
    "Ispirazione Bardica (d8)",
    "Tuttofare",
  ],
  spells: [
    { 
        name: "Beffa Crudele (Vicious Mockery)", 
        level: 0, 
        school: "Ammaliamento",
        castingTime: "1 Azione",
        range: "18 metri",
        components: "V",
        duration: "Istantanea",
        description: "Scateni una sfilza di insulti intrisi di magia sottile contro una creatura che puoi vedere entro gittata. Il bersaglio deve superare un TS su Saggezza o subire 2d4 danni psichici e avere svantaggio al prossimo tiro per colpire che effettua prima della fine del suo prossimo turno."
    },
    { 
        name: "Mano Magica (Mage Hand)", 
        level: 0, 
        school: "Evocazione",
        castingTime: "1 Azione",
        range: "9 metri",
        components: "V, S",
        duration: "1 Minuto",
        description: "Una mano spettrale fluttuante appare in un punto a tua scelta entro gittata. Puoi usare l'azione per controllarla (aprire porte, prendere oggetti fino a 5kg). Non può attaccare o attivare oggetti magici."
    },
    { 
        name: "Prestidigitazione", 
        level: 0, 
        school: "Trasmutazione",
        castingTime: "1 Azione",
        range: "3 metri",
        components: "V, S",
        duration: "fino a 1 ora",
        description: "Un trucchetto magico minore: crea scintille, pulisce o sporca un oggetto, riscalda o raffredda cibo, crea un simbolo illusorio."
    },
    { 
        name: "Charme su Persone", 
        level: 1, 
        school: "Ammaliamento",
        castingTime: "1 Azione",
        range: "9 metri",
        components: "V, S",
        duration: "1 ora",
        description: "Tenti di affascinare un umanoide che puoi vedere entro gittata. Deve effettuare un TS su Saggezza (con vantaggio se stai combattendo contro di lui). Se fallisce, è affascinato da te (ti considera un amico fidato) finché l'incantesimo non termina o finché non gli fai del male."
    },
    { 
        name: "Parola Guaritrice", 
        level: 1, 
        school: "Evocazione",
        castingTime: "1 Azione Bonus",
        range: "18 metri",
        components: "V",
        duration: "Istantanea",
        description: "Una creatura a tua scelta che puoi vedere entro gittata recupera punti ferita pari a 1d4 + il tuo modificatore di caratteristica da incantatore."
    },
    { 
        name: "Suggestione", 
        level: 2, 
        school: "Ammaliamento",
        castingTime: "1 Azione",
        range: "9 metri",
        components: "V, M",
        duration: "Concentrazione, fino a 8 ore",
        description: "Suggerisci un corso d'azione (limitato a una o due frasi) a una creatura che può sentirti e capirti. Se fallisce il TS Saggezza, deve perseguire il corso d'azione al meglio delle sue capacità."
    },
    { 
        name: "Trama Ipnotica", 
        level: 3, 
        school: "Illusione", 
        castingTime: "1 Azione",
        range: "36 metri",
        components: "S, M",
        duration: "Concentrazione, fino a 1 minuto",
        description: "Crei un motivo di colori che si torce e si intreccia all'interno di un cubo con spigolo di 9 metri entro gittata. Le creature nell'area che vedono il motivo devono effettuare un TS Saggezza. Se falliscono, sono affascinate, inabilitate e la loro velocità diventa 0."
    },
    { 
        name: "Linguaggi (Tongues)", 
        level: 3, 
        school: "Divinazione",
        castingTime: "1 Azione",
        range: "Contatto",
        components: "V, M",
        duration: "1 ora",
        description: "Questa magia conferisce alla creatura toccata la capacità di capire qualsiasi lingua parlata che sente. Inoltre, quando il bersaglio parla, qualsiasi creatura che conosca almeno una lingua può capire ciò che dice."
    },
  ],
  // Initial slots for Level 5
  spellSlots: { 1: 4, 2: 3, 3: 2 }, 
  maxSpellSlots: { 1: 4, 2: 3, 3: 2 },
  inventory: [
    { name: "Abiti Pregiati (Completi di Seta)", quantity: 5, description: "Sartoria impeccabile." },
    { name: "Stocco", quantity: 1, description: "Lama elegante." },
    { name: "Viola (Capolavoro)", quantity: 1, description: "Strumento squisito." },
    { name: "Anello con Sigillo (Famiglia Crane)", quantity: 1 },
    { name: "Atto di Proprietà Carrozza", quantity: 1 },
  ],
  companions: [
    { name: "Jeeves", type: "Cocchiere Umano", description: "Leale, silenzioso, guidatore esperto.", hp: 20, maxHp: 20 },
    { name: "Stalloni Crane", type: "Cavalli (x6)", description: "Stalloni bianchi pluripremiati.", hp: 15, maxHp: 15 }
  ]
};

export const INITIAL_LOCATION = {
  name: "La Spina Dorata",
  description: "Una vivace locanda crocevia. L'aroma di spezie e mandorle tostate riempie l'aria.",
  npcs: ["Locandiere", "Mercante Nervoso", "Messaggero del Magistrato"],
  imageUrl: "https://picsum.photos/800/400?grayscale"
};

// Expanded Spell Library
export const BARD_SPELL_LIBRARY: SpellDefinition[] = [
    { 
        name: "Luce Danzante", 
        level: 0, 
        school: "Evocazione", 
        castingTime: "1 Azione",
        range: "36 metri",
        components: "V, S, M",
        duration: "Concentrazione, fino a 1 min",
        description: "Crei fino a quattro luci grandi come torce. Puoi muoverle come azione bonus. Devono rimanere entro 6 metri l'una dall'altra." 
    },
    { 
        name: "Messaggio", 
        level: 0, 
        school: "Trasmutazione", 
        castingTime: "1 Azione",
        range: "36 metri",
        components: "V, S, M",
        duration: "1 Round",
        description: "Punti il dito verso una creatura e sussurri un messaggio. Solo il bersaglio lo sente e può rispondere con un sussurro." 
    },
    { 
        name: "Illusione Minore", 
        level: 0, 
        school: "Illusione", 
        castingTime: "1 Azione",
        range: "9 metri",
        components: "S, M",
        duration: "1 Minuto",
        description: "Crei un suono o un'immagine di un oggetto (non più grande di un cubo di 1,5m). Se è un'immagine, è statica e non produce suoni." 
    },
    { 
        name: "Individuazione del Magico", 
        level: 1, 
        school: "Divinazione", 
        castingTime: "1 Azione",
        range: "Incantatore",
        components: "V, S",
        duration: "Concentrazione, fino a 10 min",
        description: "Per la durata, percepisci la presenza della magia entro 9 metri da te. Se percepisci la magia in questo modo, puoi usare l'azione per vedere una debole aura attorno a qualsiasi creatura o oggetto visibile nell'area che rechi magia." 
    },
    { 
        name: "Risata Incontenibile di Tasha", 
        level: 1, 
        school: "Ammaliamento", 
        castingTime: "1 Azione",
        range: "9 metri",
        components: "V, S, M",
        duration: "Concentrazione, fino a 1 min",
        description: "Una creatura a tua scelta che puoi vedere entro gittata percepisce ogni cosa come esilarante e cade a terra prona, diventando inabilitata e incapace di alzarsi per la durata." 
    },
    { 
        name: "Sonno", 
        level: 1, 
        school: "Ammaliamento", 
        castingTime: "1 Azione",
        range: "27 metri",
        components: "V, S, M",
        duration: "1 Minuto",
        description: "Tira 5d8; il totale è quanti punti ferita di creature questa magia può influenzare. Le creature entro 6 metri da un punto scelto cadono addormentate, partendo da quella con i PF attuali più bassi." 
    },
    { 
        name: "Onda di Tuono", 
        level: 1, 
        school: "Evocazione", 
        castingTime: "1 Azione",
        range: "Incantatore (Cubo 4.5m)",
        components: "V, S",
        duration: "Istantanea",
        description: "Un'onda di forza tonante si sprigiona da te. Ogni creatura in un cubo di 4,5 metri deve effettuare un TS Costituzione. Se fallisce, subisce 2d8 danni da tuono e viene spinta via di 3 metri." 
    },
    { 
        name: "Frantumare", 
        level: 2, 
        school: "Evocazione", 
        castingTime: "1 Azione",
        range: "18 metri",
        components: "V, S, M",
        duration: "Istantanea",
        description: "Un suono improvviso e assordante esplode in una sfera di 3 metri di raggio. Ogni creatura deve effettuare un TS Costituzione, subendo 3d8 danni da tuono se fallisce." 
    },
    { 
        name: "Invisibilità", 
        level: 2, 
        school: "Illusione", 
        castingTime: "1 Azione",
        range: "Contatto",
        components: "V, S, M",
        duration: "Concentrazione, fino a 1 ora",
        description: "Una creatura che tocchi diventa invisibile finché l'incantesimo non termina. Termina se il bersaglio attacca o lancia un incantesimo." 
    },
    { 
        name: "Riscaldare il Metallo", 
        level: 2, 
        school: "Trasmutazione", 
        castingTime: "1 Azione",
        range: "18 metri",
        components: "V, S, M",
        duration: "Concentrazione, fino a 1 min",
        description: "Scegli un oggetto di metallo lavorato entro gittata. Chiunque sia in contatto fisico con l'oggetto subisce 2d8 danni da fuoco quando lanci l'incantesimo. Puoi usare l'azione bonus nei turni successivi per ripetere il danno." 
    },
    { 
        name: "Vedere l'Invisibile", 
        level: 2, 
        school: "Divinazione", 
        castingTime: "1 Azione",
        range: "Incantatore",
        components: "V, S, M",
        duration: "1 ora",
        description: "Per la durata, vedi le creature e gli oggetti invisibili come se fossero visibili." 
    },
    { 
        name: "Paura", 
        level: 3, 
        school: "Illusione", 
        castingTime: "1 Azione",
        range: "Cono di 9 metri",
        components: "V, S, M",
        duration: "Concentrazione, fino a 1 min",
        description: "Proietti un'immagine spettrale. Ogni creatura in un cono di 9 metri deve superare un TS Saggezza o lasciar cadere ciò che sta tenendo e diventare spaventata." 
    },
    { 
        name: "Dissolvi Magie", 
        level: 3, 
        school: "Abiurazione", 
        castingTime: "1 Azione",
        range: "36 metri",
        components: "V, S",
        duration: "Istantanea",
        description: "Scegli una creatura, un oggetto o un effetto magico entro gittata. Qualsiasi incantesimo di 3° livello o inferiore sul bersaglio termina." 
    },
    { 
        name: "Inviare", 
        level: 3, 
        school: "Evocazione", 
        castingTime: "1 Azione",
        range: "Illimitata",
        components: "V, S, M",
        duration: "1 Round",
        description: "Invii un messaggio di 25 parole o meno a una creatura con cui sei familiare. La creatura sente il messaggio nella sua mente e può rispondere." 
    },
    { 
        name: "Immagine Maggiore", 
        level: 3, 
        school: "Illusione", 
        castingTime: "1 Azione",
        range: "36 metri",
        components: "V, S, M",
        duration: "Concentrazione, fino a 10 min",
        description: "Crei l'immagine di un oggetto, una creatura o un altro fenomeno visibile non più grande di un cubo di 6 metri. Sembra completamente reale, inclusi suoni, odori e temperatura." 
    },
    { 
        name: "Metamorfosi", 
        level: 4, 
        school: "Trasmutazione", 
        castingTime: "1 Azione",
        range: "18 metri",
        components: "V, S, M",
        duration: "Concentrazione, fino a 1 ora",
        description: "Trasforma una creatura in una bestia. La nuova forma può essere qualsiasi bestia con grado di sfida pari o inferiore al livello del bersaglio." 
    },
    { 
        name: "Porta Dimensionale", 
        level: 4, 
        school: "Evocazione", 
        castingTime: "1 Azione",
        range: "150 metri",
        components: "V",
        duration: "Istantanea",
        description: "Ti teletrasporti fino a 150 metri in un punto non occupato che puoi vedere o visualizzare. Puoi portare con te oggetti e una creatura consenziente." 
    },
    { 
        name: "Libertà di Movimento", 
        level: 4, 
        school: "Abiurazione", 
        castingTime: "1 Azione",
        range: "Contatto",
        components: "V, S, M",
        duration: "1 ora",
        description: "La velocità del bersaglio non può essere ridotta da incantesimi o effetti magici, né il bersaglio può essere paralizzato o trattenuto." 
    },
];
