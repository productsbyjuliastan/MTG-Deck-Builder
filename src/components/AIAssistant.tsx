import React, { useState } from "react";
import { 
  Send, Sparkles, Check, Archive, Plus, Trash2, Shield, Heart, 
  HelpCircle, MessageSquare, BadgeAlert, Coins, RefreshCw, Layers 
} from "lucide-react";
import { Deck, StorageBoxCard, MTGCard } from "../types";
import { getCardDetails } from "../lib/scryfall";

interface Message {
  role: "user" | "assistant";
  text: string;
  recommendations?: Array<{
    cardName: string;
    role: string;
    status: "in-deck" | "owned" | "not-owned";
    reason: string;
  }>;
}

interface AIAssistantProps {
  deck: Deck;
  collection: StorageBoxCard[];
  onAddCard: (card: MTGCard, target: "storage" | "deck" | "wishlist" | "trade", qty: number) => void;
}

export default function AIAssistant({
  deck,
  collection,
  onAddCard
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Greetings, Planeswalker! I am your AI Deckbuilding Advisor. I am fully synchronized with your current deck configuration and Storage Box. Tell me, how can I improve your build today? Try some of the quick analysis templates below!",
      recommendations: [
        {
          cardName: "Sol Ring",
          role: "Ramp / Acceleration",
          status: "owned",
          reason: "An essential commander staple. It's in your Storage Box right now but missing in this deck! Highly recommended."
        },
        {
          cardName: "Skirk Prospector",
          role: "Mana Accelerator / Sacrifice Outlet",
          status: "owned",
          reason: "Excellent synergy if you want a Goblin tribal engine. Allows you to sacrifice goblins for red mana."
        }
      ]
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Send message to server route
  async function sendMessage(textToSend: string) {
    if (!textToSend.trim() || isSending) return;

    // Add user message to state
    const userMsg: Message = { role: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({ role: m.role, text: m.text })),
          deck: deck.cards.map(c => ({ name: c.card.name, count: c.count })),
          format: deck.format,
          commander: deck.commander,
          storageBox: collection.map(c => ({ name: c.card.name, quantity: c.quantity }))
        })
      });

      if (!response.ok) {
        throw new Error("Could not fetch assistant response. Verify GEMINI_API_KEY is active.");
      }

      const data = await response.json();
      const assistantMsg: Message = {
        role: "assistant",
        text: data.text || "I apologize, I encountered an issue analyzing this query.",
        recommendations: data.recommendations || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ Analysis Error: ${err.message || "Failed to communicate with the Gemini API. Please make sure secrets are configured correctly."}`
        }
      ]);
    } finally {
      setIsSending(false);
    }
  }

  // Quick Action template prompt trigger
  function handleTemplatePrompt(prompt: string) {
    sendMessage(prompt);
  }

  // Handle addition of recommended card
  async function handleAddRecommended(cardName: string, target: "deck" | "wishlist") {
    try {
      // Fetch card from Scryfall using standard helper
      const card = await getCardDetails("", cardName);
      if (!card) {
        throw new Error("Failed to resolve card details.");
      }

      onAddCard(card, target, 1);
      alert(`Added 1x ${cardName} to ${target === "deck" ? "Current Deck" : "Wishlist"}!`);
    } catch (err) {
      console.error(err);
      // Fallback
      onAddCard({
        id: cardName.toLowerCase().replace(/\s+/g, "-"),
        name: cardName,
        type_line: "Card",
        rarity: "common",
        colors: []
      }, target, 1);
    }
  }

  return (
    <div className="bg-[#0A0C10] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[700px] font-sans">
      
      {/* Title bar */}
      <div className="px-4 py-3 bg-[#0F1115] border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-slate-300">Commander Tactics Advisor</span>
        </div>
        <button 
          onClick={() => setMessages(prev => [prev[0]])}
          className="text-[10px] text-slate-500 hover:text-slate-200 uppercase font-mono font-bold"
        >
          Reset Chat
        </button>
      </div>

      {/* Main chat window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
            
            {/* Avatar */}
            <div className={`w-7 h-7 rounded shrink-0 flex items-center justify-center font-bold text-[10px] uppercase font-mono ${m.role === "user" ? "bg-slate-700 text-slate-200" : "bg-orange-600 text-white shadow"}`}>
              {m.role === "user" ? "U" : "AI"}
            </div>

            {/* Bubble */}
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border text-xs leading-relaxed ${m.role === "user" ? "bg-[#1A1D23] border-slate-700 text-slate-200" : "bg-[#14171C] border-slate-800 text-slate-300"}`}>
                {m.text}
              </div>

              {/* Recommendations cards */}
              {m.recommendations && m.recommendations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {m.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="bg-slate-950 border border-slate-850 rounded p-2.5 flex flex-col justify-between text-xs font-mono">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1 font-sans">
                          <span className="font-bold text-slate-200 truncate">{rec.cardName}</span>
                          
                          {/* Status icons mapping */}
                          {rec.status === "in-deck" && (
                            <span className="text-[9px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 rounded flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> IN DECK
                            </span>
                          )}
                          {rec.status === "owned" && (
                            <span className="text-[9px] text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-1.5 rounded flex items-center gap-0.5">
                              <Archive className="w-2.5 h-2.5" /> OWNED
                            </span>
                          )}
                          {rec.status === "not-owned" && (
                            <span className="text-[9px] text-amber-500 bg-amber-950/60 border border-amber-800/50 px-1.5 rounded flex items-center gap-0.5">
                              <Plus className="w-2.5 h-2.5" /> NOT OWNED
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 block uppercase tracking-wider mb-1.5 font-bold">{rec.role}</span>
                        <p className="text-slate-400 text-[10px] leading-relaxed font-sans italic">"{rec.reason}"</p>
                      </div>

                      {/* Interactive addition buttons */}
                      <div className="mt-3 pt-2 border-t border-slate-900 flex gap-1 font-sans">
                        {rec.status === "owned" && (
                          <button
                            onClick={() => handleAddRecommended(rec.cardName, "deck")}
                            className="flex-1 py-1 bg-indigo-900/65 hover:bg-indigo-900 border border-indigo-700/80 rounded text-[9px] font-bold text-indigo-300 transition-colors"
                          >
                            + ADD TO DECK
                          </button>
                        )}
                        {rec.status === "not-owned" && (
                          <button
                            onClick={() => handleAddRecommended(rec.cardName, "wishlist")}
                            className="flex-1 py-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-800/50 rounded text-[9px] font-bold text-amber-400 transition-colors"
                          >
                            + WISHLIST
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ))}

        {isSending && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-7 h-7 rounded bg-orange-600 text-white shrink-0 flex items-center justify-center font-bold text-[10px]">AI</div>
            <div className="bg-[#14171C] border border-slate-800 p-3 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[10px] text-slate-500 font-mono pl-1">Consulting Magic heuristics...</span>
            </div>
          </div>
        )}
      </div>

      {/* QUICK TEMPLATE CHIPS BAR */}
      <div className="px-4 py-2 bg-[#0D1014] border-t border-slate-850 flex gap-2 overflow-x-auto no-scrollbar shrink-0 text-[10px] font-mono">
        <button
          onClick={() => handleTemplatePrompt("How can I make this deck faster? Recommend cards I already own.")}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded border border-slate-800 shrink-0"
        >
          ⚡ MAKE FASTER (OWNED)
        </button>
        <button
          onClick={() => handleTemplatePrompt("Suggest budget replacements for missing commander staples.")}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded border border-slate-800 shrink-0"
        >
          💰 BUDGET STAPLES
        </button>
        <button
          onClick={() => handleTemplatePrompt("I need more interaction. Recommend removals & board wipes.")}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded border border-slate-800 shrink-0"
        >
          ⚔️ ADD REMOVAL
        </button>
        <button
          onClick={() => handleTemplatePrompt("How can I improve my mana base curve? Only owned lands.")}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded border border-slate-800 shrink-0"
        >
          💎 FIX MANA BASE
        </button>
      </div>

      {/* Chat inputs footer */}
      <div className="p-3 bg-[#0F1115] border-t border-slate-800 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask AI about synergies, removals, or collection updates..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
            disabled={isSending}
            className="w-full bg-[#14171C] border border-slate-700 rounded-md py-2 px-3 pr-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 disabled:opacity-50 font-mono"
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={isSending || !inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-400 disabled:text-slate-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
