import { MTGCard } from "../types";

// Fallback high-quality card data for offline usage & fast rendering
export const OFFLINE_CARD_POOL: MTGCard[] = [
  {
    id: "sol-ring",
    name: "Sol Ring",
    type_line: "Artifact",
    mana_cost: "{1}",
    cmc: 1,
    rarity: "uncommon",
    set: "cmd",
    set_name: "Commander 2021",
    collector_number: "263",
    artist: "Mark Tedin",
    oracle_text: "{T}: Add {C}{C}.",
    flavor_text: "Lost in the annals of antiquity, it still radiates with primeval power.",
    colors: [],
    color_identity: [],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/c/c/cca94344-302a-43a9-8835-a749b67137b6.jpg",
      normal: "https://cards.scryfall.io/normal/front/c/c/cca94344-302a-43a9-8835-a749b67137b6.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/c/c/cca94344-302a-43a9-8835-a749b67137b6.jpg"
    },
    prices: { usd: "1.45" },
    legalities: { commander: "legal", vintage: "restricted", legacy: "banned", standard: "not_legal" }
  },
  {
    id: "black-lotus",
    name: "Black Lotus",
    type_line: "Artifact",
    mana_cost: "{0}",
    cmc: 0,
    rarity: "mythic",
    set: "vma",
    set_name: "Vintage Masters",
    collector_number: "4",
    artist: "Christopher Rush",
    oracle_text: "{T}, Sacrifice Black Lotus: Add three mana of any one color.",
    flavor_text: "Its petals hold the power of creation, pristine and lethal.",
    colors: [],
    color_identity: [],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg",
      normal: "https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg"
    },
    prices: { usd: "15000.00" },
    legalities: { commander: "banned", vintage: "restricted", legacy: "banned", standard: "not_legal" }
  },
  {
    id: "lightning-bolt",
    name: "Lightning Bolt",
    type_line: "Instant",
    mana_cost: "{R}",
    cmc: 1,
    rarity: "common",
    set: "a25",
    set_name: "Masters 25",
    collector_number: "141",
    artist: "Christopher Rush",
    oracle_text: "Lightning Bolt deals 3 damage to any target.",
    flavor_text: "The spark of inspiration can sometimes be a lethal strike.",
    colors: ["R"],
    color_identity: ["R"],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/f/2/f29ba16f-c8fb-42fe-aabf-87089cb214a7.jpg",
      normal: "https://cards.scryfall.io/normal/front/f/2/f29ba16f-c8fb-42fe-aabf-87089cb214a7.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/f/2/f29ba16f-c8fb-42fe-aabf-87089cb214a7.jpg"
    },
    prices: { usd: "0.45" },
    legalities: { commander: "legal", modern: "legal", legacy: "legal", standard: "not_legal" }
  },
  {
    id: "counterspell",
    name: "Counterspell",
    type_line: "Instant",
    mana_cost: "{U}{U}",
    cmc: 2,
    rarity: "uncommon",
    set: "mh2",
    set_name: "Modern Horizons 2",
    collector_number: "267",
    artist: "Zack Stella",
    oracle_text: "Counter target spell.",
    flavor_text: "Your genius is not required.",
    colors: ["U"],
    color_identity: ["U"],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/1/9/1912273e-fe55-4fed-997b-11743257f888.jpg",
      normal: "https://cards.scryfall.io/normal/front/1/9/1912273e-fe55-4fed-997b-11743257f888.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/1/9/1912273e-fe55-4fed-997b-11743257f888.jpg"
    },
    prices: { usd: "1.10" },
    legalities: { commander: "legal", modern: "legal", legacy: "legal", standard: "not_legal" }
  },
  {
    id: "llanowar-elves",
    name: "Llanowar Elves",
    type_line: "Creature — Elf Druid",
    mana_cost: "{G}",
    cmc: 1,
    rarity: "common",
    set: "dom",
    set_name: "Dominaria",
    collector_number: "168",
    artist: "Kev Walker",
    oracle_text: "{T}: Add {G}.",
    flavor_text: "One bone broken for every twig snapped.",
    power: "1",
    toughness: "1",
    colors: ["G"],
    color_identity: ["G"],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/7/3/73542493-cd0b-4118-8b2b-68490b700fc1.jpg",
      normal: "https://cards.scryfall.io/normal/front/7/3/73542493-cd0b-4118-8b2b-68490b700fc1.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/7/3/73542493-cd0b-4118-8b2b-68490b700fc1.jpg"
    },
    prices: { usd: "0.20" },
    legalities: { commander: "legal", modern: "legal", legacy: "legal", standard: "legal" }
  },
  {
    id: "swords-to-plowshares",
    name: "Swords to Plowshares",
    type_line: "Instant",
    mana_cost: "{W}",
    cmc: 1,
    rarity: "uncommon",
    set: "cmr",
    set_name: "Commander Legends",
    collector_number: "387",
    artist: "Terese Nielsen",
    oracle_text: "Exile target creature. Its controller gains life equal to its power.",
    flavor_text: "The ultimate end of any sword is to feed the hungry.",
    colors: ["W"],
    color_identity: ["W"],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/b/e/be541f48-b422-47f2-a870-26da783a65bf.jpg",
      normal: "https://cards.scryfall.io/normal/front/b/e/be541f48-b422-47f2-a870-26da783a65bf.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/b/e/be541f48-b422-47f2-a870-26da783a65bf.jpg"
    },
    prices: { usd: "0.80" },
    legalities: { commander: "legal", legacy: "legal", standard: "not_legal" }
  },
  {
    id: "dark-ritual",
    name: "Dark Ritual",
    type_line: "Instant",
    mana_cost: "{B}",
    cmc: 1,
    rarity: "common",
    set: "a25",
    set_name: "Masters 25",
    collector_number: "82",
    artist: "Clint Cearley",
    oracle_text: "Add {B}{B}{B}.",
    flavor_text: "The price of power is written in blood.",
    colors: ["B"],
    color_identity: ["B"],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/9/5/95f27eeb-6f14-4db3-adb9-9bc5ed720dd5.jpg",
      normal: "https://cards.scryfall.io/normal/front/9/5/95f27eeb-6f14-4db3-adb9-9bc5ed720dd5.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/9/5/95f27eeb-6f14-4db3-adb9-9bc5ed720dd5.jpg"
    },
    prices: { usd: "0.90" },
    legalities: { commander: "legal", legacy: "legal", standard: "not_legal" }
  },
  {
    id: "krenko-mob-boss",
    name: "Krenko, Mob Boss",
    type_line: "Legendary Creature — Goblin Warrior",
    mana_cost: "{2}{R}{R}",
    cmc: 4,
    rarity: "rare",
    set: "ddn",
    set_name: "Duel Decks: Speed vs. Cunning",
    collector_number: "15",
    artist: "Karl Kopinski",
    oracle_text: "{T}: Create X 1/1 red Goblin creature tokens, where X is the number of Goblins you control.",
    flavor_text: "\"He speaks, and they multiply. It's an infestation.\"",
    power: "3",
    toughness: "3",
    colors: ["R"],
    color_identity: ["R"],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/9/a/9af7e5e7-de08-419d-8f8b-c904b397acbf.jpg",
      normal: "https://cards.scryfall.io/normal/front/9/a/9af7e5e7-de08-419d-8f8b-c904b397acbf.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/9/a/9af7e5e7-de08-419d-8f8b-c904b397acbf.jpg"
    },
    prices: { usd: "5.50" },
    legalities: { commander: "legal", modern: "legal", legacy: "legal" }
  },
  {
    id: "atraxa-praetors-voice",
    name: "Atraxa, Praetors' Voice",
    type_line: "Legendary Creature — Phyrexian Angel Horror",
    mana_cost: "{G}{W}{U}{B}",
    cmc: 4,
    rarity: "mythic",
    set: "c16",
    set_name: "Commander 2016",
    collector_number: "28",
    artist: "Victor Adame Minguez",
    oracle_text: "Flying, vigilance, deathtouch, lifelink\nAt the beginning of your end step, proliferate. (Choose any number of permanent and/or players with counters on them, then give each another counter of a kind already there.)",
    power: "4",
    toughness: "4",
    colors: ["G", "W", "U", "B"],
    color_identity: ["G", "W", "U", "B"],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.jpg",
      normal: "https://cards.scryfall.io/normal/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.jpg"
    },
    prices: { usd: "19.99" },
    legalities: { commander: "legal", legacy: "legal" }
  },
  {
    id: "sythis-harvests-hand",
    name: "Sythis, Harvest's Hand",
    type_line: "Legendary Enchantment Creature — Nymph",
    mana_cost: "{G}{W}",
    cmc: 2,
    rarity: "rare",
    set: "mh2",
    set_name: "Modern Horizons 2",
    collector_number: "214",
    artist: "Ryan Yee",
    oracle_text: "Whenever you cast an enchantment spell, you gain 1 life and draw a card.",
    flavor_text: "With every seed she sows, the wild world blossoms in beauty and abundance.",
    power: "1",
    toughness: "2",
    colors: ["G", "W"],
    color_identity: ["G", "W"],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/0/b/0babfe00-9baa-4d0a-9773-0937a0a73b71.jpg",
      normal: "https://cards.scryfall.io/normal/front/0/b/0babfe00-9baa-4d0a-9773-0937a0a73b71.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/0/b/0babfe00-9baa-4d0a-9773-0937a0a73b71.jpg"
    },
    prices: { usd: "2.40" },
    legalities: { commander: "legal", modern: "legal", legacy: "legal" }
  },
  {
    id: "command-tower",
    name: "Command Tower",
    type_line: "Land",
    rarity: "common",
    set: "cmr",
    set_name: "Commander Legends",
    collector_number: "379",
    artist: "Ryan Yee",
    oracle_text: "{T}: Add one mana of any color in your commander's color identity.",
    flavor_text: "A beacon for heroes, lighting the way across many planes.",
    colors: [],
    color_identity: [],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/8/6/86db5401-9831-4a11-b47e-1234150f1d1c.jpg",
      normal: "https://cards.scryfall.io/normal/front/8/6/86db5401-9831-4a11-b47e-1234150f1d1c.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/8/6/86db5401-9831-4a11-b47e-1234150f1d1c.jpg"
    },
    prices: { usd: "0.15" },
    legalities: { commander: "legal", vintage: "legal", legacy: "legal" }
  },
  {
    id: "jace-the-mind-sculptor",
    name: "Jace, the Mind Sculptor",
    type_line: "Legendary Planeswalker — Jace",
    mana_cost: "{2}{U}{U}",
    cmc: 4,
    rarity: "mythic",
    set: "a25",
    set_name: "Masters 25",
    collector_number: "62",
    artist: "Jason Chan",
    oracle_text: "+2: Look at the top card of target player's library. You may put that card on the bottom of that library.\n+0: Draw three cards, then put two cards from your hand on top of your library in any order.\n-1: Return target creature to its owner's hand.\n-12: Exile all cards from target player's library, then that player shuffles their hand into their library.",
    loyalty: "3",
    colors: ["U"],
    color_identity: ["U"],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/c/0/c057bce2-183b-4129-b638-5590b2db32d4.jpg",
      normal: "https://cards.scryfall.io/normal/front/c/0/c057bce2-183b-4129-b638-5590b2db32d4.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/c/0/c057bce2-183b-4129-b638-5590b2db32d4.jpg"
    },
    prices: { usd: "24.99" },
    legalities: { commander: "legal", modern: "legal", legacy: "legal" }
  },
  {
    id: "birds-of-paradise",
    name: "Birds of Paradise",
    type_line: "Creature — Bird",
    mana_cost: "{G}",
    cmc: 1,
    rarity: "rare",
    set: "cn2",
    set_name: "Conspiracy: Take the Crown",
    collector_number: "176",
    artist: "Edward P. Beard, Jr.",
    oracle_text: "Flying\n{T}: Add one mana of any color.",
    flavor_text: "The plumage of the bird carries the vibrant life-force of the tropical forests.",
    power: "0",
    toughness: "1",
    colors: ["G"],
    color_identity: ["G"],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/f/e/fe74a40b-449d-417a-979b-8b267d354a3a.jpg",
      normal: "https://cards.scryfall.io/normal/front/f/e/fe74a40b-449d-417a-979b-8b267d354a3a.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/f/e/fe74a40b-449d-417a-979b-8b267d354a3a.jpg"
    },
    prices: { usd: "6.75" },
    legalities: { commander: "legal", modern: "legal", legacy: "legal" }
  },
  {
    id: "thoughtseize",
    name: "Thoughtseize",
    type_line: "Sorcery",
    mana_cost: "{B}",
    cmc: 1,
    rarity: "rare",
    set: "ima",
    set_name: "Iconic Masters",
    collector_number: "110",
    artist: "Lucas Graciano",
    oracle_text: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. You lose 2 life.",
    colors: ["B"],
    color_identity: ["B"],
    image_uris: {
      small: "https://cards.scryfall.io/small/front/3/1/310a1c46-8331-4a09-9fcb-d942c8102364.jpg",
      normal: "https://cards.scryfall.io/normal/front/3/1/310a1c46-8331-4a09-9fcb-d942c8102364.jpg",
      art_crop: "https://cards.scryfall.io/art_crop/front/3/1/310a1c46-8331-4a09-9fcb-d942c8102364.jpg"
    },
    prices: { usd: "12.50" },
    legalities: { commander: "legal", modern: "legal", legacy: "legal", pioneer: "legal" }
  }
];

// Local memory cache for API calls to preserve loaded card data offline
let localCardCache: Record<string, MTGCard> = {};

// Parse simple MTG search syntax: "type:creature", "color:R", "cmc<=3", "rarity:rare", "owned"
export function filterCardsLocally(cards: MTGCard[], query: string): MTGCard[] {
  if (!query.trim()) return cards;

  let filtered = [...cards];
  const terms = query.toLowerCase().split(/\s+/);

  for (const term of terms) {
    if (term.startsWith("type:")) {
      const typeVal = term.substring(5);
      filtered = filtered.filter(c => c.type_line?.toLowerCase().includes(typeVal));
    } else if (term.startsWith("color:")) {
      const colorVal = term.substring(6).toUpperCase();
      filtered = filtered.filter(c => {
        if (colorVal === "C" || colorVal === "COLORLESS") return !c.colors || c.colors.length === 0;
        return c.colors?.some(col => colorVal.includes(col));
      });
    } else if (term.startsWith("cmc:")) {
      const opMatch = term.match(/cmc([<>=]+)(\d+)/);
      if (opMatch) {
        const op = opMatch[1];
        const val = parseInt(opMatch[2], 10);
        filtered = filtered.filter(c => {
          const cardCmc = c.cmc || 0;
          if (op === "<=") return cardCmc <= val;
          if (op === ">=") return cardCmc >= val;
          if (op === "<") return cardCmc < val;
          if (op === ">") return cardCmc > val;
          return cardCmc === val;
        });
      } else {
        const val = parseInt(term.substring(4), 10);
        if (!isNaN(val)) {
          filtered = filtered.filter(c => (c.cmc || 0) === val);
        }
      }
    } else if (term.startsWith("rarity:")) {
      const rarityVal = term.substring(7);
      filtered = filtered.filter(c => c.rarity?.toLowerCase() === rarityVal);
    } else if (term.startsWith("oracle:")) {
      const textVal = term.substring(7);
      filtered = filtered.filter(c => c.oracle_text?.toLowerCase().includes(textVal));
    } else {
      // General name match
      filtered = filtered.filter(c => c.name.toLowerCase().includes(term));
    }
  }

  return filtered;
}

// Search Scryfall API with clean local cache & robust fallback
export async function searchCards(query: string): Promise<MTGCard[]> {
  if (!query.trim()) {
    return OFFLINE_CARD_POOL;
  }

  try {
    // If online, perform Scryfall API search with cross-origin safety
    const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Scryfall API returned status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.data) {
      const apiCards: MTGCard[] = data.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        type_line: c.type_line || "Card",
        mana_cost: c.mana_cost,
        cmc: c.cmc,
        rarity: c.rarity,
        set: c.set,
        set_name: c.set_name,
        collector_number: c.collector_number,
        artist: c.artist,
        oracle_text: c.oracle_text,
        flavor_text: c.flavor_text,
        power: c.power,
        toughness: c.toughness,
        loyalty: c.loyalty,
        defense: c.defense,
        colors: c.colors || [],
        color_identity: c.color_identity || [],
        image_uris: c.image_uris || (c.card_faces?.[0]?.image_uris ? c.card_faces[0].image_uris : null),
        card_faces: c.card_faces ? c.card_faces.map((f: any) => ({
          name: f.name,
          type_line: f.type_line,
          mana_cost: f.mana_cost,
          oracle_text: f.oracle_text,
          flavor_text: f.flavor_text,
          power: f.power,
          toughness: f.toughness,
          loyalty: f.loyalty,
          colors: f.colors,
          image_uris: f.image_uris
        })) : undefined,
        prices: c.prices || {},
        legalities: c.legalities || {}
      }));

      // Cache returned cards for offline fallback use
      apiCards.forEach(card => {
        localCardCache[card.id] = card;
        localCardCache[card.name.toLowerCase()] = card;
      });

      return apiCards;
    }
    return [];
  } catch (err) {
    console.warn("Scryfall API search failed or offline, falling back to cached & offline cards:", err);
    // Offline filtering search
    const results = filterCardsLocally(OFFLINE_CARD_POOL, query);
    // Add cached cards that match the name
    const cachedMatches = Object.values(localCardCache).filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase())
    );
    // Merge and deduplicate
    const merged = [...results];
    cachedMatches.forEach(cached => {
      if (!merged.some(m => m.id === cached.id)) {
        merged.push(cached);
      }
    });
    return merged;
  }
}

// Fetch exact details for a single card
export async function getCardDetails(id: string, name?: string): Promise<MTGCard | null> {
  // Check local cache first
  if (localCardCache[id]) return localCardCache[id];
  if (name && localCardCache[name.toLowerCase()]) return localCardCache[name.toLowerCase()];

  // Check offline database pool
  const offlineMatch = OFFLINE_CARD_POOL.find(c => c.id === id || (name && c.name.toLowerCase() === name.toLowerCase()));
  if (offlineMatch) return offlineMatch;

  try {
    let url = `https://api.scryfall.com/cards/${id}`;
    if (!id && name) {
      url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Scryfall API returned status: ${response.status}`);
    }
    const c = await response.json();
    const card: MTGCard = {
      id: c.id,
      name: c.name,
      type_line: c.type_line || "Card",
      mana_cost: c.mana_cost,
      cmc: c.cmc,
      rarity: c.rarity,
      set: c.set,
      set_name: c.set_name,
      collector_number: c.collector_number,
      artist: c.artist,
      oracle_text: c.oracle_text,
      flavor_text: c.flavor_text,
      power: c.power,
      toughness: c.toughness,
      loyalty: c.loyalty,
      defense: c.defense,
      colors: c.colors || [],
      color_identity: c.color_identity || [],
      image_uris: c.image_uris || (c.card_faces?.[0]?.image_uris ? c.card_faces[0].image_uris : null),
      card_faces: c.card_faces ? c.card_faces.map((f: any) => ({
        name: f.name,
        type_line: f.type_line,
        mana_cost: f.mana_cost,
        oracle_text: f.oracle_text,
        flavor_text: f.flavor_text,
        power: f.power,
        toughness: f.toughness,
        loyalty: f.loyalty,
        colors: f.colors,
        image_uris: f.image_uris
      })) : undefined,
      prices: c.prices || {},
      legalities: c.legalities || {}
    };

    localCardCache[card.id] = card;
    localCardCache[card.name.toLowerCase()] = card;
    return card;
  } catch (err) {
    console.warn(`Failed to fetch card details for ${id || name}, checking fallback pool:`, err);
    return offlineMatch || null;
  }
}

// Scan card simulator - OCR/Recognition logic using camera feed or file upload
export function mockScanCard(imageBuffer: string): Promise<MTGCard> {
  return new Promise((resolve, reject) => {
    // Simulate OCR logic which scans the picture and maps it to a popular card
    setTimeout(() => {
      // Pick a random iconic card from our offline pool to simulate scanning success!
      const randomIndex = Math.floor(Math.random() * OFFLINE_CARD_POOL.length);
      resolve(OFFLINE_CARD_POOL[randomIndex]);
    }, 1500);
  });
}
