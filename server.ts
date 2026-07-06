import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK safely
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Helper to check if AI is configured
function getAiClient() {
  if (!ai) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in the Secrets panel.");
  }
  return ai;
}

// API Route: AI-powered deck analysis, compatibility, combos, power level, and win-conditions
app.post("/api/gemini/analyze-deck", async (req, res) => {
  try {
    const { deckName, format, commander, cards, storageBox, customTheme } = req.body;
    const client = getAiClient();

    const prompt = `
You are an expert Magic: The Gathering deck analyzer. Analyze this deck list and provide deep, professional feedback.
Deck Name: ${deckName || "Untitled Deck"}
Format: ${format || "Commander"}
Commander: ${commander ? JSON.stringify(commander) : "None (Not applicable or not selected)"}
Deck Cards:
${(cards || []).map((c: any) => `- ${c.name} (Qty: ${c.count || 1}) - ${c.type_line || "Card"} - Color: ${c.colors?.join(",") || "Colorless"}`).join("\n")}

Storage Box Collection (Cards owned by the user):
${(storageBox || []).slice(0, 100).map((c: any) => `- ${c.name} (Qty: ${c.quantity || 1})`).join("\n")}
${(storageBox || []).length > 100 ? `... and ${(storageBox || []).length - 100} more cards in Storage Box.` : ""}

Theme/Custom Goals: ${customTheme || "General performance and format synergy"}

Analyze this deck and return a JSON response matching the following schema structure:
{
  "powerLevel": {
    "score": number, // 1 to 10 scale
    "explanation": string // why the deck received this score, referencing mana curve, synergy, ramp, speed
  },
  "winConditions": [
    {
      "type": "Combat" | "Combo" | "Alternate" | "Control / Value",
      "name": string, // brief name of win condition
      "description": string, // details of how the deck closes out the game
      "viability": string // high, medium, low
    }
  ],
  "combos": [
    {
      "name": string,
      "cards": string[], // names of cards in this combo
      "description": string, // what the combo does (e.g. infinite mana, infinite tokens, instant win)
      "isInfinite": boolean,
      "allInDeck": boolean,
      "missingButOwned": string[] // any cards in storageBox that can replace or complete it
    }
  ],
  "manaBase": {
    "assessment": string, // general feedback on lands, ramp, and fixing
    "landCount": number,
    "rampCount": number,
    "fixingCount": number,
    "colorSourceBalance": string, // assessment of color sources vs color requirements
    "suggestedLandUpgrades": string[], // recommended land additions
    "suggestedRampUpgrades": string[] // recommended ramp cards
  },
  "commanderStaples": {
    "score": string, // e.g. "12 / 25"
    "included": string[], // staples already in the deck
    "ownedButNotIncluded": string[], // staples in storageBox but not in deck
    "notOwned": string[] // staples not in deck and not owned, with why they help
  },
  "synergyHighlight": [
    {
      "cardName": string,
      "rating": "Green" | "Orange" | "Red" | "None",
      "explanation": string // why the card has great (Green), moderate (Orange), or poor (Red) synergy
    }
  ]
}
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["powerLevel", "winConditions", "combos", "manaBase", "commanderStaples", "synergyHighlight"],
          properties: {
            powerLevel: {
              type: Type.OBJECT,
              required: ["score", "explanation"],
              properties: {
                score: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
            },
            winConditions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["type", "name", "description", "viability"],
                properties: {
                  type: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  viability: { type: Type.STRING },
                },
              },
            },
            combos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "cards", "description", "isInfinite", "allInDeck", "missingButOwned"],
                properties: {
                  name: { type: Type.STRING },
                  cards: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING },
                  isInfinite: { type: Type.BOOLEAN },
                  allInDeck: { type: Type.BOOLEAN },
                  missingButOwned: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
            manaBase: {
              type: Type.OBJECT,
              required: ["assessment", "landCount", "rampCount", "fixingCount", "colorSourceBalance", "suggestedLandUpgrades", "suggestedRampUpgrades"],
              properties: {
                assessment: { type: Type.STRING },
                landCount: { type: Type.INTEGER },
                rampCount: { type: Type.INTEGER },
                fixingCount: { type: Type.INTEGER },
                colorSourceBalance: { type: Type.STRING },
                suggestedLandUpgrades: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedRampUpgrades: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            commanderStaples: {
              type: Type.OBJECT,
              required: ["score", "included", "ownedButNotIncluded", "notOwned"],
              properties: {
                score: { type: Type.STRING },
                included: { type: Type.ARRAY, items: { type: Type.STRING } },
                ownedButNotIncluded: { type: Type.ARRAY, items: { type: Type.STRING } },
                notOwned: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            synergyHighlight: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["cardName", "rating", "explanation"],
                properties: {
                  cardName: { type: Type.STRING },
                  rating: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("AI deck analysis failed:", error);
    res.status(500).json({ error: error.message || "An error occurred during AI analysis." });
  }
});

// API Route: AI Assistant Chat (Collection-Aware Recommendations)
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, deck, format, commander, storageBox } = req.body;
    const client = getAiClient();

    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    }));

    // System instruction to prime the AI assistant for rich MTG collection and deck advice
    const systemInstruction = `
You are an expert Magic: The Gathering deck-building assistant. You help users refine their decks, suggest upgrades, build new archetypes, and analyze commander synergy.
You are fully collection-aware. Keep in mind:
- Current Deck Format: ${format || "Commander"}
- Selected Commander: ${commander ? `${commander.name} (${commander.type_line})` : "None"}
- Current Deck Cards: ${(deck || []).map((c: any) => `${c.name} (${c.count}x)`).join(", ")}
- User's Storage Box (Owned Cards): ${(storageBox || []).map((c: any) => `${c.name} (${c.quantity}x)`).join(", ")}

When the user asks for recommendations, you should suggest:
1. "Owned" cards (cards in the Storage Box that are not currently in the deck, but fit perfectly).
2. "Not Owned" cards (highly synergistic cards they can buy or trade for, ideally with budget alternatives).
3. Replacements (specific cards currently in the deck that should be removed to make room).

To make these suggestions interactive, structure your recommendations as a response that combines a helpful text explanation AND a list of specific card recommendations.

Your final JSON response must strictly match this schema:
{
  "text": string, // markdown formatted main response answering the user's questions, analyzing synergies or removals
  "recommendations": [
    {
      "cardName": string,
      "role": string, // e.g. "Ramp", "Removal", "Card Draw", "Combo Piece", "Finisher", "Mana Fixing"
      "status": "in-deck" | "owned" | "not-owned", // in-deck: already in deck, owned: owned in Storage Box but not in deck, not-owned: not owned
      "reason": string // brief explanation of why this card is perfect for the deck
    }
  ]
}
`;

    // Add system instruction and invoke gemini
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["text", "recommendations"],
          properties: {
            text: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["cardName", "role", "status", "reason"],
                properties: {
                  cardName: { type: Type.STRING },
                  role: { type: Type.STRING },
                  status: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("AI assistant chat failed:", error);
    res.status(500).json({ error: error.message || "An error occurred during chat response." });
  }
});

// Configure Vite middleware and static routes
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MTG Deck Builder Server running on http://localhost:${PORT}`);
  });
}

startServer();
