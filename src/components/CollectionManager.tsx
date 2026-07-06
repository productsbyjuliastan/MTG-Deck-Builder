import React, { useState } from "react";
import { 
  Plus, Minus, Trash2, Library, ChevronDown, ChevronRight, ListFilter, 
  Sparkles, SlidersHorizontal, BookOpen, Layers, CheckSquare 
} from "lucide-react";
import { StorageBoxCard, MTGCard, Deck } from "../types";

interface CollectionManagerProps {
  collection: StorageBoxCard[];
  savedDecks: Deck[];
  onUpdateCollectionQty: (cardId: string, quantity: number) => void;
  onRemoveFromCollection: (cardId: string) => void;
  onSelectCardDetails: (card: MTGCard) => void;
}

export default function CollectionManager({
  collection,
  savedDecks,
  onUpdateCollectionQty,
  onRemoveFromCollection,
  onSelectCardDetails
}: CollectionManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"all" | "by-deck">("all");
  const [filterType, setFilterType] = useState("All");
  const [filterColor, setFilterColor] = useState("All");
  const [filterRarity, setFilterRarity] = useState("All");
  const [sortBy, setSortBy] = useState("Name");
  const [expandedDecks, setExpandedDecks] = useState<Record<string, boolean>>({});

  // Sorting / filtering
  const filteredCollection = collection.filter((item) => {
    const card = item.card;
    const matchesType = filterType === "All" || card.type_line?.toLowerCase().includes(filterType.toLowerCase());
    const matchesColor = filterColor === "All" || (card.colors || []).includes(filterColor);
    const matchesRarity = filterRarity === "All" || card.rarity?.toLowerCase() === filterRarity.toLowerCase();
    return matchesType && matchesColor && matchesRarity;
  }).sort((a, b) => {
    const cardA = a.card;
    const cardB = b.card;

    if (sortBy === "Name") return cardA.name.localeCompare(cardB.name);
    if (sortBy === "CMC") return (cardA.cmc || 0) - (cardB.cmc || 0);
    if (sortBy === "Rarity") return (cardA.rarity || "").localeCompare(cardB.rarity || "");
    if (sortBy === "Quantity") return b.quantity - a.quantity;
    return 0;
  });

  function toggleDeckCollapse(deckId: string) {
    setExpandedDecks(prev => ({
      ...prev,
      [deckId]: !prev[deckId]
    }));
  }

  return (
    <div className="bg-[#0A0C10] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[700px] font-mono text-xs">
      
      {/* Tab controls */}
      <div className="flex border-b border-slate-800 bg-[#0F1115] px-4 justify-between items-center text-xs">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSubTab("all")}
            className={`py-3 px-2 font-bold uppercase tracking-widest border-b-2 transition-colors ${activeSubTab === "all" ? "border-orange-500 text-orange-500" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            All Collection Cards
          </button>
          <button
            onClick={() => setActiveSubTab("by-deck")}
            className={`py-3 px-2 font-bold uppercase tracking-widest border-b-2 transition-colors ${activeSubTab === "by-deck" ? "border-orange-500 text-orange-500" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            View By Deck List
          </button>
        </div>

        <div className="text-[10px] text-slate-500">
          Total Cards: {collection.reduce((sum, item) => sum + item.quantity, 0)} • Unique: {collection.length}
        </div>
      </div>

      {/* FILTER CONTROLS FOR "ALL" TAB */}
      {activeSubTab === "all" && (
        <div className="p-3 bg-[#0D1014] border-b border-slate-800 flex flex-wrap gap-3 items-center text-[11px]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5"
            >
              <option value="Name">Alphabetical</option>
              <option value="CMC">Mana Value / Cost</option>
              <option value="Rarity">Rarity Tier</option>
              <option value="Quantity">Quantity Owned</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5"
            >
              <option value="All">All Types</option>
              <option value="Land">Lands</option>
              <option value="Creature">Creatures</option>
              <option value="Instant">Instants</option>
              <option value="Sorcery">Sorceries</option>
              <option value="Artifact">Artifacts</option>
              <option value="Enchantment">Enchantments</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Color:</span>
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5"
            >
              <option value="All">All Colors</option>
              <option value="W">White</option>
              <option value="U">Blue</option>
              <option value="B">Black</option>
              <option value="R">Red</option>
              <option value="G">Green</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Rarity:</span>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5"
            >
              <option value="All">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="mythic">Mythic</option>
            </select>
          </div>
        </div>
      )}

      {/* RENDER VIEW ACCORDING TO SUB-TAB */}
      <div className="flex-1 overflow-y-auto">
        
        {/* ALL CARDS LIST VIEW */}
        {activeSubTab === "all" && (
          <div className="flex flex-col h-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-slate-800 bg-[#0A0C10] text-[9px] uppercase font-bold text-slate-500 tracking-wider">
              <div className="col-span-1">QTY</div>
              <div className="col-span-5">CARD NAME</div>
              <div className="col-span-4">TYPE</div>
              <div className="col-span-2 text-right">MANA</div>
            </div>

            {/* Scrollable rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
              {filteredCollection.length === 0 ? (
                <div className="py-24 text-center text-slate-600 font-sans italic">
                  No cards in your Storage Box meet these parameters. Scan a physical card above to populate!
                </div>
              ) : (
                filteredCollection.map((item) => (
                  <div 
                    key={item.card.id} 
                    className="grid grid-cols-12 gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer items-center"
                  >
                    {/* Qty count control triggers */}
                    <div className="col-span-1 flex items-center gap-1 text-slate-400 font-bold">
                      <button 
                        onClick={() => onUpdateCollectionQty(item.card.id, -1)}
                        className="hover:text-white px-1"
                      >
                        -
                      </button>
                      <span className="text-slate-200 text-xs">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateCollectionQty(item.card.id, 1)}
                        className="hover:text-white px-1"
                      >
                        +
                      </button>
                    </div>

                    <div className="col-span-5 font-sans font-bold text-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => onSelectCardDetails(item.card)}
                        className="hover:text-orange-400 text-left truncate text-xs"
                      >
                        {item.card.name}
                      </button>
                      <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-1 py-0.2 rounded uppercase font-mono">
                        {item.card.rarity?.substring(0, 3)}
                      </span>
                    </div>

                    {/* Card type immediately to left of mana color */}
                    <div className="col-span-4 text-slate-400 italic text-[11px] font-sans truncate">
                      {item.card.type_line}
                    </div>

                    {/* Mana Color Icon at rightmost side of the row */}
                    <div className="col-span-2 flex justify-end gap-0.5">
                      {item.card.colors && item.card.colors.length > 0 ? (
                        item.card.colors.map(col => (
                          <span 
                            key={col} 
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border ${
                              col === "R" ? "bg-red-600 text-red-100 border-red-400" :
                              col === "U" ? "bg-blue-600 text-blue-100 border-blue-400" :
                              col === "B" ? "bg-purple-950 text-purple-200 border-purple-800" :
                              col === "G" ? "bg-green-600 text-green-100 border-green-400" :
                              "bg-slate-100 text-slate-800 border-slate-300"
                            }`}
                          >
                            {col}
                          </span>
                        ))
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-600 flex items-center justify-center text-[8px] border border-slate-400 text-slate-200 font-bold">
                          C
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW BY DECK COMPONENT */}
        {activeSubTab === "by-deck" && (
          <div className="p-4 space-y-4">
            {savedDecks.length === 0 ? (
              <div className="py-24 text-center text-slate-600 font-sans italic">
                No active decks saved. Create your first build in the "Deck Builder" page!
              </div>
            ) : (
              savedDecks.map((deck) => {
                const isExpanded = expandedDecks[deck.id];
                return (
                  <div key={deck.id} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
                    <button
                      onClick={() => toggleDeckCollapse(deck.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-orange-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                        <span className="font-bold text-slate-200 font-sans">{deck.name}</span>
                        <span className="px-2 py-0.5 bg-slate-800 text-[9px] text-slate-400 rounded-full">
                          {deck.format.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {deck.cards.reduce((sum, c) => sum + c.count, 0)} cards
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-800/80 bg-slate-950/80">
                        {/* Collapsed table lists */}
                        <div className="grid grid-cols-12 gap-2 px-4 py-1.5 bg-[#0D1014] text-[8px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-850">
                          <div className="col-span-1">QTY</div>
                          <div className="col-span-6">CARD NAME</div>
                          <div className="col-span-3">TYPE</div>
                          <div className="col-span-2 text-right">MANA</div>
                        </div>

                        {deck.cards.length === 0 ? (
                          <div className="p-4 text-center text-slate-600 font-sans italic">
                            No cards in this deck list.
                          </div>
                        ) : (
                          deck.cards.map((dc) => (
                            <div 
                              key={dc.card.id} 
                              className="grid grid-cols-12 gap-2 px-4 py-1.5 items-center hover:bg-slate-900 border-b border-slate-900/60 font-mono text-[11px]"
                            >
                              <div className="col-span-1 text-slate-400 font-bold">
                                {dc.count}
                              </div>
                              <div className="col-span-6 text-slate-200 font-bold font-sans">
                                <button
                                  onClick={() => onSelectCardDetails(dc.card)}
                                  className="hover:text-orange-400 text-left truncate"
                                >
                                  {dc.card.name}
                                </button>
                              </div>
                              <div className="col-span-3 text-slate-400 truncate italic font-sans">
                                {dc.card.type_line}
                              </div>
                              <div className="col-span-2 flex justify-end gap-0.5">
                                {dc.card.colors && dc.card.colors.length > 0 ? (
                                  dc.card.colors.map(col => (
                                    <span 
                                      key={col} 
                                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold border ${
                                        col === "R" ? "bg-red-600 text-red-100 border-red-400" :
                                        col === "U" ? "bg-blue-600 text-blue-100 border-blue-400" :
                                        col === "B" ? "bg-purple-950 text-purple-200 border-purple-800" :
                                        col === "G" ? "bg-green-600 text-green-100 border-green-400" :
                                        "bg-slate-100 text-slate-800 border-slate-300"
                                      }`}
                                    >
                                      {col}
                                    </span>
                                  ))
                                ) : (
                                  <span className="w-3.5 h-3.5 rounded-full bg-slate-600 flex items-center justify-center text-[7px] border border-slate-400 text-slate-200 font-bold">
                                    C
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
