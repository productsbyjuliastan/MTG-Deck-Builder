import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, ShieldCheck, AlertTriangle, Sparkles, SlidersHorizontal, 
  BarChart2, FileText, Download, Upload, Copy, Layers, ListFilter, HelpCircle, Tags, ChevronRight, Save, Clock
} from "lucide-react";
import { 
  Deck, DeckCard, MTGCard, MTG_FORMATS, FormatDefinition, AIAnalysisResult 
} from "../types";
import { searchCards } from "../lib/scryfall";

interface DeckBuilderProps {
  deck: Deck;
  storageBox: MTGCard[];
  onUpdateDeck: (updatedDeck: Deck) => void;
  onSelectCardDetails: (card: MTGCard) => void;
}

export default function DeckBuilder({
  deck,
  storageBox,
  onUpdateDeck,
  onSelectCardDetails
}: DeckBuilderProps) {
  const [activeTab, setActiveTab] = useState<"cards" | "summary" | "ai" | "versions">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MTGCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCompatibilityView, setIsCompatibilityView] = useState(false);
  
  // Filters
  const [filterType, setFilterType] = useState("All");
  const [filterColor, setFilterColor] = useState("All");
  const [filterTag, setFilterTag] = useState("All");
  const [sortBy, setSortBy] = useState("Name");

  // Version history & Import/Export
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionNote, setVersionNote] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");

  // AI analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Search commanders or cards
  const [commanderSearchQuery, setCommanderSearchQuery] = useState("");
  const [commanderResults, setCommanderResults] = useState<MTGCard[]>([]);
  const [isSearchingCommander, setIsSearchingCommander] = useState(false);

  // Search card list
  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await searchCards(searchQuery);
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }

  // Search commander list
  async function handleCommanderSearch() {
    if (!commanderSearchQuery.trim()) return;
    setIsSearchingCommander(true);
    try {
      // Find legendary cards
      const res = await searchCards(`t:legendary t:creature ${commanderSearchQuery}`);
      setCommanderResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingCommander(false);
    }
  }

  // Update format
  function handleFormatChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const formatName = e.target.value;
    onUpdateDeck({
      ...deck,
      format: formatName,
      commander: null, // clear commander on format change
      last_modified: new Date().toISOString()
    });
  }

  // Set Commander
  function setCommander(card: MTGCard) {
    onUpdateDeck({
      ...deck,
      commander: card,
      last_modified: new Date().toISOString()
    });
    setCommanderResults([]);
    setCommanderSearchQuery("");
  }

  // Add Card
  function addCardToDeck(card: MTGCard, count = 1) {
    const existingIndex = deck.cards.findIndex(dc => dc.card.id === card.id);
    let updatedCards = [...deck.cards];

    if (existingIndex > -1) {
      updatedCards[existingIndex] = {
        ...updatedCards[existingIndex],
        count: updatedCards[existingIndex].count + count
      };
    } else {
      updatedCards.push({ card, count, tags: [] });
    }

    onUpdateDeck({
      ...deck,
      cards: updatedCards,
      last_modified: new Date().toISOString()
    });
  }

  // Remove Card
  function removeCardFromDeck(cardId: string) {
    const updatedCards = deck.cards.filter(dc => dc.card.id !== cardId);
    onUpdateDeck({
      ...deck,
      cards: updatedCards,
      last_modified: new Date().toISOString()
    });
  }

  // Change quantity
  function updateCardQty(cardId: string, delta: number) {
    const existingIndex = deck.cards.findIndex(dc => dc.card.id === cardId);
    if (existingIndex === -1) return;

    let updatedCards = [...deck.cards];
    const newCount = updatedCards[existingIndex].count + delta;

    if (newCount <= 0) {
      updatedCards.splice(existingIndex, 1);
    } else {
      updatedCards[existingIndex] = {
        ...updatedCards[existingIndex],
        count: newCount
      };
    }

    onUpdateDeck({
      ...deck,
      cards: updatedCards,
      last_modified: new Date().toISOString()
    });
  }

  // Edit Card tag
  function toggleCardTag(cardId: string, tag: string) {
    const existingIndex = deck.cards.findIndex(dc => dc.card.id === cardId);
    if (existingIndex === -1) return;

    let updatedCards = [...deck.cards];
    let tags = updatedCards[existingIndex].tags || [];
    if (tags.includes(tag)) {
      tags = tags.filter(t => t !== tag);
    } else {
      tags = [...tags, tag];
    }

    updatedCards[existingIndex] = {
      ...updatedCards[existingIndex],
      tags
    };

    onUpdateDeck({
      ...deck,
      cards: updatedCards,
      last_modified: new Date().toISOString()
    });
  }

  // Trigger server-side AI deck analysis
  async function triggerAiAnalysis() {
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const response = await fetch("/api/gemini/analyze-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckName: deck.name,
          format: deck.format,
          commander: deck.commander,
          cards: deck.cards.map(c => ({
            name: c.card.name,
            count: c.count,
            type_line: c.card.type_line,
            colors: c.card.colors
          })),
          storageBox: storageBox.map(c => ({
            name: c.name
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Server analysis failed. Make sure your GEMINI_API_KEY is configured.");
      }

      const data: AIAnalysisResult = await response.json();
      setAiAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Could not analyze deck. Please configure your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Save current version
  function saveCurrentVersion() {
    const currentVersion = deck.versionHistory ? deck.versionHistory.length + 1 : 1;
    const newVersion = {
      version: currentVersion,
      timestamp: new Date().toISOString(),
      cards: [...deck.cards],
      commander: deck.commander,
      notes: versionNote || `Saved backup version ${currentVersion}`
    };

    const updatedHistory = deck.versionHistory ? [...deck.versionHistory, newVersion] : [newVersion];
    onUpdateDeck({
      ...deck,
      versionHistory: updatedHistory,
      last_modified: new Date().toISOString()
    });
    setVersionNote("");
    setIsVersionModalOpen(false);
  }

  // Restore version
  function restoreVersion(versionNum: number) {
    const version = deck.versionHistory?.find(v => v.version === versionNum);
    if (!version) return;

    onUpdateDeck({
      ...deck,
      cards: version.cards,
      commander: version.commander,
      last_modified: new Date().toISOString()
    });
  }

  // Export Deck
  function exportDeck(format: "text" | "csv" | "json") {
    let content = "";
    if (format === "text") {
      if (deck.commander) content += `// Commander\n1 ${deck.commander.name}\n\n`;
      content += deck.cards.map(c => `${c.count} ${c.card.name}`).join("\n");
    } else if (format === "csv") {
      content = "Quantity,Name,Type,CMC,Rarity\n";
      if (deck.commander) content += `1,"${deck.commander.name} (Commander)","${deck.commander.type_line}",${deck.commander.cmc || 0},"${deck.commander.rarity}"\n`;
      deck.cards.forEach(c => {
        content += `${c.count},"${c.card.name}","${c.card.type_line}",${c.card.cmc || 0},"${c.card.rarity}"\n`;
      });
    } else {
      content = JSON.stringify(deck, null, 2);
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${deck.name.replace(/\s+/g, "_")}_decklist.${format === "json" ? "json" : format === "csv" ? "csv" : "txt"}`;
    link.click();
  }

  // Import Deck
  async function handleImport() {
    if (!importText.trim()) return;
    setIsImportModalOpen(false);

    const lines = importText.split("\n");
    const importedCards: DeckCard[] = [];
    let detectedCommander: MTGCard | null = null;

    for (const line of lines) {
      const match = line.trim().match(/^(\d+)\x20+(.+)$/);
      if (match) {
        const qty = parseInt(match[1], 10);
        const name = match[2].trim();
        try {
          const results = await searchCards(name);
          if (results.length > 0) {
            const card = results[0];
            if (line.toLowerCase().includes("commander") || line.toLowerCase().includes("// commander")) {
              detectedCommander = card;
            } else {
              importedCards.push({ card, count: qty, tags: [] });
            }
          }
        } catch (err) {
          console.error("Could not find card during import:", name, err);
        }
      }
    }

    onUpdateDeck({
      ...deck,
      cards: [...deck.cards, ...importedCards],
      commander: detectedCommander || deck.commander,
      last_modified: new Date().toISOString()
    });
    setImportText("");
  }

  // Legalities analysis
  function analyzeLegality() {
    const warnings: string[] = [];
    const formatDef = MTG_FORMATS[deck.format];
    const totalCards = deck.cards.reduce((sum, c) => sum + c.count, 0) + (deck.commander ? 1 : 0);

    // Deck size
    if (deck.format === "Commander") {
      if (totalCards !== 100) warnings.push(`Commander deck size must be exactly 100 cards. Current: ${totalCards}.`);
      if (!deck.commander) warnings.push("Missing Commander! Legality rules require a Legendary Commander.");
    } else if (deck.format === "Oathbreaker") {
      if (totalCards !== 60) warnings.push(`Oathbreaker deck size must be exactly 60 cards. Current: ${totalCards}.`);
    } else {
      if (totalCards < 60) warnings.push(`Standard formats require a minimum of 60 cards. Current: ${totalCards}.`);
    }

    // Singleton vs 4-of
    deck.cards.forEach(dc => {
      const isBasicLand = dc.card.type_line?.toLowerCase().includes("basic land");
      if (!isBasicLand) {
        if (deck.format === "Commander" || deck.format === "Oathbreaker" || deck.format === "Brawl") {
          if (dc.count > 1) warnings.push(`Singleton restriction violation: Multiple copies of ${dc.card.name} are illegal in ${deck.format}.`);
        } else {
          if (dc.count > 4) warnings.push(`Standard restriction violation: ${dc.card.name} cannot exceed 4 copies.`);
        }
      }
    });

    // Commander color identity rule checks
    if (deck.commander) {
      const commColors = deck.commander.color_identity || deck.commander.colors || [];
      deck.cards.forEach(dc => {
        const cardColors = dc.card.colors || [];
        const isOut = cardColors.some(c => !commColors.includes(c));
        if (isOut) {
          warnings.push(`Color Identity Warning: ${dc.card.name} contains colors outside your commander's identity (${commColors.join(", ") || "Colorless"}).`);
        }
      });
    }

    return warnings;
  }

  const legalityWarnings = analyzeLegality();

  // Statistics summaries
  const totalCards = deck.cards.reduce((sum, c) => sum + c.count, 0) + (deck.commander ? 1 : 0);
  const landCount = deck.cards.filter(c => c.card.type_line?.toLowerCase().includes("land")).reduce((sum, c) => sum + c.count, 0);
  const creatureCount = deck.cards.filter(c => c.card.type_line?.toLowerCase().includes("creature")).reduce((sum, c) => sum + c.count, 0);
  const instantCount = deck.cards.filter(c => c.card.type_line?.toLowerCase().includes("instant")).reduce((sum, c) => sum + c.count, 0);
  const sorceryCount = deck.cards.filter(c => c.card.type_line?.toLowerCase().includes("sorcery")).reduce((sum, c) => sum + c.count, 0);
  const artifactCount = deck.cards.filter(c => c.card.type_line?.toLowerCase().includes("artifact") && !c.card.type_line?.toLowerCase().includes("creature")).reduce((sum, c) => sum + c.count, 0);
  const enchantmentCount = deck.cards.filter(c => c.card.type_line?.toLowerCase().includes("enchantment") && !c.card.type_line?.toLowerCase().includes("creature")).reduce((sum, c) => sum + c.count, 0);
  const planeswalkerCount = deck.cards.filter(c => c.card.type_line?.toLowerCase().includes("planeswalker")).reduce((sum, c) => sum + c.count, 0);

  // Mana values (excluding lands)
  const nonLands = deck.cards.filter(c => !c.card.type_line?.toLowerCase().includes("land"));
  const averageManaValue = nonLands.length > 0
    ? (nonLands.reduce((sum, c) => sum + ((c.card.cmc || 0) * c.count), 0) / nonLands.reduce((sum, c) => sum + c.count, 0)).toFixed(2)
    : "0";

  // Build Mana curve arrays
  const manaCurve = [0, 0, 0, 0, 0, 0, 0]; // 0 to 6+
  nonLands.forEach(c => {
    const cmcVal = c.card.cmc || 0;
    const index = Math.min(6, Math.floor(cmcVal));
    manaCurve[index] += c.count;
  });

  // Filter and sort active cards
  const filteredCards = deck.cards.filter(dc => {
    const matchesType = filterType === "All" || dc.card.type_line?.toLowerCase().includes(filterType.toLowerCase());
    const matchesColor = filterColor === "All" || (dc.card.colors || []).includes(filterColor);
    const matchesTag = filterTag === "All" || (dc.tags || []).includes(filterTag);
    return matchesType && matchesColor && matchesTag;
  }).sort((a, b) => {
    if (sortBy === "Name") return a.card.name.localeCompare(b.card.name);
    if (sortBy === "CMC") return (a.card.cmc || 0) - (b.card.cmc || 0);
    if (sortBy === "Rarity") return (a.card.rarity || "").localeCompare(b.card.rarity || "");
    return 0;
  });

  const selectedFormatDef = MTG_FORMATS[deck.format] || MTG_FORMATS["Commander"];

  return (
    <div className="bg-[#0A0C10] text-[#E0E0E0] rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[700px]">
      
      {/* Top Header of the Deckbuilder */}
      <header className="h-16 border-b border-slate-800 bg-[#0F1115] px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={deck.name}
            onChange={(e) => onUpdateDeck({ ...deck, name: e.target.value, last_modified: new Date().toISOString() })}
            className="text-lg font-bold text-slate-100 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-orange-500 focus:outline-none py-0.5 px-1 rounded transition-colors w-48"
          />
          <select
            value={deck.format}
            onChange={handleFormatChange}
            className="bg-slate-800/80 border border-slate-700 text-slate-300 text-xs rounded px-2.5 py-1 font-mono focus:outline-none focus:border-orange-500"
          >
            {Object.keys(MTG_FORMATS).map(fmt => (
              <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
            ))}
          </select>

          {deck.commander && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 italic">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"></span>
              {deck.commander.name}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Action buttons */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors"
            title="Import Decklist"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={() => exportDeck("text")}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors"
            title="Export as Text"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsVersionModalOpen(true)}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors"
            title="Save version snapshot"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Primary tab controllers */}
      <div className="flex border-b border-slate-800 bg-[#0D1014] px-4 justify-between items-center text-xs">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("cards")}
            className={`py-3 px-2 font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === "cards" ? "border-orange-500 text-orange-500" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            Card List
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`py-3 px-2 font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === "summary" ? "border-orange-500 text-orange-500" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            Deck Summary & Charts
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-3 px-2 font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === "ai" ? "border-orange-500 text-orange-500" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            AI Commander Diagnostics
          </button>
          <button
            onClick={() => setActiveTab("versions")}
            className={`py-3 px-2 font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === "versions" ? "border-orange-500 text-orange-500" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            Versions ({deck.versionHistory?.length || 0})
          </button>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          {totalCards} / {deck.format === "Commander" ? "100" : deck.format === "Oathbreaker" ? "60" : "60+"} cards
        </div>
      </div>

      {/* Main interactive grid based on chosen tab */}
      <div className="flex-1 overflow-hidden grid grid-cols-12">
        
        {/* Tab 1: CARD LIST VIEW */}
        {activeTab === "cards" && (
          <>
            {/* Left Col: Filters & Scrollable rows */}
            <div className="col-span-12 lg:col-span-8 flex flex-col border-r border-slate-800">
              
              {/* Header sorting & filters */}
              <div className="p-3 bg-[#0B0D11] border-b border-slate-800 flex flex-wrap gap-3 items-center justify-between text-xs">
                <div className="flex flex-wrap gap-2 items-center">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
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

                  <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5"
                  >
                    <option value="All">All Roles / Tags</option>
                    <option value="Ramp">Ramp</option>
                    <option value="Removal">Removal</option>
                    <option value="Card Draw">Card Draw</option>
                    <option value="Board Wipe">Board Wipe</option>
                    <option value="Tutor">Tutor</option>
                    <option value="Win Condition">Win Condition</option>
                    <option value="Combo Piece">Combo Piece</option>
                  </select>
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setIsCompatibilityView(!isCompatibilityView)}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold tracking-wider transition-colors border ${isCompatibilityView ? "bg-orange-600/15 border-orange-500 text-orange-400" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"}`}
                  >
                    COMPATIBILITY HIGHLIGHTS
                  </button>
                </div>
              </div>

              {/* Table header list */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-slate-850 bg-[#0A0C10] text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                <div className="col-span-1">QTY</div>
                <div className="col-span-5">CARD NAME</div>
                <div className="col-span-3">TYPE / ROLE</div>
                <div className="col-span-3 text-right">MANA</div>
              </div>

              {/* Active rows */}
              <div className="flex-1 overflow-y-auto font-mono text-sm divide-y divide-slate-850">
                {filteredCards.length === 0 ? (
                  <div className="py-24 text-center text-slate-600 font-sans italic">
                    No cards matching the filters are in the deck. Add cards from the search bar or collection.
                  </div>
                ) : (
                  filteredCards.map((dc) => {
                    // Check compatibility
                    const isCommanderColorIdentityMatch = deck.commander ? 
                      !(dc.card.colors || []).some(c => !(deck.commander?.color_identity || []).includes(c)) : true;
                    
                    let rowBg = "hover:bg-slate-900/40";
                    if (isCompatibilityView) {
                      if (!isCommanderColorIdentityMatch) {
                        rowBg = "bg-rose-950/20 hover:bg-rose-900/10 border-l-2 border-rose-500";
                      } else if (dc.card.name === "Sol Ring" || dc.card.name === "Command Tower" || dc.card.type_line?.toLowerCase().includes("goblin") && deck.commander?.name.includes("Krenko")) {
                        rowBg = "bg-emerald-950/20 hover:bg-emerald-900/10 border-l-2 border-emerald-500";
                      } else {
                        rowBg = "bg-amber-950/10 hover:bg-amber-900/10 border-l-2 border-amber-500";
                      }
                    }

                    return (
                      <div 
                        key={dc.card.id} 
                        className={`grid grid-cols-12 gap-2 px-4 py-1.5 items-center transition-colors ${rowBg}`}
                      >
                        <div className="col-span-1 flex items-center gap-1.5">
                          <button
                            onClick={() => updateCardQty(dc.card.id, -1)}
                            className="text-slate-600 hover:text-slate-300 font-bold"
                          >
                            -
                          </button>
                          <span className="text-slate-300 font-bold font-mono text-xs">{dc.count}</span>
                          <button
                            onClick={() => updateCardQty(dc.card.id, 1)}
                            className="text-slate-600 hover:text-slate-300 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <div className="col-span-5 flex flex-col justify-center">
                          <button
                            onClick={() => onSelectCardDetails(dc.card)}
                            className="text-left font-sans font-bold text-slate-200 hover:text-orange-400 transition-colors truncate text-xs"
                          >
                            {dc.card.name}
                          </button>
                          {/* Display role tags */}
                          <div className="flex gap-1 flex-wrap mt-0.5">
                            {dc.tags?.map(t => (
                              <span key={t} className="text-[7px] bg-slate-900 border border-slate-800 text-indigo-400 px-1 py-0.2 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="col-span-3 flex flex-col justify-center font-sans">
                          <span className="text-[10px] text-slate-400 italic truncate">{dc.card.type_line}</span>
                          {/* Tag selector popup style */}
                          <div className="flex gap-1.5 mt-0.5">
                            {["Ramp", "Removal", "Card Draw"].map(role => {
                              const hasTag = dc.tags?.includes(role);
                              return (
                                <button
                                  key={role}
                                  onClick={() => toggleCardTag(dc.card.id, role)}
                                  className={`text-[7px] font-semibold border px-1 rounded ${hasTag ? "bg-indigo-950 text-indigo-300 border-indigo-700" : "bg-transparent text-slate-600 border-slate-800 hover:border-slate-700"}`}
                                >
                                  {role.split(" ")[0]}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="col-span-3 flex items-center justify-end gap-1.5 font-sans">
                          {/* Color indicator dot */}
                          <div className="flex gap-0.5">
                            {dc.card.colors?.map(col => (
                              <span key={col} className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] border font-bold ${
                                col === "R" ? "bg-red-600/40 text-red-200 border-red-500/50" :
                                col === "U" ? "bg-blue-600/40 text-blue-200 border-blue-500/50" :
                                col === "B" ? "bg-purple-950/60 text-purple-200 border-purple-800/50" :
                                col === "G" ? "bg-green-600/40 text-green-200 border-green-500/50" :
                                "bg-amber-100 text-slate-800 border-amber-300"
                              }`}>
                                {col}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono w-6 text-right">
                            {dc.card.mana_cost || "—"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Col: Instant Card Searching Panel */}
            <div className="col-span-12 lg:col-span-4 bg-[#0A0C10] p-4 flex flex-col justify-between overflow-y-auto border-t lg:border-t-0 border-slate-800">
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1">Add Cards Instantly</h3>
                  <p className="text-[11px] text-slate-500 font-sans">Search the entire Scryfall database catalog or select a custom Commander.</p>
                </div>

                {/* Search forms */}
                <div className="space-y-3">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="e.g. Goblin, Black Lotus, Sol Ring..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 bg-[#111419] border border-slate-800 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 rounded flex items-center gap-1 transition-colors"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </div>

                  {/* Search commander field */}
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Set Deck Commander</span>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Search Legendary..."
                        value={commanderSearchQuery}
                        onChange={(e) => setCommanderSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCommanderSearch()}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                      />
                      <button
                        onClick={handleCommanderSearch}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs px-2.5 rounded font-bold"
                      >
                        Set
                      </button>
                    </div>

                    {commanderResults.length > 0 && (
                      <div className="max-h-24 overflow-y-auto border border-slate-800 rounded bg-slate-950 p-1 divide-y divide-slate-900">
                        {commanderResults.map(c => (
                          <button
                            key={c.id}
                            onClick={() => setCommander(c)}
                            className="w-full text-left text-xs p-1 hover:bg-slate-900 text-slate-300 flex justify-between items-center"
                          >
                            <span>{c.name}</span>
                            <span className="text-[9px] text-indigo-400 font-mono">Select</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Instant results listing */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {searchResults.map(card => (
                    <div key={card.id} className="bg-slate-950 border border-slate-850 p-2 rounded flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-200 block truncate max-w-[160px]">{card.name}</span>
                        <span className="text-[9px] text-slate-500 italic block truncate max-w-[160px]">{card.type_line}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => addCardToDeck(card, 1)}
                          className="px-2 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded text-[10px] font-bold"
                        >
                          + Deck
                        </button>
                        <button
                          onClick={() => onSelectCardDetails(card)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded text-[10px]"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Format Definition Overview Box */}
              <div className="bg-[#111419] p-3 rounded-lg border border-slate-850 text-[10px] mt-4">
                <span className="text-orange-500 font-bold uppercase tracking-wider block mb-1">
                  Format Details: {selectedFormatDef.name}
                </span>
                <p className="text-slate-400 leading-relaxed font-sans mb-1.5">{selectedFormatDef.description}</p>
                <div className="space-y-1 font-mono text-slate-500 text-[9px]">
                  <div>• GAMEPLAY STYLE: {selectedFormatDef.gameplayStyle}</div>
                  <div>• DECK SIZE: {selectedFormatDef.deckSizeRequirement}</div>
                  <div>• COPIES PER CARD: {selectedFormatDef.copiesAllowed}</div>
                  {selectedFormatDef.commanderRules && (
                    <div className="text-indigo-400">• COMMANDER RULE: {selectedFormatDef.commanderRules}</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: SUMMARY & STATS & CHARTS */}
        {activeTab === "summary" && (
          <div className="col-span-12 p-6 overflow-y-auto space-y-6">
            
            {/* Upper stats widgets row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Deck Cards</span>
                <span className="text-2xl font-light text-slate-100 block mt-1">{totalCards}</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Lands / Non-lands</span>
                <span className="text-2xl font-light text-slate-100 block mt-1">{landCount} / {totalCards - landCount}</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Average Mana Value</span>
                <span className="text-2xl font-light text-orange-400 block mt-1">{averageManaValue}</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Commander Identity</span>
                <span className="text-xl font-semibold text-indigo-400 block mt-1">
                  {deck.commander ? (deck.commander.color_identity || []).join(", ") || "Colorless" : "None"}
                </span>
              </div>
            </div>

            {/* Legality Warnings Pane */}
            <div className="bg-[#111419] p-4 rounded-lg border border-slate-850">
              <h3 className="text-xs font-bold uppercase text-slate-300 tracking-widest mb-3 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Deck Legality & Diagnostics Checks
              </h3>
              {legalityWarnings.length === 0 ? (
                <div className="text-xs text-emerald-400 font-sans flex items-center gap-2">
                  ✓ Your deck meets all legality parameters and requirements for the {deck.format} format. Ready for competitive standard play!
                </div>
              ) : (
                <ul className="space-y-1.5 text-xs text-rose-400 font-sans">
                  {legalityWarnings.map((warn, index) => (
                    <li key={index} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-rose-500 font-bold shrink-0">!</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Type Distribution Checklist */}
              <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Card Type Breakdown</h3>
                <div className="space-y-3 font-mono text-[11px]">
                  {[
                    { label: "Lands", count: landCount, recommended: "35–38" },
                    { label: "Creatures", count: creatureCount, recommended: "25–35" },
                    { label: "Instants", count: instantCount, recommended: "6–10" },
                    { label: "Sorceries", count: sorceryCount, recommended: "6–10" },
                    { label: "Artifacts", count: artifactCount, recommended: "10–14" },
                    { label: "Enchantments", count: enchantmentCount, recommended: "4–8" },
                    { label: "Planeswalkers", count: planeswalkerCount, recommended: "0–3" }
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-300">{row.label}</span>
                        <span className="text-[9px] text-slate-500 font-sans">Target: {row.recommended}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-200 font-bold text-xs">{row.count}</span>
                        <span className="text-slate-500"> / {totalCards || 100}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mana Curve Visual Bar Chart */}
              <div className="bg-[#0A0C10] p-4 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Mana Curve Distribution</h3>
                  <p className="text-[11px] text-slate-500 font-sans mb-4">Visualizes quantity density comparing average conversion casting costs.</p>
                </div>

                <div className="flex items-end gap-2 h-44 px-2">
                  {manaCurve.map((count, index) => {
                    const maxVal = Math.max(...manaCurve, 1);
                    const pct = (count / maxVal) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 mb-1 font-mono font-bold">{count}</span>
                        <div 
                          style={{ height: `${Math.max(4, pct)}%` }}
                          className="w-full bg-orange-600/60 border border-orange-500/50 rounded-t shadow-[0_0_12px_rgba(234,88,12,0.15)] hover:bg-orange-500 transition-colors cursor-pointer"
                          title={`${count} cards at CMC ${index}`}
                        ></div>
                        <span className="text-[10px] text-slate-500 font-mono mt-1.5">{index === 6 ? "6+" : index}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI DIAGNOSTICS & SYNERGIES */}
        {activeTab === "ai" && (
          <div className="col-span-12 p-6 overflow-y-auto space-y-6">
            <div className="bg-gradient-to-br from-orange-950/10 via-slate-900 to-indigo-950/10 p-5 rounded-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  AI Commander Compatibility Diagnostic Engine
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Trigger a fully comprehensive deep neural analysis of your active deck list, checking known combos, commander staples, and estimated power levels.
                </p>
              </div>

              <button
                onClick={triggerAiAnalysis}
                disabled={isAnalyzing}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900/40 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(234,88,12,0.3)] shrink-0"
              >
                {isAnalyzing ? "Triggering AI Analysis..." : "Execute Deck Diagnostics"}
              </button>
            </div>

            {isAnalyzing && (
              <div className="py-24 text-center space-y-3 font-sans">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-300 font-semibold animate-pulse text-xs">Analyzing commander synergy, mana base ratios, and game finishers...</p>
              </div>
            )}

            {aiError && (
              <div className="p-4 bg-rose-950/20 rounded-lg border border-rose-900/30 text-rose-300 font-sans text-xs">
                {aiError}
              </div>
            )}

            {aiAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in font-sans">
                {/* Power Level & Win Conditions */}
                <div className="space-y-6">
                  {/* Power Level */}
                  <div className="bg-[#111419] p-4 rounded-lg border border-slate-850 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Estimated Power Rating</span>
                      <span className="text-xl font-mono font-bold text-orange-500">{aiAnalysis.powerLevel?.score} / 10</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed italic">
                      "{aiAnalysis.powerLevel?.explanation}"
                    </p>
                  </div>

                  {/* Win Conditions */}
                  <div className="bg-[#111419] p-4 rounded-lg border border-slate-850">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-3 border-b border-slate-800 pb-2">
                      Identified Win Conditions
                    </h4>
                    <div className="space-y-3">
                      {aiAnalysis.winConditions?.map((win, idx) => (
                        <div key={idx} className="text-xs bg-slate-950 p-3 rounded border border-slate-900">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-200">{win.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${win.viability === "high" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50" : "bg-amber-950 text-amber-400 border border-amber-800/50"}`}>
                              {win.viability.toUpperCase()} VIABILITY
                            </span>
                          </div>
                          <p className="text-slate-400 leading-relaxed text-[11px]">{win.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Combos & Mana Base diagnostics */}
                <div className="space-y-6">
                  {/* Combos */}
                  <div className="bg-[#111419] p-4 rounded-lg border border-slate-850">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-3 border-b border-slate-800 pb-2">
                      Active / Potential Combos
                    </h4>
                    <div className="space-y-3">
                      {aiAnalysis.combos?.map((combo, idx) => (
                        <div key={idx} className="text-xs bg-slate-950 p-3 rounded border border-slate-900">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-200">{combo.name}</span>
                            {combo.isInfinite && (
                              <span className="text-[9px] bg-indigo-950 border border-indigo-800 text-indigo-300 px-1.5 py-0.2 rounded font-mono uppercase">
                                INFINITE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mb-1.5">Cards: {combo.cards.join(" + ")}</p>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{combo.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mana Base assessment */}
                  <div className="bg-[#111419] p-4 rounded-lg border border-slate-850 text-xs">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-3 border-b border-slate-800 pb-2">
                      Mana Base Analysis
                    </h4>
                    <p className="text-slate-300 leading-relaxed italic">"{aiAnalysis.manaBase?.assessment}"</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-950 p-2 rounded">
                        <span className="text-slate-500 uppercase font-bold block">Ramp Spells</span>
                        <span className="text-slate-200 font-bold">{aiAnalysis.manaBase?.rampCount}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded">
                        <span className="text-slate-500 uppercase font-bold block">Color Fixing</span>
                        <span className="text-slate-200 font-bold">{aiAnalysis.manaBase?.fixingCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: DECK VERSION HISTORY */}
        {activeTab === "versions" && (
          <div className="col-span-12 p-6 overflow-y-auto space-y-4 font-mono text-xs">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2 mb-4">
              Version History Snapshots
            </h3>

            {!deck.versionHistory || deck.versionHistory.length === 0 ? (
              <div className="py-24 text-center text-slate-600 font-sans italic">
                No previous version history saved. Click the "Save" icon in the top header to capture a snapshot of your current build.
              </div>
            ) : (
              <div className="space-y-3">
                {deck.versionHistory.map((ver) => (
                  <div key={ver.version} className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-indigo-900/40 text-indigo-200 px-2 py-0.5 rounded border border-indigo-800">
                          v{ver.version}
                        </span>
                        <span className="text-slate-500 font-sans">
                          {new Date(ver.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300 font-sans text-xs mt-1.5 italic">
                        "{ver.notes}"
                      </p>
                      <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                        Contains {ver.cards.reduce((sum, c) => sum + c.count, 0)} cards.
                      </span>
                    </div>

                    <div className="flex gap-2 font-sans">
                      <button
                        onClick={() => restoreVersion(ver.version)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-xs"
                      >
                        Restore Version
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Save Version Snapshot */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0A0C10] border border-slate-800 p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Save Current Deck Version</h3>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase">Version Note / Changelog</label>
              <textarea
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="e.g. Added Goblin Warchief, removed land card"
                className="w-full bg-[#111419] border border-slate-800 rounded p-2 text-xs focus:outline-none focus:border-orange-500 h-24"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsVersionModalOpen(false)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentVersion}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Import Decklist */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0A0C10] border border-slate-800 p-6 rounded-xl w-full max-w-lg space-y-4 font-sans">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Import MTG Decklist</h3>
              <p className="text-[11px] text-slate-500 mt-1">Paste card list in plain text format. We will match cards with Scryfall automatically.</p>
            </div>
            <div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="e.g.&#10;1 Sol Ring&#10;1 Krenko, Mob Boss // Commander&#10;4 Llanowar Elves"
                className="w-full bg-[#111419] border border-slate-800 rounded p-2 text-xs font-mono focus:outline-none focus:border-orange-500 h-44"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
