import React, { useState, useEffect } from "react";
import { 
  Library, Camera, Heart, Play, Layers, Sparkles, BookOpen, Clock, 
  Plus, Check, MessageSquare, AlertCircle, HelpCircle, ChevronRight, Coins 
} from "lucide-react";
import { Deck, StorageBoxCard, MTGCard, WishlistItem, TradeListItem } from "./types";
import { OFFLINE_CARD_POOL } from "./lib/scryfall";
import CardScanner from "./components/CardScanner";
import DeckBuilder from "./components/DeckBuilder";
import CollectionManager from "./components/CollectionManager";
import Playtester from "./components/Playtester";
import WishlistManager from "./components/WishlistManager";
import CardDetails from "./components/CardDetails";
import AIAssistant from "./components/AIAssistant";

// Preload standard template deck and collection for high-fidelity offline usage out-of-the-box
const INITIAL_DECKS: Deck[] = [
  {
    id: "goblin-swarm-1",
    name: "Goblin Swarm",
    format: "Commander",
    commander: OFFLINE_CARD_POOL.find(c => c.name.includes("Krenko")) || OFFLINE_CARD_POOL[7],
    cards: [
      { card: OFFLINE_CARD_POOL[0], count: 1, tags: ["Ramp"] }, // Sol Ring
      { card: OFFLINE_CARD_POOL[2], count: 1, tags: ["Removal"] }, // Lightning Bolt
      { card: OFFLINE_CARD_POOL[10], count: 1, tags: ["Mana Fixing"] }, // Command Tower
      { card: OFFLINE_CARD_POOL[5], count: 1, tags: ["Removal"] }, // Swords to Plowshares
      { card: OFFLINE_CARD_POOL[6], count: 1, tags: ["Ramp"] } // Dark Ritual
    ],
    notes: "Aggressive goblin token strategy centered around rapid creature duplication.",
    tags: ["Aggro", "Tribal"],
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString()
  }
];

const INITIAL_COLLECTION: StorageBoxCard[] = [
  { card: OFFLINE_CARD_POOL[0], quantity: 2 }, // Sol Ring
  { card: OFFLINE_CARD_POOL[1], quantity: 1 }, // Black Lotus
  { card: OFFLINE_CARD_POOL[2], quantity: 4 }, // Lightning Bolt
  { card: OFFLINE_CARD_POOL[3], quantity: 2 }, // Counterspell
  { card: OFFLINE_CARD_POOL[4], quantity: 4 }, // Llanowar Elves
  { card: OFFLINE_CARD_POOL[5], quantity: 3 }, // Swords to Plowshares
  { card: OFFLINE_CARD_POOL[9], quantity: 2 }  // Sythis, Harvest's Hand
];

export default function App() {
  const [activeView, setActiveView] = useState<"deck" | "collection" | "playtest" | "wishlist" | "ai">("deck");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState("");
  const [collection, setCollection] = useState<StorageBoxCard[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [tradelist, setTradelist] = useState<TradeListItem[]>([]);
  
  // Card Details Modal Control
  const [selectedCardDetails, setSelectedCardDetails] = useState<MTGCard | null>(null);

  // Scanner Drawer open/close
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const cachedDecks = localStorage.getItem("mtg_saved_decks");
    const cachedCollection = localStorage.getItem("mtg_collection_box");
    const cachedWishlist = localStorage.getItem("mtg_wishlist_items");
    const cachedTradelist = localStorage.getItem("mtg_tradelist_items");

    if (cachedDecks) {
      const parsed = JSON.parse(cachedDecks);
      setDecks(parsed);
      if (parsed.length > 0) setActiveDeckId(parsed[0].id);
    } else {
      setDecks(INITIAL_DECKS);
      setActiveDeckId(INITIAL_DECKS[0].id);
      localStorage.setItem("mtg_saved_decks", JSON.stringify(INITIAL_DECKS));
    }

    if (cachedCollection) {
      setCollection(JSON.parse(cachedCollection));
    } else {
      setCollection(INITIAL_COLLECTION);
      localStorage.setItem("mtg_collection_box", JSON.stringify(INITIAL_COLLECTION));
    }

    if (cachedWishlist) setWishlist(JSON.parse(cachedWishlist));
    if (cachedTradelist) setTradelist(JSON.parse(cachedTradelist));
  }, []);

  // Sync state to local storage helper
  function saveDecksToStorage(updatedDecks: Deck[]) {
    setDecks(updatedDecks);
    localStorage.setItem("mtg_saved_decks", JSON.stringify(updatedDecks));
  }

  function saveCollectionToStorage(updatedCol: StorageBoxCard[]) {
    setCollection(updatedCol);
    localStorage.setItem("mtg_collection_box", JSON.stringify(updatedCol));
  }

  function saveWishlistToStorage(updatedWish: WishlistItem[]) {
    setWishlist(updatedWish);
    localStorage.setItem("mtg_wishlist_items", JSON.stringify(updatedWish));
  }

  function saveTradelistToStorage(updatedTrade: TradeListItem[]) {
    setTradelist(updatedTrade);
    localStorage.setItem("mtg_tradelist_items", JSON.stringify(updatedTrade));
  }

  // Multi-target adding router
  function handleAddCard(card: MTGCard, target: "storage" | "deck" | "wishlist" | "trade", qty = 1) {
    if (target === "storage") {
      const existingIdx = collection.findIndex(item => item.card.id === card.id);
      let updated = [...collection];
      if (existingIdx > -1) {
        updated[existingIdx].quantity += qty;
      } else {
        updated.push({ card, quantity: qty });
      }
      saveCollectionToStorage(updated);
    } else if (target === "deck") {
      const activeDeck = decks.find(d => d.id === activeDeckId);
      if (!activeDeck) return;

      const existingIdx = activeDeck.cards.findIndex(dc => dc.card.id === card.id);
      let updatedCards = [...activeDeck.cards];
      if (existingIdx > -1) {
        updatedCards[existingIdx].count += qty;
      } else {
        updatedCards.push({ card, count: qty, tags: [] });
      }

      const updatedDecks = decks.map(d => d.id === activeDeckId ? {
        ...d,
        cards: updatedCards,
        last_modified: new Date().toISOString()
      } : d);
      saveDecksToStorage(updatedDecks);
    } else if (target === "wishlist") {
      const existingIdx = wishlist.findIndex(item => item.card.id === card.id);
      let updated = [...wishlist];
      if (existingIdx > -1) {
        updated[existingIdx].quantity += qty;
      } else {
        updated.push({ card, quantity: qty });
      }
      saveWishlistToStorage(updated);
    } else if (target === "trade") {
      const existingIdx = tradelist.findIndex(item => item.card.id === card.id);
      let updated = [...tradelist];
      if (existingIdx > -1) {
        updated[existingIdx].quantity += qty;
      } else {
        updated.push({ card, quantity: qty });
      }
      saveTradelistToStorage(updated);
    }
  }

  // Quantity updates
  function handleUpdateCollectionQty(cardId: string, quantityChange: number) {
    const existingIdx = collection.findIndex(item => item.card.id === cardId);
    if (existingIdx === -1) return;

    let updated = [...collection];
    const newQty = updated[existingIdx].quantity + quantityChange;
    if (newQty <= 0) {
      updated.splice(existingIdx, 1);
    } else {
      updated[existingIdx].quantity = newQty;
    }
    saveCollectionToStorage(updated);
  }

  function handleUpdateWishlistQty(cardId: string, quantityChange: number) {
    const existingIdx = wishlist.findIndex(item => item.card.id === cardId);
    if (existingIdx === -1) return;

    let updated = [...wishlist];
    const newQty = updated[existingIdx].quantity + quantityChange;
    if (newQty <= 0) {
      updated.splice(existingIdx, 1);
    } else {
      updated[existingIdx].quantity = newQty;
    }
    saveWishlistToStorage(updated);
  }

  function handleUpdateTradelistQty(cardId: string, quantityChange: number) {
    const existingIdx = tradelist.findIndex(item => item.card.id === cardId);
    if (existingIdx === -1) return;

    let updated = [...tradelist];
    const newQty = updated[existingIdx].quantity + quantityChange;
    if (newQty <= 0) {
      updated.splice(existingIdx, 1);
    } else {
      updated[existingIdx].quantity = newQty;
    }
    saveTradelistToStorage(updated);
  }

  // Deletion removal routes
  function handleRemoveFromCollection(cardId: string) {
    const updated = collection.filter(item => item.card.id !== cardId);
    saveCollectionToStorage(updated);
  }

  function handleRemoveFromWishlist(cardId: string) {
    const updated = wishlist.filter(item => item.card.id !== cardId);
    saveWishlistToStorage(updated);
  }

  function handleRemoveFromTradelist(cardId: string) {
    const updated = tradelist.filter(item => item.card.id !== cardId);
    saveTradelistToStorage(updated);
  }

  // Update deck list trigger
  function handleUpdateDeck(updatedDeck: Deck) {
    const updated = decks.map(d => d.id === updatedDeck.id ? updatedDeck : d);
    saveDecksToStorage(updated);
  }

  // Add new deck
  function handleCreateNewDeck() {
    const newDeckId = `deck-${Date.now()}`;
    const newDeck: Deck = {
      id: newDeckId,
      name: "New Custom Deck",
      format: "Commander",
      commander: null,
      cards: [],
      notes: "Custom strategy deck notes...",
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString()
    };

    saveDecksToStorage([...decks, newDeck]);
    setActiveDeckId(newDeckId);
    setActiveView("deck");
  }

  const activeDeck = decks.find(d => d.id === activeDeckId) || decks[0];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1115] text-[#E0E0E0] font-sans antialiased">
      
      {/* LEFT SIDEBAR NAVIGATION BAR */}
      <aside className="w-16 flex flex-col items-center py-6 border-r border-slate-800 bg-[#0A0C10] shrink-0 justify-between">
        <div className="flex flex-col items-center gap-10">
          {/* Logo Banner Accent */}
          <button 
            onClick={handleCreateNewDeck}
            className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-orange-900/20 hover:bg-orange-500 transition-colors"
            title="Create New Deck"
          >
            M
          </button>

          {/* Nav Icons */}
          <nav className="flex flex-col gap-6">
            <button
              onClick={() => setActiveView("deck")}
              className={`p-2.5 rounded-lg transition-colors ${activeView === "deck" ? "text-orange-500 bg-orange-500/10" : "text-slate-500 hover:text-slate-200"}`}
              title="Deck Builder"
            >
              <Layers className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveView("collection")}
              className={`p-2.5 rounded-lg transition-colors ${activeView === "collection" ? "text-orange-500 bg-orange-500/10" : "text-slate-500 hover:text-slate-200"}`}
              title="Storage Box Collection"
            >
              <Library className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveView("playtest")}
              className={`p-2.5 rounded-lg transition-colors ${activeView === "playtest" ? "text-orange-500 bg-orange-500/10" : "text-slate-500 hover:text-slate-200"}`}
              title="Opening Hand Playtester"
            >
              <Play className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveView("wishlist")}
              className={`p-2.5 rounded-lg transition-colors ${activeView === "wishlist" ? "text-orange-500 bg-orange-500/10" : "text-slate-500 hover:text-slate-200"}`}
              title="Wishlist & Trading Ledger"
            >
              <Heart className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveView("ai")}
              className={`p-2.5 rounded-lg transition-colors ${activeView === "ai" ? "text-orange-500 bg-orange-500/10" : "text-slate-500 hover:text-slate-200"}`}
              title="AI Companion Assistant"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* User initials bubble footer */}
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-300 font-semibold uppercase">
          MTG
        </div>
      </aside>

      {/* RIGHT MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Global Dashboard Header */}
        <header className="h-14 border-b border-slate-800 bg-[#0F1115] flex items-center px-6 justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              {activeView === "deck" && `Deck Builder: ${activeDeck?.name || "No Decks"}`}
              {activeView === "collection" && "Storage Box Collection Management"}
              {activeView === "playtest" && `Playtester Arena: ${activeDeck?.name || "No Decks"}`}
              {activeView === "wishlist" && "Wishlist & Trading Ledgers"}
              {activeView === "ai" && "AI Tactics Companion"}
            </h1>
            
            {activeDeck && (
              <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-800 text-[10px] rounded text-slate-400 font-mono font-bold uppercase">
                {activeDeck.format} Format
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Quick selector for active deck */}
            <select
              value={activeDeckId}
              onChange={(e) => setActiveDeckId(e.target.value)}
              className="bg-[#1A1D23] border border-slate-800 rounded text-xs px-2.5 py-1 text-slate-200"
            >
              {decks.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <button
              onClick={() => setIsScannerOpen(!isScannerOpen)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" /> Toggle Scanner Box
            </button>
          </div>
        </header>

        {/* COLLAPSIBLE CAMERA CARD SCANNER HUD */}
        {isScannerOpen && (
          <div className="p-4 border-b border-slate-800 bg-[#0D0F13] animate-fade-in shrink-0">
            <CardScanner 
              onAddCard={handleAddCard} 
              activeDeckName={activeDeck?.name}
            />
          </div>
        )}

        {/* ACTIVE MAIN VIEWS ROUTER PANEL */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0F1115]">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {activeView === "deck" && activeDeck && (
              <DeckBuilder
                deck={activeDeck}
                storageBox={collection.map(item => item.card)}
                onUpdateDeck={handleUpdateDeck}
                onSelectCardDetails={setSelectedCardDetails}
              />
            )}

            {activeView === "collection" && (
              <CollectionManager
                collection={collection}
                savedDecks={decks}
                onUpdateCollectionQty={handleUpdateCollectionQty}
                onRemoveFromCollection={handleRemoveFromCollection}
                onSelectCardDetails={setSelectedCardDetails}
              />
            )}

            {activeView === "playtest" && activeDeck && (
              <Playtester cards={activeDeck.cards} />
            )}

            {activeView === "wishlist" && (
              <WishlistManager
                wishlist={wishlist}
                tradelist={tradelist}
                onUpdateWishlistQty={handleUpdateWishlistQty}
                onUpdateTradelistQty={handleUpdateTradelistQty}
                onRemoveFromWishlist={handleRemoveFromWishlist}
                onRemoveFromTradelist={handleRemoveFromTradelist}
                onSelectCardDetails={setSelectedCardDetails}
                onAddCard={handleAddCard}
              />
            )}

            {activeView === "ai" && activeDeck && (
              <AIAssistant
                deck={activeDeck}
                collection={collection}
                onAddCard={handleAddCard}
              />
            )}

          </div>
        </div>
      </main>

      {/* GLOBAL HIGH-QUALITY CARD DETAILS OVERLAY */}
      {selectedCardDetails && (
        <CardDetails
          card={selectedCardDetails}
          onClose={() => setSelectedCardDetails(null)}
          commander={activeDeck?.commander}
          ownedQty={collection.find(item => item.card.id === selectedCardDetails.id)?.quantity || 0}
          qtyInDeck={activeDeck?.cards.find(dc => dc.card.id === selectedCardDetails.id)?.count || 0}
          onAddCard={handleAddCard}
        />
      )}

    </div>
  );
}
