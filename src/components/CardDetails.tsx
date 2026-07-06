import React from "react";
import { X, Check, CheckSquare, Plus, AlertTriangle, ShieldCheck, Heart, Award, Info, DollarSign, RefreshCw } from "lucide-react";
import { MTGCard } from "../types";

interface CardDetailsProps {
  card: MTGCard;
  onClose: () => void;
  commander: MTGCard | null;
  ownedQty: number;
  qtyInDeck: number;
  onAddCard: (card: MTGCard, target: "storage" | "deck" | "wishlist" | "trade", qty: number) => void;
}

export default function CardDetails({
  card,
  onClose,
  commander,
  ownedQty,
  qtyInDeck,
  onAddCard
}: CardDetailsProps) {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setIsFlipped(false);
    setImageError(false);
  }, [card.id]);

  React.useEffect(() => {
    setImageError(false);
  }, [isFlipped]);

  const hasFaces = !!(card.card_faces && card.card_faces.length >= 2);
  const currentFace = hasFaces ? (isFlipped ? card.card_faces![1] : card.card_faces![0]) : null;

  const displayedImage = currentFace?.image_uris?.large || 
                         currentFace?.image_uris?.normal || 
                         currentFace?.image_uris?.small || 
                         currentFace?.image_uris?.png || 
                         card.image_uris?.large || 
                         card.image_uris?.normal || 
                         card.image_uris?.small || 
                         card.image_uris?.png;

  const displayedName = currentFace?.name || card.name;
  const displayedType = currentFace?.type_line || card.type_line;
  const displayedManaCost = currentFace?.mana_cost !== undefined ? currentFace.mana_cost : card.mana_cost;
  const displayedOracle = currentFace?.oracle_text !== undefined ? currentFace.oracle_text : card.oracle_text;
  const displayedFlavor = currentFace?.flavor_text !== undefined ? currentFace.flavor_text : card.flavor_text;
  const displayedPower = currentFace?.power || (hasFaces ? undefined : card.power);
  const displayedToughness = currentFace?.toughness || (hasFaces ? undefined : card.toughness);
  const displayedLoyalty = currentFace?.loyalty || (hasFaces ? undefined : card.loyalty);

  // Determine compatibility with the current commander
  function getCompatibility() {
    if (!commander) return { rating: "None", text: "Select a Commander in the Deck Builder to analyze compatibility." };

    const cardColors = card.colors || [];
    const commColors = commander.color_identity || commander.colors || [];
    
    // Color identity check
    const isOut = cardColors.some(c => !commColors.includes(c));
    if (isOut) {
      return {
        rating: "Red" as const,
        text: `Off-Color Identity! This card contains colors (${cardColors.join(", ")}) not supported by your Commander's color identity (${commColors.join(", ")}). It is illegal in this Commander deck.`
      };
    }

    const typeLower = card.type_line.toLowerCase();
    const oracleLower = (card.oracle_text || "").toLowerCase();
    const commNameLower = commander.name.toLowerCase();

    // Check high compatibility heuristics
    if (
      oracleLower.includes(commNameLower) ||
      (typeLower.includes("goblin") && commander.name.includes("Krenko")) ||
      (typeLower.includes("enchantment") && commander.name.includes("Sythis")) ||
      (oracleLower.includes("proliferate") && commander.name.includes("Atraxa")) ||
      (card.name === "Sol Ring" || card.name === "Command Tower" || card.name === "Arcane Signet")
    ) {
      return {
        rating: "Green" as const,
        text: "Exceptional Synergy! This card is either a direct synergy piece, a format staple, or perfectly aligns with your Commander's static abilities and creature types."
      };
    }

    // Moderate compatibility checks
    if (
      (typeLower.includes("creature") && typeLower.includes("legendary")) ||
      card.cmc && card.cmc <= 2 ||
      oracleLower.includes("draw") ||
      oracleLower.includes("destroy") ||
      oracleLower.includes("exile")
    ) {
      return {
        rating: "Orange" as const,
        text: "Good Utility. Fits the deck's interactive shell as removal, recursion, or critical early-game acceleration."
      };
    }

    return {
      rating: "None" as const,
      text: "Neutral Compatibility. Safe filler card, but does not trigger specific synergistic engines with this Commander."
    };
  }

  const compatibility = getCompatibility();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        id="card-details-modal"
        className="bg-[#0A0C10] border border-slate-800 rounded-xl overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Side: Card Visual Art */}
        <div className="md:w-1/2 bg-[#0F1115] p-6 flex flex-col items-center justify-center border-r border-slate-800 relative">
          {displayedImage && !imageError ? (
            <img
              src={displayedImage}
              alt={displayedName}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className="w-full max-w-[280px] rounded-2xl shadow-xl border border-slate-700/50 transform hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="w-[280px] aspect-[3/4] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-center shadow-inner">
              <span className="text-xl font-bold text-slate-400 mb-2">{displayedName}</span>
              <span className="text-xs text-slate-600 font-mono italic">{displayedType}</span>
              <span className="text-xs text-slate-500 mt-4">Art Crop/Image Offline</span>
            </div>
          )}

          {hasFaces && (
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="mt-4 px-4 py-1.5 bg-orange-650 hover:bg-orange-600 text-white border border-orange-500/30 rounded-lg text-xs font-bold font-sans flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Flip to {isFlipped ? "Front" : "Back"} Face
            </button>
          )}

          <div className="mt-4 flex gap-3 text-xs w-full max-w-[280px]">
            <div className="flex-1 bg-slate-900/60 p-2.5 rounded border border-slate-850 text-center">
              <span className="block text-[10px] uppercase font-semibold text-slate-500">In Storage</span>
              <span className="text-base font-mono font-bold text-indigo-400">{ownedQty}x</span>
            </div>
            <div className="flex-1 bg-slate-900/60 p-2.5 rounded border border-slate-850 text-center">
              <span className="block text-[10px] uppercase font-semibold text-slate-500">In Active Deck</span>
              <span className="text-base font-mono font-bold text-orange-400">{qtyInDeck}x</span>
            </div>
          </div>
        </div>

        {/* Right Side: Card Information Panel */}
        <div className="flex-1 flex flex-col overflow-y-auto max-h-[95vh] md:max-h-none">
          {/* Header */}
          <div className="p-6 border-b border-slate-850 flex justify-between items-start bg-[#0D1014]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-slate-800/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {card.rarity?.toUpperCase()}
                </span>
                {displayedManaCost && (
                  <span className="text-sm font-mono font-bold text-slate-400">
                    {displayedManaCost}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">{displayedName}</h2>
              <p className="text-xs text-slate-400 font-medium italic">{displayedType}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Details Content */}
          <div className="p-6 space-y-6 flex-1">
            {/* Rules Text & Flavor */}
            <div className="space-y-4">
              {displayedOracle && (
                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-850 font-mono text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                  {displayedOracle}
                </div>
              )}
              {displayedFlavor && (
                <p className="text-[11px] text-slate-500 italic pl-3 border-l-2 border-indigo-500/30">
                  "{displayedFlavor}"
                </p>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#111419] p-3 rounded border border-slate-850">
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Mana Value (CMC)</span>
                <span className="text-slate-200 font-bold text-sm font-mono">{card.cmc ?? 0}</span>
              </div>
              {(displayedPower || displayedToughness) && (
                <div className="bg-[#111419] p-3 rounded border border-slate-850">
                  <span className="text-slate-500 block uppercase font-semibold text-[10px]">Power / Toughness</span>
                  <span className="text-slate-200 font-bold text-sm font-mono">{displayedPower}/{displayedToughness}</span>
                </div>
              )}
              {displayedLoyalty && (
                <div className="bg-[#111419] p-3 rounded border border-slate-850">
                  <span className="text-slate-500 block uppercase font-semibold text-[10px]">Starting Loyalty</span>
                  <span className="text-slate-200 font-bold text-sm font-mono">{displayedLoyalty}</span>
                </div>
              )}
              {card.defense && (
                <div className="bg-[#111419] p-3 rounded border border-slate-850">
                  <span className="text-slate-500 block uppercase font-semibold text-[10px]">Defense (Battle)</span>
                  <span className="text-slate-200 font-bold text-sm font-mono">{card.defense}</span>
                </div>
              )}
              <div className="bg-[#111419] p-3 rounded border border-slate-850">
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Set / Rarity</span>
                <span className="text-slate-200 font-semibold truncate block">{card.set_name || card.set?.toUpperCase() || "N/A"}</span>
              </div>
              <div className="bg-[#111419] p-3 rounded border border-slate-850">
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Artist</span>
                <span className="text-slate-300 truncate block">{card.artist || "Unknown"}</span>
              </div>
              <div className="bg-[#111419] p-3 rounded border border-slate-850">
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Est. USD Price</span>
                <span className="text-amber-500 font-bold font-mono text-sm flex items-center gap-0.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  {card.prices?.usd || "0.25"}
                </span>
              </div>
            </div>

            {/* Commander Compatibility Section */}
            <div className="bg-[#0A0D11] border border-slate-800 rounded-lg p-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                Commander Synergy Analysis
              </h4>
              <div className="flex gap-4 items-start">
                {compatibility.rating === "Green" && (
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 mt-1 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                )}
                {compatibility.rating === "Orange" && (
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0 mt-1 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                )}
                {compatibility.rating === "Red" && (
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shrink-0 mt-1 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                )}
                {compatibility.rating === "None" && (
                  <div className="w-2.5 h-2.5 bg-slate-600 rounded-full shrink-0 mt-1"></div>
                )}
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Rating: {compatibility.rating === "None" ? "Neutral/Filler" : `${compatibility.rating} Level Synergy`}
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    {compatibility.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Format Legality Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Format Legalities</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["commander", "standard", "modern", "legacy"].map((f) => {
                  const legal = card.legalities?.[f] === "legal";
                  return (
                    <div key={f} className="bg-slate-900/60 p-2.5 rounded border border-slate-850 flex flex-col gap-1.5 text-[10px] min-w-0">
                      <span className="capitalize text-slate-400 font-medium truncate">{f}</span>
                      {legal ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> LEGAL
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> BANNED
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="p-4 bg-[#0A0C10] border-t border-slate-850 flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => onAddCard(card, "storage", 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              Add to Storage Box (+1)
            </button>

            {commander && (
              <button
                onClick={() => onAddCard(card, "deck", 1)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add to Current Deck
              </button>
            )}

            <button
              onClick={() => onAddCard(card, "wishlist", 1)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/20 rounded font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Heart className="w-4 h-4 fill-amber-400/20" />
              Add to Wishlist
            </button>

            <button
              onClick={() => onAddCard(card, "trade", 1)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Info className="w-4 h-4" />
              Add to Trade List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
