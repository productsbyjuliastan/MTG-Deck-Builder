export interface CardFace {
  name: string;
  type_line?: string;
  mana_cost?: string;
  oracle_text?: string;
  flavor_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  colors?: string[];
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
    png?: string;
    art_crop?: string;
    border_crop?: string;
  };
}

export interface MTGCard {
  id: string;
  name: string;
  type_line: string;
  mana_cost?: string;
  cmc?: number;
  rarity?: "common" | "uncommon" | "rare" | "mythic" | "special" | "bonus";
  set?: string;
  set_name?: string;
  collector_number?: string;
  artist?: string;
  oracle_text?: string;
  flavor_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  defense?: string;
  colors?: string[]; // e.g. ["W", "U", "B", "R", "G"]
  color_identity?: string[];
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
    png?: string;
    art_crop?: string;
    border_crop?: string;
  };
  card_faces?: CardFace[];
  prices?: {
    usd?: string;
    usd_foil?: string;
    eur?: string;
    tix?: string;
  };
  legalities?: {
    [formatName: string]: "legal" | "not_legal" | "restricted" | "banned";
  };
}

export interface StorageBoxCard {
  card: MTGCard;
  quantity: number;
}

export interface DeckCard {
  card: MTGCard;
  count: number;
  tags?: string[]; // e.g. ["Ramp", "Removal", "Card Draw"]
}

export interface DeckVersion {
  version: number;
  timestamp: string;
  cards: DeckCard[];
  commander: MTGCard | null;
  notes?: string;
}

export interface Deck {
  id: string;
  name: string;
  format: string; // Commander, Standard, etc.
  commander: MTGCard | null;
  cards: DeckCard[];
  notes?: string;
  tags?: string[];
  created_at: string;
  last_modified: string;
  versionHistory?: DeckVersion[];
}

export interface WishlistItem {
  card: MTGCard;
  quantity: number;
  notes?: string;
}

export interface TradeListItem {
  card: MTGCard;
  quantity: number;
  notes?: string;
}

export interface FormatDefinition {
  name: string;
  description: string;
  gameplayStyle: string;
  deckSizeRequirement: string;
  copiesAllowed: string;
  commanderRules?: string;
  colorIdentityRules?: string;
  restrictions: string[];
  casualOrCompetitive: string;
}

export interface AIAnalysisResult {
  powerLevel?: {
    score: number;
    explanation: string;
  };
  winConditions?: Array<{
    type: "Combat" | "Combo" | "Alternate" | "Control / Value";
    name: string;
    description: string;
    viability: string;
  }>;
  combos?: Array<{
    name: string;
    cards: string[];
    description: string;
    isInfinite: boolean;
    allInDeck: boolean;
    missingButOwned: string[];
  }>;
  manaBase?: {
    assessment: string;
    landCount: number;
    rampCount: number;
    fixingCount: number;
    colorSourceBalance: string;
    suggestedLandUpgrades: string[];
    suggestedRampUpgrades: string[];
  };
  commanderStaples?: {
    score: string;
    included: string[];
    ownedButNotIncluded: string[];
    notOwned: string[];
  };
  synergyHighlight?: Array<{
    cardName: string;
    rating: "Green" | "Orange" | "Red" | "None";
    explanation: string;
  }>;
}

export const MTG_FORMATS: Record<string, FormatDefinition> = {
  "Commander": {
    name: "Commander",
    description: "A casual multiplayer format where players build a 100-card deck around a legendary creature (their commander).",
    gameplayStyle: "Casual, Multiplayer (usually 4 players), free-for-all.",
    deckSizeRequirement: "Exactly 100 cards (99 + 1 Commander).",
    copiesAllowed: "Singleton (exactly 1 copy of any card, except basic lands).",
    commanderRules: "Must designate a legendary creature as Commander. Your commander starts in the command zone.",
    colorIdentityRules: "Every card in your deck must only use mana symbols that appear on your commander's card (color identity).",
    restrictions: [
      "No cards outside of commander's color identity.",
      "Uses a specific Commander banned list (e.g. Black Lotus, Channel, etc.)."
    ],
    casualOrCompetitive: "Casual, though Competitive Commander (cEDH) exists."
  },
  "Standard": {
    name: "Standard",
    description: "A competitive rotating format using cards from the most recent sets (usually the last 2-3 years).",
    gameplayStyle: "Competitive, One-on-one.",
    deckSizeRequirement: "Minimum 60 cards, no maximum. (Sideboard up to 15).",
    copiesAllowed: "Up to 4 copies of any card (except basic lands).",
    restrictions: [
      "Only cards from sets released in the current rotation.",
      "Specific Standard banned list."
    ],
    casualOrCompetitive: "Primarily competitive."
  },
  "Pioneer": {
    name: "Pioneer",
    description: "A non-rotating competitive format featuring cards from Return to Ravnica (2012) forward.",
    gameplayStyle: "Competitive, One-on-one.",
    deckSizeRequirement: "Minimum 60 cards. (Sideboard up to 15).",
    copiesAllowed: "Up to 4 copies of any card (except basic lands).",
    restrictions: [
      "Cards from Return to Ravnica onwards.",
      "Specific Pioneer banned list."
    ],
    casualOrCompetitive: "Competitive."
  },
  "Modern": {
    name: "Modern",
    description: "A highly popular non-rotating competitive format featuring cards from Eighth Edition (2003) to the present.",
    gameplayStyle: "Competitive, One-on-one.",
    deckSizeRequirement: "Minimum 60 cards. (Sideboard up to 15).",
    copiesAllowed: "Up to 4 copies of any card (except basic lands).",
    restrictions: [
      "Cards from Eighth Edition onwards.",
      "Modern specific banned list (e.g. violent outbursts, etc.)."
    ],
    casualOrCompetitive: "Competitive."
  },
  "Legacy": {
    name: "Legacy",
    description: "An eternal format allowing cards from all Magic sets ever printed, with a robust banned list.",
    gameplayStyle: "Competitive, One-on-one.",
    deckSizeRequirement: "Minimum 60 cards. (Sideboard up to 15).",
    copiesAllowed: "Up to 4 copies of any card.",
    restrictions: [
      "All sets are legal.",
      "Highly restrictive banned list to preserve game balance."
    ],
    casualOrCompetitive: "Highly competitive."
  },
  "Vintage": {
    name: "Vintage",
    description: "The most powerful eternal format where almost every card ever printed is legal, including the Power Nine (some cards are restricted instead of banned).",
    gameplayStyle: "Competitive, One-on-one.",
    deckSizeRequirement: "Minimum 60 cards. (Sideboard up to 15).",
    copiesAllowed: "Up to 4 copies, but restricted cards are limited to exactly 1 copy.",
    restrictions: [
      "A select few cards are banned (mostly ante cards or physical dexterity).",
      "Power Nine are legal but restricted to 1 copy per deck."
    ],
    casualOrCompetitive: "Extremely competitive and high-powered."
  },
  "Pauper": {
    name: "Pauper",
    description: "A unique non-rotating format where only cards printed at common rarity are legal.",
    gameplayStyle: "Competitive or Casual, One-on-one.",
    deckSizeRequirement: "Minimum 60 cards. (Sideboard up to 15).",
    copiesAllowed: "Up to 4 copies of any common card.",
    restrictions: [
      "Only cards that have been printed at common in any paper or digital MTG set.",
      "Pauper specific banned list."
    ],
    casualOrCompetitive: "Casual or Competitive, budget-friendly."
  },
  "Oathbreaker": {
    name: "Oathbreaker",
    description: "A fast-paced singleton format built around a Planeswalker (the Oathbreaker) and a Signature Spell.",
    gameplayStyle: "Casual, Multiplayer (usually 4 players).",
    deckSizeRequirement: "Exactly 60 cards (including Oathbreaker and Signature Spell).",
    copiesAllowed: "Singleton (exactly 1 copy).",
    commanderRules: "Deck guided by a Planeswalker who resides in the Command Zone as your Oathbreaker, plus an Instant or Sorcery signature spell.",
    colorIdentityRules: "All cards in the deck must fit within your Oathbreaker's color identity.",
    restrictions: [
      "Signature Spell can only be cast while your Oathbreaker is on the battlefield.",
      "Oathbreaker-specific banned list."
    ],
    casualOrCompetitive: "Casual."
  },
  "Brawl": {
    name: "Brawl",
    description: "An Arena-focused singleton format combining commander rules with Standard/Historic legalities.",
    gameplayStyle: "Casual or Competitive, One-on-one (often digital).",
    deckSizeRequirement: "Exactly 60 cards (Standard) or 100 cards (Historic Brawl).",
    copiesAllowed: "Singleton.",
    commanderRules: "Commander can be any Legendary Creature OR Planeswalker.",
    colorIdentityRules: "Restricted to commander's color identity.",
    restrictions: [
      "Limited to the Standard card pool (Standard Brawl) or entire Arena pool (Historic Brawl)."
    ],
    casualOrCompetitive: "Casual or semi-competitive."
  },
  "Historic": {
    name: "Historic",
    description: "An eternal digital format on MTG Arena containing all cards available on the platform, plus special digital-only additions.",
    gameplayStyle: "Competitive, One-on-one.",
    deckSizeRequirement: "Minimum 60 cards.",
    copiesAllowed: "Up to 4 copies.",
    restrictions: [
      "Only cards available on MTG Arena."
    ],
    casualOrCompetitive: "Competitive."
  },
  "Explorer": {
    name: "Explorer",
    description: "A true-to-paper non-rotating digital format on Arena matching Pioneer rules as closely as cards are added.",
    gameplayStyle: "Competitive, One-on-one.",
    deckSizeRequirement: "Minimum 60 cards.",
    copiesAllowed: "Up to 4 copies.",
    restrictions: [
      "Pioneer legality but restricted to cards currently implemented on MTG Arena."
    ],
    casualOrCompetitive: "Competitive."
  },
  "Alchemy": {
    name: "Alchemy",
    description: "A digital Standard format on MTG Arena featuring rebalanced cards and digital-only mechanics.",
    gameplayStyle: "Competitive, One-on-one.",
    deckSizeRequirement: "Minimum 60 cards.",
    copiesAllowed: "Up to 4 copies.",
    restrictions: [
      "Standard card pool plus digital-only Alchemy sets with live rebalances."
    ],
    casualOrCompetitive: "Competitive."
  },
  "Tiny Leaders": {
    name: "Tiny Leaders",
    description: "A tactical casual singleton format where every card in the deck must have a mana value of 3 or less.",
    gameplayStyle: "Casual, One-on-one.",
    deckSizeRequirement: "Exactly 50 cards (including Commander).",
    copiesAllowed: "Singleton.",
    commanderRules: "Commander must be a legendary creature with mana value 3 or less.",
    colorIdentityRules: "Restricted to commander's color identity.",
    restrictions: [
      "No cards with mana value 4 or higher allowed in the deck or sideboard."
    ],
    casualOrCompetitive: "Casual."
  },
  "Canadian Highlander": {
    name: "Canadian Highlander",
    description: "A competitive 100-card singleton format that uses a point-based list to restrict powerful cards instead of a banned list.",
    gameplayStyle: "Highly Competitive, One-on-one.",
    deckSizeRequirement: "Minimum 100 cards.",
    copiesAllowed: "Singleton.",
    restrictions: [
      "No sideboards.",
      "Decks may contain up to 10 points worth of restricted power cards from a community-managed list (e.g. Black Lotus is 7 pts, Sol Ring is 4 pts)."
    ],
    casualOrCompetitive: "Extremely competitive."
  },
  "Planechase": {
    name: "Planechase",
    description: "A casual multiplayer variant using a deck of oversized Plane cards that alter gameplay rules.",
    gameplayStyle: "Casual, Multiplayer.",
    deckSizeRequirement: "Standard deck + shared/individual Planar deck.",
    copiesAllowed: "Normal format rules apply.",
    restrictions: [
      "Adds planar cards and a planar die to regular gameplay."
    ],
    casualOrCompetitive: "Extremely casual and chaotic."
  },
  "Archenemy": {
    name: "Archenemy",
    description: "A multiplayer casual format where three players band together to defeat a single 'Archenemy' player who has a deck of powerful Scheme cards.",
    gameplayStyle: "Casual, Cooperative vs Boss.",
    deckSizeRequirement: "Normal format deck for each player, Scheme deck for the Archenemy.",
    copiesAllowed: "Normal format rules apply.",
    restrictions: [
      "Uses Archenemy Scheme cards."
    ],
    casualOrCompetitive: "Casual."
  },
  "Two-Headed Giant": {
    name: "Two-Headed Giant",
    description: "A team format where pairs of players share a single turn, life total, and battle together against another team.",
    gameplayStyle: "Casual or Competitive, 2v2 multiplayer.",
    deckSizeRequirement: "Standard format requirement per player (e.g. 60 or 100).",
    copiesAllowed: "Combined team deck cannot exceed 4 copies of any non-basic card (or 1 in commander).",
    restrictions: [
      "Share 30 life (standard formats) or 60 life (commander 2HG).",
      "Unified team turn sequence."
    ],
    casualOrCompetitive: "Casual or Competitive."
  }
};
