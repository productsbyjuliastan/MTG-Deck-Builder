import React, { useState, useEffect } from "react";
import { Play, RotateCcw, HelpCircle, LayoutGrid, Calendar, ChevronRight, BarChart4, Hash, Percent } from "lucide-react";
import { DeckCard, MTGCard } from "../types";

interface PlaytesterProps {
  cards: DeckCard[];
}

export default function Playtester({ cards }: PlaytesterProps) {
  const [deckList, setDeckList] = useState<MTGCard[]>([]);
  const [library, setLibrary] = useState<MTGCard[]>([]);
  const [hand, setHand] = useState<MTGCard[]>([]);
  const [battlefield, setBattlefield] = useState<MTGCard[]>([]);
  const [graveyard, setGraveyard] = useState<MTGCard[]>([]);
  const [mulliganCount, setMulliganCount] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [calcTargetType, setCalcTargetType] = useState("Land");
  const [calcTurnNum, setCalcTurnNum] = useState(5);
  const [calculatedProbability, setCalculatedProbability] = useState<number | null>(null);

  // Initialize and shuffle deck list
  useEffect(() => {
    resetSimulator();
  }, [cards]);

  function resetSimulator() {
    // Flatten cards based on count
    const flatList: MTGCard[] = [];
    cards.forEach(dc => {
      for (let i = 0; i < dc.count; i++) {
        flatList.push({ ...dc.card });
      }
    });

    setDeckList(flatList);
    const shuffled = shuffle([...flatList]);
    setLibrary(shuffled.slice(7));
    setHand(shuffled.slice(0, 7));
    setBattlefield([]);
    setGraveyard([]);
    setMulliganCount(0);
    setCurrentTurn(1);
  }

  function shuffle(array: MTGCard[]) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  function handleMulligan() {
    const nextMulligan = mulliganCount + 1;
    if (nextMulligan > 7) return;

    setMulliganCount(nextMulligan);
    const shuffled = shuffle([...deckList]);
    const handSize = 7 - nextMulligan;
    
    setHand(shuffled.slice(0, handSize));
    setLibrary(shuffled.slice(handSize));
    setBattlefield([]);
    setGraveyard([]);
    setCurrentTurn(1);
  }

  function drawCard() {
    if (library.length === 0) return;
    const [nextCard, ...remainingLibrary] = library;
    setHand([...hand, nextCard]);
    setLibrary(remainingLibrary);
  }

  function playToBattlefield(index: number) {
    const card = hand[index];
    const newHand = [...hand];
    newHand.splice(index, 1);
    setHand(newHand);
    setBattlefield([...battlefield, card]);
  }

  function discardToGraveyard(index: number) {
    const card = hand[index];
    const newHand = [...hand];
    newHand.splice(index, 1);
    setHand(newHand);
    setGraveyard([...graveyard, card]);
  }

  function passTurn() {
    setCurrentTurn(currentTurn + 1);
    drawCard();
  }

  // Helper: Hypergeometric Distribution formula
  // Population Size (N), Successes in Population (K), Sample Size (n), Successes in Sample (k)
  function combination(n: number, r: number): number {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    let result = 1;
    for (let i = 1; i <= r; i++) {
      result = result * (n - r + i) / i;
    }
    return result;
  }

  function hypergeometric(N: number, K: number, n: number, k: number): number {
    return (combination(K, k) * combination(N - K, n - k)) / combination(N, n);
  }

  // Calculate cumulative probability of drawing AT LEAST min_successes
  function calculateCumulativeProb(N: number, K: number, n: number, min_successes: number): number {
    let total = 0;
    for (let i = min_successes; i <= Math.min(n, K); i++) {
      total += hypergeometric(N, K, n, i);
    }
    return Math.min(100, Math.max(0, total * 100));
  }

  function triggerCalculation() {
    if (deckList.length === 0) {
      setCalculatedProbability(0);
      return;
    }

    const totalCards = deckList.length;
    let targetCountInDeck = 0;

    // Detect target based on type or name matches
    if (calcTargetType === "Land") {
      targetCountInDeck = deckList.filter(c => c.type_line?.toLowerCase().includes("land")).length;
    } else if (calcTargetType === "Ramp") {
      targetCountInDeck = deckList.filter(c => 
        c.oracle_text?.toLowerCase().includes("add") || 
        c.oracle_text?.toLowerCase().includes("search") && c.oracle_text?.toLowerCase().includes("land")
      ).length || 8; // default heuristic if empty
    } else if (calcTargetType === "Removal") {
      targetCountInDeck = deckList.filter(c => 
        c.oracle_text?.toLowerCase().includes("destroy") || 
        c.oracle_text?.toLowerCase().includes("exile") ||
        c.oracle_text?.toLowerCase().includes("damage to target")
      ).length || 6;
    } else {
      // Specific key card check (e.g. Sol Ring)
      targetCountInDeck = deckList.filter(c => c.name.toLowerCase().includes(calcTargetType.toLowerCase())).length;
      if (targetCountInDeck === 0) targetCountInDeck = 1; // assume single copy if not found for custom simulation
    }

    // Number of cards drawn by turn X (opening 7 + turn draws)
    const cardsDrawn = 7 + (calcTurnNum - 1);
    
    // Chance of drawing at least 1 copy
    const prob = calculateCumulativeProb(totalCards, targetCountInDeck, cardsDrawn, 1);
    setCalculatedProbability(parseFloat(prob.toFixed(1)));
  }

  useEffect(() => {
    triggerCalculation();
  }, [calcTargetType, calcTurnNum, deckList]);

  return (
    <div className="bg-[#0A0C10] border border-slate-800 rounded-lg overflow-hidden flex flex-col font-mono text-xs">
      
      {/* Top HUD */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-sans font-bold text-slate-200">Playtest Arena</span>
          <span className="px-2 py-0.5 bg-indigo-900/40 text-indigo-200 text-[10px] rounded border border-indigo-800">
            TURN {currentTurn}
          </span>
          <span className="text-slate-500 text-[11px] font-mono">
            Library: {library.length} • Battlefield: {battlefield.length} • Grave: {graveyard.length}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={passTurn}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
          >
            Pass Turn <ChevronRight className="w-3 h-3" />
          </button>
          <button
            onClick={handleMulligan}
            disabled={mulliganCount >= 6}
            className="px-3 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded text-[11px] font-semibold flex items-center gap-1 disabled:opacity-45 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Mulligan ({7 - mulliganCount - 1} left)
          </button>
          <button
            onClick={resetSimulator}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold transition-colors"
          >
            Reset Board
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[540px]">
        {/* Left / Middle: Active Simulator Tabletop */}
        <div className="lg:col-span-8 p-4 bg-[#0D0F13] flex flex-col justify-between overflow-y-auto">
          
          {/* Battlefield Area */}
          <div className="space-y-2 mb-4">
            <div className="text-[9px] uppercase font-bold text-slate-500 tracking-widest border-b border-slate-800/80 pb-1">
              Battlefield ({battlefield.length})
            </div>
            {battlefield.length === 0 ? (
              <div className="h-28 border-2 border-dashed border-slate-900 rounded-lg flex items-center justify-center text-slate-600 italic">
                No permanents in play. Click a card in your hand to play it!
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {battlefield.map((card, i) => (
                  <div key={i} className="bg-slate-900 p-2 rounded border border-indigo-950/40 text-center animate-fade-in relative group">
                    <span className="block font-sans font-semibold text-slate-200 truncate">{card.name}</span>
                    <span className="text-[9px] text-slate-500 truncate block">{card.type_line}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Hand */}
          <div className="space-y-2 mt-auto">
            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-800/80 pb-1 flex justify-between">
              <span>Your Hand ({hand.length} cards)</span>
              <button onClick={drawCard} className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline">
                [ + DRAW CARD ]
              </button>
            </div>
            {hand.length === 0 ? (
              <div className="py-8 text-center text-slate-500 italic">
                Hand is empty. Click "+ DRAW CARD" or pass turn to draw.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {hand.map((card, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded p-2 flex flex-col justify-between h-28 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer group">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-sans font-bold text-slate-100 truncate block leading-tight">{card.name}</span>
                        {card.mana_cost && <span className="text-[8px] text-slate-400 font-mono shrink-0">{card.mana_cost}</span>}
                      </div>
                      <span className="text-[9px] text-slate-500 block italic leading-tight truncate mt-0.5">{card.type_line}</span>
                    </div>

                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => playToBattlefield(i)}
                        className="flex-1 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded text-[9px] font-bold"
                      >
                        Play
                      </button>
                      <button
                        onClick={() => discardToGraveyard(i)}
                        className="px-1.5 py-1 bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-300 rounded text-[9px]"
                      >
                        Trash
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Hypergeometric Statistical Calculator */}
        <div className="lg:col-span-4 bg-[#0A0C10] border-l border-slate-800 p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-[10px] uppercase font-bold text-orange-500 tracking-wider mb-1 flex items-center gap-1">
                <BarChart4 className="w-4 h-4" /> Draw Probability Engine
              </h3>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Estimate drawing probabilities mathematically using exact population metrics in real-time.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-3 bg-[#111419] p-3 rounded border border-slate-850">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase">Target Card Category</label>
                <select
                  value={calcTargetType}
                  onChange={(e) => setCalcTargetType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-[11px]"
                >
                  <option value="Land">Any Land (Land drop efficiency)</option>
                  <option value="Ramp">Ramp / Mana Acceleration</option>
                  <option value="Removal">Interactive Removal Spell</option>
                  <option value="Sol Ring">Sol Ring (Iconic Start)</option>
                  <option value="Krenko">Commander-Specific Tribal Engine</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase">Check Probability by Turn</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={calcTurnNum}
                  onChange={(e) => setCalcTurnNum(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Results Graphic */}
            <div className="bg-gradient-to-br from-indigo-950/20 to-indigo-900/10 p-4 rounded-lg border border-indigo-900/30 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-10">
                <Percent className="w-20 h-20 text-indigo-400" />
              </div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                Chance of Drawing {calcTargetType}
              </span>
              <span className="text-4xl font-extralight text-indigo-300 block my-2">
                {calculatedProbability}%
              </span>
              <span className="text-[10px] text-slate-500 font-sans">
                Computed across {deckList.length} deck cards. Assumes standard random distribution of a fresh shuffle.
              </span>
            </div>
          </div>

          <div className="bg-slate-900/50 p-2.5 rounded border border-slate-850 text-[10px] leading-relaxed text-slate-500 font-sans">
            <b>Hypergeometric Hint:</b> A standard commander deck carries 36-38 lands. This results in an ~82.4% probability of holding at least 2 lands in your opening hand.
          </div>
        </div>
      </div>
    </div>
  );
}
