import React from "react";
import { Trash2, Heart, RefreshCw, Plus, Minus, DollarSign, CheckSquare, Coins } from "lucide-react";
import { WishlistItem, TradeListItem, MTGCard } from "../types";

interface WishlistManagerProps {
  wishlist: WishlistItem[];
  tradelist: TradeListItem[];
  onUpdateWishlistQty: (cardId: string, quantity: number) => void;
  onUpdateTradelistQty: (cardId: string, quantity: number) => void;
  onRemoveFromWishlist: (cardId: string) => void;
  onRemoveFromTradelist: (cardId: string) => void;
  onSelectCardDetails: (card: MTGCard) => void;
  onAddCard: (card: MTGCard, target: "storage" | "deck" | "wishlist" | "trade", qty: number) => void;
}

export default function WishlistManager({
  wishlist,
  tradelist,
  onUpdateWishlistQty,
  onUpdateTradelistQty,
  onRemoveFromWishlist,
  onRemoveFromTradelist,
  onSelectCardDetails,
  onAddCard
}: WishlistManagerProps) {

  // Sum estimated wishlist & tradelist value
  const totalWishlistVal = wishlist.reduce((sum, item) => {
    const priceStr = item.card.prices?.usd || "0.25";
    const price = parseFloat(priceStr) || 0;
    return sum + (price * item.quantity);
  }, 0).toFixed(2);

  const totalTradelistVal = tradelist.reduce((sum, item) => {
    const priceStr = item.card.prices?.usd || "0.25";
    const price = parseFloat(priceStr) || 0;
    return sum + (price * item.quantity);
  }, 0).toFixed(2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* WISHLIST PANEL */}
      <div className="bg-[#0A0C10] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px] font-mono text-xs">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            <span className="font-sans font-bold text-slate-200">Deckbuilder's Wishlist</span>
          </div>
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-0.5">
            Est: ${totalWishlistVal}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-850 p-2">
          {wishlist.length === 0 ? (
            <div className="py-24 text-center text-slate-600 font-sans italic">
              Wishlist is currently empty. Ask the AI Companion or search and add unowned cards!
            </div>
          ) : (
            wishlist.map((item) => (
              <div key={item.card.id} className="p-2.5 hover:bg-slate-900/50 flex justify-between items-center rounded transition-colors">
                <div>
                  <button
                    onClick={() => onSelectCardDetails(item.card)}
                    className="font-sans font-bold text-slate-100 hover:text-orange-400 text-left block text-xs"
                  >
                    {item.card.name}
                  </button>
                  <span className="text-[9px] text-slate-500 block truncate max-w-[180px]">{item.card.type_line}</span>
                  <span className="text-[10px] text-amber-500 font-bold block mt-0.5">${item.card.prices?.usd || "0.25"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-900/60 rounded px-1 border border-slate-800">
                    <button
                      onClick={() => onUpdateWishlistQty(item.card.id, -1)}
                      className="p-1 text-slate-500 hover:text-slate-300 font-bold text-[11px]"
                    >
                      -
                    </button>
                    <span className="px-2 font-bold text-slate-200 font-mono text-[11px]">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateWishlistQty(item.card.id, 1)}
                      className="p-1 text-slate-500 hover:text-slate-300 font-bold text-[11px]"
                    >
                      +
                    </button>
                  </div>

                  {/* Complete acquisition button */}
                  <button
                    onClick={() => {
                      onAddCard(item.card, "storage", item.quantity);
                      onRemoveFromWishlist(item.card.id);
                    }}
                    className="p-1.5 bg-indigo-950/40 hover:bg-indigo-900 border border-indigo-800/50 text-indigo-300 rounded"
                    title="Transfer bought card directly to storage box collection"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRemoveFromWishlist(item.card.id)}
                    className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* TRADING LIST PANEL */}
      <div className="bg-[#0A0C10] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px] font-mono text-xs">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-400" />
            <span className="font-sans font-bold text-slate-200">Binder Trading List</span>
          </div>
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-0.5">
            Binder Est: ${totalTradelistVal}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-850 p-2">
          {tradelist.length === 0 ? (
            <div className="py-24 text-center text-slate-600 font-sans italic">
              Trading ledger has no cards right now. Mark owned cards to sell or exchange!
            </div>
          ) : (
            tradelist.map((item) => (
              <div key={item.card.id} className="p-2.5 hover:bg-slate-900/50 flex justify-between items-center rounded transition-colors">
                <div>
                  <button
                    onClick={() => onSelectCardDetails(item.card)}
                    className="font-sans font-bold text-slate-100 hover:text-orange-400 text-left block text-xs"
                  >
                    {item.card.name}
                  </button>
                  <span className="text-[9px] text-slate-500 block truncate max-w-[180px]">{item.card.type_line}</span>
                  <span className="text-[10px] text-amber-500 font-bold block mt-0.5">${item.card.prices?.usd || "0.25"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-900/60 rounded px-1 border border-slate-800">
                    <button
                      onClick={() => onUpdateTradelistQty(item.card.id, -1)}
                      className="p-1 text-slate-500 hover:text-slate-300 font-bold text-[11px]"
                    >
                      -
                    </button>
                    <span className="px-2 font-bold text-slate-200 font-mono text-[11px]">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateTradelistQty(item.card.id, 1)}
                      className="p-1 text-slate-500 hover:text-slate-300 font-bold text-[11px]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveFromTradelist(item.card.id)}
                    className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
