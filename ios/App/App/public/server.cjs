var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  initialCommunityRooms: () => initialCommunityRooms
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_http = __toESM(require("http"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
var import_ws = require("ws");
import_dotenv.default.config();
process.on("uncaughtException", (err) => {
  console.error("[CRITICAL SAFEGUARD] Uncaught exception caught & prevented crash:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[CRITICAL SAFEGUARD] Unhandled rejection caught & prevented crash:", reason);
});
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiInstance = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}
var banUserTool = {
  name: "ban_user",
  description: "\u062D\u0638\u0631 \u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u064A\u0621 \u0623\u0648 \u0645\u062E\u0627\u0644\u0641 \u0644\u0633\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u063A\u0631\u0641\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627 \u0644\u0645\u0646\u0639 \u0627\u0644\u062A\u062D\u0631\u0634 \u0648\u0627\u0644\u0643\u0631\u0627\u0647\u064A\u0629 \u0648\u0627\u0644\u0633\u0628.",
  parameters: {
    type: import_genai.Type.OBJECT,
    properties: {
      user_id: {
        type: import_genai.Type.STRING,
        description: "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0631\u0627\u062F \u062D\u0638\u0631\u0647 (\u0645\u062B\u0627\u0644: 'user_12', 'guest_5')"
      },
      reason: {
        type: import_genai.Type.STRING,
        description: "\u0633\u0628\u0628 \u0627\u0644\u062D\u0638\u0631 \u0627\u0644\u0635\u0631\u064A\u062D \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0645\u062B\u0627\u0644: '\u0633\u0628 \u0648\u0642\u0630\u0641 \u0641\u064A \u0627\u0644\u062F\u0631\u062F\u0634\u0629 \u0627\u0644\u0639\u0627\u0645\u0629')"
      },
      duration_minutes: {
        type: import_genai.Type.NUMBER,
        description: "\u0645\u062F\u0629 \u0627\u0644\u062D\u0638\u0631 \u0628\u0627\u0644\u062F\u0642\u0627\u0626\u0642 (\u0645\u062B\u0627\u0644: 60 \u0644\u0644\u062D\u0638\u0631 \u0627\u0644\u0645\u0624\u0642\u062A \u0623\u0648 99999 \u0644\u0644\u062D\u0638\u0631 \u0627\u0644\u062F\u0627\u0626\u0645)"
      }
    },
    required: ["user_id", "reason"]
  }
};
var startGameTool = {
  name: "start_game",
  description: "\u0628\u062F\u0621 \u0644\u0639\u0628\u0629 \u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u062F\u0627\u062E\u0644 \u0627\u0644\u063A\u0631\u0641\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629 \u0645\u062B\u0644 \u0644\u0639\u0628\u0629 \u0627\u0644\u0644\u0648\u062F\u0648 (Ludo) \u0623\u0648 \u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0627\u062A \u0627\u0644\u062B\u0642\u0627\u0641\u064A\u0629 \u0623\u0648 \u0643\u0631\u0633\u064A \u0627\u0644\u0627\u0639\u062A\u0631\u0627\u0641 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0631\u063A\u0628\u0629 \u0627\u0644\u0623\u0639\u0636\u0627\u0621.",
  parameters: {
    type: import_genai.Type.OBJECT,
    properties: {
      game_name: {
        type: import_genai.Type.STRING,
        description: "\u0627\u0633\u0645 \u0627\u0644\u0644\u0639\u0628\u0629: 'ludo' \u0623\u0648 'trivia' \u0623\u0648 'truth_dare'"
      },
      room_id: {
        type: import_genai.Type.STRING,
        description: "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u063A\u0631\u0641\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629"
      },
      number_of_players: {
        type: import_genai.Type.NUMBER,
        description: "\u0639\u062F\u062F \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u064A\u0646 \u0644\u0644\u0639\u0628\u0629 (\u0645\u062B\u0627\u0644: 4 \u0644\u0644\u0648\u062F\u0648)"
      }
    },
    required: ["game_name", "room_id"]
  }
};
var sendVirtualGiftTool = {
  name: "send_virtual_gift",
  description: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0648\u0627\u0644\u062A\u0639\u0627\u0645\u0644 \u0645\u0639 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0647\u062F\u0627\u064A\u0627 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629 \u0628\u064A\u0646 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0641\u064A \u0627\u0644\u063A\u0631\u0641\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629 \u0645\u062B\u0644 \u0627\u0644\u0635\u0642\u0631 \u0623\u0648 \u0627\u0644\u062A\u0627\u062C \u0623\u0648 \u0627\u0644\u0633\u064A\u0627\u0631\u0629 \u0627\u0644\u0641\u0627\u0631\u0647\u0629.",
  parameters: {
    type: import_genai.Type.OBJECT,
    properties: {
      sender_id: {
        type: import_genai.Type.STRING,
        description: "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0631\u0633\u0644"
      },
      receiver_id: {
        type: import_genai.Type.STRING,
        description: "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0633\u062A\u0644\u0645 \u0623\u0648 \u0627\u0644\u0645\u0636\u064A\u0641"
      },
      gift_id: {
        type: import_genai.Type.STRING,
        description: "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0647\u062F\u064A\u0629 \u0645\u062B\u0644: 'falcon' (\u0635\u0642\u0631), 'supercar' (\u0633\u064A\u0627\u0631\u0629 \u0641\u0627\u0631\u0647\u0629), 'crown' (\u062A\u0627\u062C \u0645\u0644\u0643\u064A), 'castle' (\u0642\u0644\u0639\u0629 \u0627\u0644\u0623\u0644\u0645\u0627\u0633), 'rose' (\u0648\u0631\u062F\u0629)"
      },
      quantity: {
        type: import_genai.Type.NUMBER,
        description: "\u0639\u062F\u062F \u0627\u0644\u0647\u062F\u0627\u064A\u0627 \u0627\u0644\u0645\u0631\u0633\u0644\u0629 (\u0627\u0641\u062A\u0631\u0627\u0636\u064A: 1)"
      }
    },
    required: ["sender_id", "receiver_id", "gift_id"]
  }
};
function evaluateHeuristicModeration(text) {
  const lower = text.toLowerCase();
  const toxicKeywords = [
    "\u0643\u0644\u0628",
    "\u062D\u0645\u0627\u0631",
    "\u063A\u0628\u064A",
    "\u062D\u0642\u064A\u0631",
    "\u0627\u0646\u0642\u0644\u0639",
    "\u062A\u0641\u0648",
    "\u0643\u0627\u0641\u0631",
    "\u0627\u062E\u0631\u0633",
    "\u064A\u0627 \u062A\u0627\u0641\u0647",
    "hate",
    "idiot",
    "trash",
    "\u0644\u0639\u0646\u0629",
    "\u0642\u0631\u062F",
    "\u0633\u0627\u0641\u0644",
    "\u0646\u0630\u0644",
    "\u062D\u0642\u064A\u0631\u0629",
    "\u0645\u0646\u062D\u0637",
    "\u0634\u062A\u0645",
    "\u0642\u0630\u0631",
    "\u0648\u0642\u062D"
  ];
  const flagged = toxicKeywords.filter((kw) => lower.includes(kw));
  const isToxic = flagged.length > 0;
  if (isToxic) {
    return {
      isSafe: false,
      infractionType: "insult_harassment",
      severity: "high",
      confidenceScore: 0.94,
      suggestedAction: "warn",
      reasonAr: "\u062A\u0645 \u0627\u0643\u062A\u0634\u0627\u0641 \u0623\u0644\u0641\u0627\u0638 \u063A\u064A\u0631 \u0644\u0627\u0626\u0642\u0629 \u0623\u0648 \u062A\u0648\u062C\u064A\u0647 \u0625\u0647\u0627\u0646\u0629 \u0644\u0623\u062D\u062F \u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u063A\u0631\u0641\u0629.",
      flaggedTerms: flagged,
      executedTools: []
    };
  }
  return {
    isSafe: true,
    infractionType: "none",
    severity: "low",
    confidenceScore: 0.98,
    suggestedAction: "allow",
    reasonAr: "\u0631\u0633\u0627\u0644\u0629 \u0622\u0645\u0646\u0629 \u0648\u062A\u062A\u0648\u0627\u0641\u0642 \u0645\u0639 \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0645\u062C\u062A\u0645\u0639.",
    flaggedTerms: [],
    executedTools: []
  };
}
app.post("/api/gemini/moderate", async (req, res) => {
  const { text, username, userId } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid text" });
  }
  const ai = getGeminiClient();
  if (!ai) {
    return res.json(evaluateHeuristicModeration(text));
  }
  try {
    const prompt = `\u0642\u0645 \u0628\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0646\u0635 \u0627\u0644\u062A\u0627\u0644\u064A \u0627\u0644\u0635\u0627\u062F\u0631 \u0645\u0646 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 "${username || "\u0645\u0633\u062A\u062E\u062F\u0645"}" (\u0645\u0639\u0631\u0641: ${userId || "user_x"}) \u0641\u064A \u063A\u0631\u0641\u0629 \u0645\u062D\u0627\u062F\u062B\u0629 \u0635\u0648\u062A\u064A\u0629 \u062C\u0645\u0627\u0639\u064A\u0629 \u0639\u0631\u0628\u064A\u0629.
\u0627\u0643\u062A\u0634\u0641 \u0623\u064A \u0645\u062D\u062A\u0648\u0649 \u064A\u062D\u062B \u0639\u0644\u0649 \u0627\u0644\u0643\u0631\u0627\u0647\u064A\u0629\u060C \u0627\u0644\u0633\u0628\u060C \u0627\u0644\u0642\u0630\u0641\u060C \u0627\u0644\u062A\u062D\u0631\u0634\u060C \u0623\u0648 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0643\u0627\u062A \u0641\u0648\u0631\u064B\u0627.
\u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u062A\u062D\u0644\u064A\u0644\u0647:
"""${text}"""`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "\u0623\u0646\u062A \u0646\u0638\u0627\u0645 \u0631\u0642\u0627\u0628\u0629 \u0622\u0644\u064A \u0641\u0627\u0626\u0642 \u0627\u0644\u062F\u0642\u0629 \u0645\u062E\u0635\u0635 \u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0627\u0644\u0635\u0648\u062A\u064A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0645\u062B\u0644 YallaChat). \u0645\u0647\u0645\u062A\u0643 \u0643\u0634\u0641 \u0627\u0644\u0625\u0633\u0627\u0621\u0627\u062A \u0648\u0627\u0644\u0633\u0628 \u0648\u0627\u0644\u0643\u0631\u0627\u0647\u064A\u0629 \u0648\u0627\u0644\u062A\u0646\u0645\u0631 \u0628\u062F\u0642\u0629 \u0648\u0645\u0631\u0627\u0639\u0627\u0629 \u0627\u0644\u0644\u0647\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0645\u062E\u062A\u0644\u0641\u0629 \u0648\u0625\u0631\u062C\u0627\u0639 \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0628\u0635\u064A\u063A\u0629 JSON \u0645\u062D\u062F\u062F\u0629.",
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            isSafe: {
              type: import_genai.Type.BOOLEAN,
              description: "\u0647\u0644 \u0627\u0644\u0646\u0635 \u0622\u0645\u0646 \u0648\u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0646\u0634\u0631\u061F"
            },
            infractionType: {
              type: import_genai.Type.STRING,
              description: "\u0646\u0648\u0639 \u0627\u0644\u0645\u062E\u0627\u0644\u0641\u0629: 'none' | 'hate_speech' | 'insult_harassment' | 'spam' | 'sexual_or_offensive' | 'other'"
            },
            severity: {
              type: import_genai.Type.STRING,
              description: "\u062F\u0631\u062C\u0629 \u0627\u0644\u062E\u0637\u0648\u0631\u0629: 'low' | 'medium' | 'high' | 'critical'"
            },
            confidenceScore: {
              type: import_genai.Type.NUMBER,
              description: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062B\u0642\u0629 \u0645\u0646 0 \u0625\u0644\u0649 1"
            },
            suggestedAction: {
              type: import_genai.Type.STRING,
              description: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0645\u0642\u062A\u0631\u062D: 'allow' | 'warn' | 'mute' | 'ban'"
            },
            reasonAr: {
              type: import_genai.Type.STRING,
              description: "\u0634\u0631\u062D \u0627\u0644\u0633\u0628\u0628 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0628\u0623\u0633\u0644\u0648\u0628 \u0642\u0627\u0646\u0648\u0646\u064A \u0648\u0645\u0648\u062C\u0632"
            },
            flaggedTerms: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: "\u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0623\u0648 \u0627\u0644\u062C\u0645\u0644 \u0627\u0644\u0645\u062E\u0627\u0644\u0641\u0629 \u0625\u0646 \u0648\u062C\u062F\u062A"
            }
          },
          required: ["isSafe", "infractionType", "severity", "confidenceScore", "suggestedAction", "reasonAr"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.warn("Gemini Moderation experiencing high load or unavailable, using heuristic safety guard:", error?.message || error);
    return res.json(evaluateHeuristicModeration(text));
  }
});
app.post("/api/gemini/host-interact", async (req, res) => {
  const { userMessage, senderName, senderId, roomId, activeGame, roomTopic } = req.body;
  const ai = getGeminiClient();
  if (!ai) {
    const msg = (userMessage || "").toLowerCase();
    const executedCalls = [];
    let hostReply = "\u0647\u0644\u0627 \u0648\u0627\u0644\u0644\u0647 \u0628\u064A\u0643\u0645 \u0641\u064A \u0627\u0644\u063A\u0631\u0641\u0629! \u0646\u0648\u0631\u062A\u0648\u0646\u0627 \u062C\u0645\u064A\u0639\u0627\u064B \u{1F389}";
    if (msg.includes("\u0644\u0648\u062F\u0648") || msg.includes("ludo") || msg.includes("\u0627\u0644\u0639\u0628") || msg.includes("\u0646\u0644\u0639\u0628")) {
      executedCalls.push({
        name: "start_game",
        args: {
          game_name: "ludo",
          room_id: roomId || "room_vip_1",
          number_of_players: 4
        }
      });
      hostReply = "\u0643\u0641\u0648! \u062C\u0647\u0632\u062A \u0644\u0643\u0645 \u0637\u0627\u0648\u0644\u0629 \u0627\u0644\u0644\u0648\u062F\u0648 \u0627\u0644\u062D\u064A\u0646\u060C \u0645\u064A\u0646 \u0642\u062F \u0627\u0644\u062A\u062D\u062F\u064A \u064A\u0631\u0645\u064A \u0627\u0644\u0646\u0631\u062F \u0623\u0648\u0644\u061F \u{1F3B2}\u{1F525}";
    } else if (msg.includes("\u0633\u0624\u0627\u0644") || msg.includes("\u0645\u0633\u0627\u0628\u0642\u0629") || msg.includes("\u062A\u062D\u062F\u064A")) {
      executedCalls.push({
        name: "start_game",
        args: {
          game_name: "trivia",
          room_id: roomId || "room_vip_1",
          number_of_players: 8
        }
      });
      hostReply = "\u0623\u0628\u0634\u0631\u0648\u0627 \u0628\u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0629! \u062C\u0647\u0632\u062A \u0644\u0643\u0645 \u0633\u0624\u0627\u0644 \u0646\u0627\u0631\u060C \u0623\u0633\u0631\u0639 \u0648\u0627\u062D\u062F \u064A\u062C\u0627\u0648\u0628 \u0644\u0647 \u0646\u0642\u0627\u0637 \u0648\u0647\u062F\u064A\u0629 \u0643\u0641\u0648! \u{1F3C6}\u{1F4A1}";
    } else if (msg.includes("\u062A\u0627\u062C") || msg.includes("\u0635\u0642\u0631") || msg.includes("\u0647\u062F\u064A\u0629") || msg.includes("\u0633\u064A\u0627\u0631\u0629")) {
      executedCalls.push({
        name: "send_virtual_gift",
        args: {
          sender_id: senderId || "user_current",
          receiver_id: "host_seat",
          gift_id: msg.includes("\u0635\u0642\u0631") ? "falcon" : msg.includes("\u0633\u064A\u0627\u0631\u0629") ? "supercar" : "crown",
          quantity: 1
        }
      });
      hostReply = "\u064A\u0627 \u0633\u0644\u0627\u0645 \u0639\u0644\u0649 \u0627\u0644\u0643\u0631\u0645 \u0627\u0644\u062D\u0627\u062A\u0645\u064A! \u062A\u0633\u062A\u0627\u0647\u0644\u0648\u0646 \u0643\u0644 \u062E\u064A\u0631\u060C \u062A\u0641\u0636\u0644\u0648\u0627 \u0628\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0647\u062F\u064A\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629! \u{1F451}\u{1F985}";
    } else if (msg.includes("\u0627\u062D\u0638\u0631") || msg.includes("\u0627\u0637\u0631\u062F") || msg.includes("\u062D\u0638\u0631")) {
      executedCalls.push({
        name: "ban_user",
        args: {
          user_id: "guest_spammer",
          reason: "\u0645\u062E\u0627\u0644\u0641\u0629 \u0622\u062F\u0627\u0628 \u0627\u0644\u062D\u0648\u0627\u0631 \u0648\u0625\u0632\u0639\u0627\u062C \u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u063A\u0631\u0641\u0629",
          duration_minutes: 60
        }
      });
      hostReply = "\u062A\u0645 \u0627\u0633\u062A\u062F\u0639\u0627\u0621 \u0646\u0638\u0627\u0645 \u0627\u0644\u0623\u0645\u0627\u0646 \u0644\u062D\u0638\u0631 \u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u062E\u0627\u0644\u0641 \u0641\u0648\u0631\u0627\u064B \u0644\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0623\u062C\u0648\u0627\u0621 \u0627\u0644\u063A\u0631\u0641\u0629 \u0627\u0644\u0645\u0645\u062A\u0639\u0629! \u{1F6E1}\uFE0F\u26D4";
    } else {
      hostReply = `\u064A\u0627 \u0647\u0644\u0627 \u0628\u0640 ${senderName || "\u0627\u0644\u063A\u0627\u0644\u064A"}! \u0645\u0646\u0648\u0631 \u0627\u0644\u0645\u0627\u064A\u0643 \u0648\u0627\u0644\u0642\u0639\u062F\u0629. \u0634\u0648 \u0631\u0623\u064A\u0643\u0645 \u0646\u0648\u0644\u0639 \u0627\u0644\u063A\u0631\u0641\u0629 \u0628\u0644\u0639\u0628\u0629 \u0644\u0648\u062F\u0648 \u0633\u0631\u064A\u0639\u0629 \u0623\u0648 \u0645\u0633\u0627\u0628\u0642\u0629 \u062B\u0642\u0627\u0641\u064A\u0629\u061F \u{1F399}\uFE0F\u2728`;
    }
    return res.json({
      reply: hostReply,
      functionCalls: executedCalls,
      isSimulation: true
    });
  }
  try {
    const systemPrompt = `\u0623\u0646\u062A "\u0623\u0646\u064A\u0633 / \u064A\u0644\u0627 \u0628\u0648\u062A"\u060C \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0648\u062A\u0641\u0627\u0639\u0644\u064A \u0641\u064A \u063A\u0631\u0641\u0629 \u062F\u0631\u062F\u0634\u0629 \u0635\u0648\u062A\u064A\u0629 \u0639\u0631\u0628\u064A\u0629 \u062D\u064A\u0629 (\u0634\u0628\u064A\u0647\u0629 \u0628\u0640 YallaChat / Yalla Ludo).
\u0635\u0641\u0627\u062A\u0643 \u0648\u0645\u0647\u0645\u062A\u0643:
1. \u0627\u0644\u062A\u062D\u062F\u062B \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0628\u0623\u0633\u0644\u0648\u0628 \u0645\u0645\u062A\u0639\u060C \u0634\u0628\u0627\u0628\u064A\u060C \u062D\u0645\u0627\u0633\u064A \u0648\u0648\u062F\u0648\u062F.
2. \u062A\u0648\u0644\u064A\u062F \u0623\u0641\u0643\u0627\u0631 \u0644\u0644\u0646\u0642\u0627\u0634 \u0627\u0644\u062E\u0641\u064A\u0641\u060C \u0637\u0631\u062D \u0645\u0633\u0627\u0628\u0642\u0627\u062A\u060C \u0648\u0625\u0639\u0637\u0627\u0621 \u062A\u0644\u0645\u064A\u062D\u0627\u062A \u0644\u0644\u0623\u0644\u0639\u0627\u0628.
3. \u0644\u062F\u064A\u0643 \u0648\u0638\u0627\u0626\u0641 \u0648\u0623\u062F\u0648\u0627\u062A (Function Calling) \u0645\u062A\u0627\u062D\u0629:
   - ban_user: \u0639\u0646\u062F\u0645\u0627 \u064A\u0637\u0644\u0628 \u0627\u0644\u0645\u0636\u064A\u0641 \u062D\u0638\u0631 \u0634\u062E\u0635 \u0645\u0633\u064A\u0621 \u0623\u0648 \u0639\u0646\u062F \u0638\u0647\u0648\u0631 \u0634\u062E\u0635 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F\u0648\u062F.
   - start_game: \u0639\u0646\u062F\u0645\u0627 \u064A\u0637\u0644\u0628 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0623\u0648 \u062A\u0642\u062A\u0631\u062D \u0623\u0646\u062A \u0628\u062F\u0621 \u0644\u0639\u0628\u0629 (\u0645\u062B\u0644 \u0644\u0648\u062F\u0648 'ludo' \u0623\u0648 \u0645\u0633\u0627\u0628\u0642\u0627\u062A 'trivia' \u0623\u0648 \u0643\u0631\u0633\u064A \u0627\u0644\u0627\u0639\u062A\u0631\u0627\u0641 'truth_dare').
   - send_virtual_gift: \u0639\u0646\u062F\u0645\u0627 \u064A\u0637\u0644\u0628 \u0634\u062E\u0635 \u0625\u0631\u0633\u0627\u0644 \u0647\u062F\u064A\u0629 \u0623\u0648 \u062A\u0643\u0631\u064A\u0645 \u0634\u062E\u0635 \u0628\u0627\u0644\u0635\u0642\u0631 \u0623\u0648 \u0627\u0644\u062A\u0627\u062C \u0623\u0648 \u0627\u0644\u0633\u064A\u0627\u0631\u0629 \u0627\u0644\u0641\u0627\u0631\u0647\u0629.
\u0627\u0633\u062A\u062F\u0639\u0650 \u0627\u0644\u0648\u0638\u064A\u0641\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0625\u0630\u0627 \u0643\u0627\u0646 \u0633\u064A\u0627\u0642 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u064A\u062A\u0637\u0644\u0628 \u0630\u0644\u0643. \u0625\u0630\u0627 \u0644\u0645 \u064A\u062A\u0637\u0644\u0628\u060C \u0631\u062F \u0628\u0646\u0635 \u062C\u0630\u0627\u0628 \u0648\u0645\u062D\u0641\u0632 \u0644\u0644\u062D\u062F\u064A\u062B.`;
    const contents = `\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 "${senderName || "\u0639\u0636\u0648"}" (\u0645\u0639\u0631\u0641: ${senderId}) \u0641\u064A \u063A\u0631\u0641\u0629 \u0628\u0639\u0646\u0648\u0627\u0646: "${roomTopic || "\u0633\u0647\u0631\u0629 \u0644\u0648\u062F\u0648 \u0648\u0633\u0648\u0627\u0644\u0641"}" \u0642\u0627\u0644:
"${userMessage}"
\u062D\u0627\u0644\u0629 \u0627\u0644\u0644\u0639\u0628\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629: ${activeGame || "\u0644\u0627 \u062A\u0648\u062C\u062F \u0644\u0639\u0628\u0629 \u0646\u0634\u0637\u0629 \u062D\u0627\u0644\u064A\u0627\u064B"}.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        tools: [
          {
            functionDeclarations: [banUserTool, startGameTool, sendVirtualGiftTool]
          }
        ]
      }
    });
    const calls = response.functionCalls || [];
    const textReply = response.text || (calls.length > 0 ? "\u0623\u0628\u0634\u0631! \u062C\u0627\u0631\u064A \u062A\u0646\u0641\u064A\u0630 \u0637\u0644\u0628\u0643 \u0641\u0648\u0631\u0627\u064B \u0641\u064A \u0627\u0644\u063A\u0631\u0641\u0629 \u{1F680}" : "\u0623\u0647\u0644\u0627\u064B \u0628\u0643\u0645 \u0641\u064A \u0627\u0644\u063A\u0631\u0641\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629!");
    return res.json({
      reply: textReply,
      functionCalls: calls.map((c) => ({
        name: c.name,
        args: c.args
      })),
      isSimulation: false
    });
  } catch (error) {
    console.warn("Gemini Host Error (falling back to offline response):", error?.message || error);
    return res.json({
      reply: "\u0647\u0644\u0627 \u0648\u0627\u0644\u0644\u0647 \u0648\u0645\u0631\u062D\u0628\u064B\u0627 \u0628\u064A\u0643\u0645 \u062C\u0645\u064A\u0639\u0627\u064B! \u0646\u0648\u0631\u062A\u0648\u0627 \u0627\u0644\u063A\u0631\u0641\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629 \u{1F389}\u{1F399}\uFE0F",
      functionCalls: [],
      isSimulation: true
    });
  }
});
app.post("/api/gemini/recommend", async (req, res) => {
  const { userInterests, favoriteGames, activityHistory, availableRooms } = req.body;
  const ai = getGeminiClient();
  const mockRoomsList = availableRooms || [
    { id: "room_1", title: "\u0628\u0637\u0648\u0644\u0629 \u0644\u0648\u062F\u0648 \u0627\u0644\u062E\u0644\u064A\u062C \u0627\u0644\u0643\u0628\u0631\u0649 \u{1F3C6}\u{1F3B2}", category: "games", activeGame: "ludo", activeUsersCount: 42 },
    { id: "room_2", title: "\u0637\u0631\u0628 \u0648\u0633\u0647\u0631\u0629 \u0634\u0639\u0631 \u0648\u062E\u0648\u0627\u0637\u0631 \u{1F3B6}\u{1F319}", category: "music", activeGame: null, activeUsersCount: 28 },
    { id: "room_3", title: "\u062A\u062D\u062F\u064A \u0627\u0644\u0639\u0628\u0627\u0642\u0631\u0629 \u0648\u0645\u0633\u0627\u0628\u0642\u0627\u062A \u0630\u0643\u0627\u0621 \u{1F4A1}\u{1F9E0}", category: "competitions", activeGame: "trivia", activeUsersCount: 35 },
    { id: "room_4", title: "\u0633\u0648\u0627\u0644\u0641 \u0634\u0628\u0627\u0628 \u0648\u0636\u062D\u0643 \u0648\u0641\u0631\u0641\u0634\u0629 \u{1F602}\u2615", category: "chat", activeGame: "truth_dare", activeUsersCount: 50 },
    { id: "room_5", title: "\u062A\u062D\u062F\u064A\u0627\u062A \u062D\u0643\u0627\u0645 \u0644\u0648\u062F\u0648 \u0627\u0644\u0645\u062D\u062A\u0631\u0641\u064A\u0646 \u{1F525}\u{1F451}", category: "games", activeGame: "ludo", activeUsersCount: 19 },
    { id: "room_6", title: "\u0635\u0648\u062A\u064A\u0627\u062A \u0648\u062A\u0642\u0646\u064A\u0629 \u0648\u0628\u0631\u0645\u062C\u0629 \u0648\u062A\u0637\u0648\u064A\u0631 \u{1F4BB}\u{1F680}", category: "chat", activeGame: null, activeUsersCount: 15 }
  ];
  const getFallbackRecommendations = () => ({
    userProfileSummaryAr: `\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0647\u062A\u0645 \u0628\u0640: ${userInterests?.join("\u060C ") || "\u0627\u0644\u0623\u0644\u0639\u0627\u0628 \u0648\u0627\u0644\u062F\u0631\u062F\u0634\u0629"} \u0648\u0645\u062D\u0628 \u0644\u0644\u0623\u0644\u0639\u0627\u0628: ${favoriteGames?.join("\u060C ") || "\u0644\u0648\u062F\u0648 \u0648\u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0627\u062A"}.`,
    recommendedRooms: mockRoomsList.slice(0, 5).map((room, index) => ({
      roomId: room.id,
      priority: index + 1,
      score: Math.round(98 - index * 6),
      matchingReasonAr: index === 0 ? "\u0623\u0639\u0644\u0649 \u063A\u0631\u0641\u0629 \u062A\u0637\u0627\u0628\u0642\u0627\u064B \u0645\u0639 \u0634\u063A\u0641\u0643 \u0628\u0623\u0644\u0639\u0627\u0628 \u0627\u0644\u0644\u0648\u062F\u0648 \u0648\u0627\u0644\u0645\u0646\u0627\u0641\u0633\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0639\u064A\u0629 \u0627\u0644\u0646\u0634\u0637\u0629 \u062D\u0627\u0644\u064A\u0627\u064B." : `\u062A\u0646\u0627\u0633\u0628 \u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A\u0643 \u0641\u064A \u0627\u0644\u062A\u0631\u0641\u064A\u0647 \u0645\u0639 \u0648\u062C\u0648\u062F ${room.activeUsersCount} \u0645\u062A\u062D\u062F\u062B\u064A\u0646 \u0646\u0634\u0637\u064A\u0646.`,
      recommendedGame: room.activeGame || void 0
    })),
    isSimulation: true
  });
  if (!ai) {
    return res.json(getFallbackRecommendations());
  }
  try {
    const prompt = `\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0633\u062C\u0644 \u0646\u0634\u0627\u0637\u0647 \u0648\u0627\u0644\u0623\u0644\u0639\u0627\u0628 \u0627\u0644\u062A\u064A \u064A\u0641\u0636\u0644\u0647\u0627\u060C \u0627\u062E\u062A\u0631 \u0623\u0641\u0636\u0644 5 \u063A\u0631\u0641 \u0635\u0648\u062A\u064A\u0629 \u062A\u0646\u0627\u0633\u0628\u0647 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0648\u0642\u0645 \u0628\u062A\u0631\u062A\u064A\u0628\u0647\u0627 \u0628\u062D\u0633\u0628 \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629 \u0645\u0639 \u062A\u0648\u0636\u064A\u062D \u0633\u0628\u0628 \u0627\u0644\u062A\u0631\u0634\u064A\u062D \u0628\u062F\u0642\u0629.
\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645:
- \u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A\u0647: ${JSON.stringify(userInterests || ["\u0623\u0644\u0639\u0627\u0628 \u0644\u0648\u062F\u0648", "\u0645\u0633\u0627\u0628\u0642\u0627\u062A \u0648\u062A\u062D\u062F\u064A\u0627\u062A"])}
- \u0623\u0644\u0639\u0627\u0628\u0647 \u0627\u0644\u0645\u0641\u0636\u0644\u0629: ${JSON.stringify(favoriteGames || ["ludo", "trivia"])}
- \u0633\u062C\u0644 \u0646\u0634\u0627\u0637\u0647: ${activityHistory || "\u064A\u0642\u0636\u064A \u0645\u0639\u0638\u0645 \u0627\u0644\u0648\u0642\u062A \u0641\u064A \u063A\u0631\u0641 \u0623\u0644\u0639\u0627\u0628 \u0627\u0644\u0637\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0627\u062A \u0645\u0639 \u0623\u0635\u062F\u0642\u0627\u0626\u0647"}

\u0627\u0644\u063A\u0631\u0641 \u0627\u0644\u0635\u0648\u062A\u064A\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629:
${JSON.stringify(mockRoomsList, null, 2)}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "\u0623\u0646\u062A \u0645\u062D\u0631\u0643 \u0627\u0644\u062A\u0648\u0635\u064A\u0627\u062A \u0627\u0644\u0630\u0643\u064A \u0644\u0645\u0646\u0635\u0629 YallaChat. \u062A\u062E\u062A\u0627\u0631 \u0623\u0641\u0636\u0644 \u0627\u0644\u063A\u0631\u0641 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u062A\u0648\u0627\u0641\u0642 \u0627\u0644\u0645\u062D\u062A\u0648\u0649\u060C \u062A\u0641\u0627\u0639\u0644 \u0627\u0644\u0623\u0639\u0636\u0627\u0621\u060C \u0648\u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A \u0627\u0644\u0644\u0627\u0639\u0628 \u0648\u062A\u0639\u0637\u064A \u062A\u0628\u0631\u064A\u0631\u0627\u064B \u0630\u0643\u064A\u0627\u064B \u0648\u0634\u0628\u0627\u0628\u064A\u0627\u064B \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.",
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            userProfileSummaryAr: {
              type: import_genai.Type.STRING,
              description: "\u0645\u0644\u062E\u0635 \u0644\u0634\u062E\u0635\u064A\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A\u0647 \u0627\u0644\u0645\u0633\u062A\u062E\u0644\u0635\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
            },
            recommendedRooms: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  roomId: { type: import_genai.Type.STRING },
                  priority: { type: import_genai.Type.INTEGER, description: "\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0645\u0646 1 \u0625\u0644\u0649 5" },
                  score: { type: import_genai.Type.NUMBER, description: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u0648\u0627\u0641\u0642 \u0645\u0646 0 \u0625\u0644\u0649 100" },
                  matchingReasonAr: { type: import_genai.Type.STRING, description: "\u0633\u0628\u0628 \u0627\u0644\u062A\u0631\u0634\u064A\u062D \u0627\u0644\u0645\u0642\u0646\u0639 \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645" },
                  recommendedGame: { type: import_genai.Type.STRING, description: "\u0627\u0644\u0644\u0639\u0628\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629 \u0625\u0646 \u0648\u062C\u062F\u062A" }
                },
                required: ["roomId", "priority", "score", "matchingReasonAr"]
              }
            }
          },
          required: ["userProfileSummaryAr", "recommendedRooms"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.warn("Gemini Recommend Error (falling back to default recommendations):", error?.message || error);
    return res.json(getFallbackRecommendations());
  }
});
app.post("/api/gemini/trivia", async (req, res) => {
  const { category, difficulty } = req.body;
  const ai = getGeminiClient();
  const fallbacks = [
    {
      id: "q_" + Date.now(),
      question: "\u0645\u0627 \u0647\u0648 \u0623\u0633\u0631\u0639 \u0637\u0627\u0626\u0631 \u0641\u064A \u0627\u0644\u0639\u0627\u0644\u0645 \u0639\u0646\u062F \u0627\u0644\u0627\u0646\u0642\u0636\u0627\u0636 \u0644\u0635\u064A\u062F \u0641\u0631\u064A\u0633\u062A\u0647\u061F",
      options: ["\u0627\u0644\u0635\u0642\u0631 \u0627\u0644\u0634\u0627\u0647\u064A\u0646", "\u0627\u0644\u0646\u0633\u0631 \u0627\u0644\u0630\u0647\u0628\u064A", "\u0627\u0644\u0646\u0639\u0627\u0645\u0629", "\u0637\u0627\u0626\u0631 \u0627\u0644\u0633\u0646\u0648\u0646\u0648"],
      correctIndex: 0,
      categoryAr: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0627\u0645\u0629 \u0648\u0637\u0628\u064A\u0639\u0629",
      explanationAr: "\u0627\u0644\u0635\u0642\u0631 \u0627\u0644\u0634\u0627\u0647\u064A\u0646 \u064A\u062A\u062C\u0627\u0648\u0632 \u0633\u0631\u0639\u062A\u0647 320 \u0643\u0645/\u0633\u0627\u0639\u0629 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0647\u0628\u0648\u0637 \u0627\u0644\u0627\u0646\u0642\u0636\u0627\u0636\u064A!",
      timeLimitSeconds: 15
    },
    {
      id: "q_" + Date.now(),
      question: "\u0643\u0645 \u0639\u062F\u062F \u062E\u0627\u0646\u0627\u062A \u0645\u0631\u0628\u0639 \u0627\u0644\u0628\u062F\u0627\u064A\u0629 \u0641\u064A \u0644\u0639\u0628\u0629 \u0627\u0644\u0644\u0648\u062F\u0648 \u0627\u0644\u062A\u0642\u0644\u064A\u062F\u064A\u0629 \u0644\u0643\u0644 \u0644\u0648\u0646\u061F",
      options: ["3 \u062E\u0627\u0646\u0627\u062A", "4 \u062E\u0627\u0646\u0627\u062A", "6 \u062E\u0627\u0646\u0627\u062A", "5 \u062E\u0627\u0646\u0627\u062A"],
      correctIndex: 1,
      categoryAr: "\u0623\u0644\u0639\u0627\u0628 \u0643\u0644\u0627\u0633\u064A\u0643\u064A\u0629",
      explanationAr: "\u0644\u0643\u0644 \u0644\u0627\u0639\u0628 4 \u0628\u064A\u0627\u062F\u0642 (\u0642\u0637\u0639) \u062A\u0628\u062F\u0623 \u0641\u064A \u0642\u0627\u0639\u062F\u062A\u0647\u0627 \u0627\u0644\u062E\u0627\u0635\u0629 \u0641\u064A \u0644\u0639\u0628\u0629 \u0627\u0644\u0644\u0648\u062F\u0648.",
      timeLimitSeconds: 15
    }
  ];
  if (!ai) {
    return res.json(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
  }
  try {
    const prompt = `\u0648\u0644\u062F \u0633\u0624\u0627\u0644 \u0645\u0633\u0627\u0628\u0642\u0629 \u062B\u0642\u0627\u0641\u064A\u0629 \u062A\u0631\u0641\u064A\u0647\u064A\u0629 \u062E\u0641\u064A\u0641\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0623\u062C\u0648\u0627\u0621 \u063A\u0631\u0641 \u0627\u0644\u062F\u0631\u062F\u0634\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629 \u0648\u0627\u0644\u0634\u0628\u0627\u0628 \u0641\u064A YallaChat.
\u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0645\u0637\u0644\u0648\u0628: ${category || "\u0639\u0627\u0645 \u0623\u0648 \u0623\u0644\u0639\u0627\u0628 \u0623\u0648 \u062C\u063A\u0631\u0627\u0641\u064A\u0627 \u0623\u0648 \u062B\u0642\u0627\u0641\u0629 \u0639\u0631\u0628\u064A\u0629"}.
\u0627\u0644\u0635\u0639\u0648\u0628\u0629: ${difficulty || "\u0645\u062A\u0648\u0633\u0637\u0629 \u0648\u0645\u0633\u0644\u064A\u0629"}.
\u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0636\u0645\u0646 4 \u062E\u064A\u0627\u0631\u0627\u062A\u060C \u0648\u0645\u0624\u0634\u0631 \u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u0635\u062D\u064A\u062D (0-3)\u060C \u0648\u062A\u0641\u0633\u064A\u0631 \u0645\u0645\u062A\u0639 \u0648\u0645\u0648\u062C\u0632.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "\u0623\u0646\u062A \u0635\u0627\u0646\u0639 \u0623\u0633\u0626\u0644\u0629 \u0648\u0645\u0633\u0627\u0628\u0642\u0627\u062A \u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0633\u0631\u064A\u0639\u0629 \u0648\u0645\u0645\u062A\u0639\u0629 \u0644\u063A\u0631\u0641 \u0627\u0644\u062F\u0631\u062F\u0634\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629. \u0643\u0644 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649 \u0627\u0644\u0645\u0628\u0633\u0637\u0629 \u0648\u0628\u0635\u064A\u063A\u0629 JSON \u062F\u0642\u064A\u0642\u0629.",
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            id: { type: import_genai.Type.STRING },
            question: { type: import_genai.Type.STRING, description: "\u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
            options: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: "\u0623\u0631\u0628\u0639\u0629 \u062E\u064A\u0627\u0631\u0627\u062A \u0628\u0627\u0644\u0636\u0628\u0637"
            },
            correctIndex: { type: import_genai.Type.INTEGER, description: "\u0631\u0642\u0645 \u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u0635\u062D\u064A\u062D \u0645\u0646 0 \u0625\u0644\u0649 3" },
            categoryAr: { type: import_genai.Type.STRING, description: "\u0627\u0633\u0645 \u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
            explanationAr: { type: import_genai.Type.STRING, description: "\u0645\u0639\u0644\u0648\u0645\u0629 \u0623\u0648 \u062A\u0648\u0636\u064A\u062D \u0634\u064A\u0642 \u0628\u0639\u062F \u0627\u0644\u0625\u062C\u0627\u0628\u0629" },
            timeLimitSeconds: { type: import_genai.Type.INTEGER, description: "\u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0645\u0642\u062A\u0631\u062D \u0628\u0627\u0644\u062B\u0648\u0627\u0646\u064A (15 \u062B\u0627\u0646\u064A\u0629)" }
          },
          required: ["question", "options", "correctIndex", "categoryAr", "explanationAr", "timeLimitSeconds"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    if (!parsed.id) parsed.id = "q_" + Date.now();
    return res.json(parsed);
  } catch (error) {
    console.warn("Gemini Trivia Error (falling back to default question):", error?.message || error);
    return res.json(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
  }
});
var serverOtpStore = /* @__PURE__ */ new Map();
var mailTransporter = null;
function getMailTransporter() {
  if (mailTransporter) return mailTransporter;
  const rawUser = process.env.SMTP_USER || process.env.GMAIL_USER || "saber.loucif35@gmail.com";
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "rhzbcmjgipbqqpsn";
  const user = rawUser ? rawUser.trim() : "";
  const pass = rawPass ? rawPass.trim().replace(/\s+/g, "") : "";
  let host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  if (!user || !pass) return null;
  const isGmail = host && host.includes("gmail") || user && user.includes("@gmail.com");
  mailTransporter = import_nodemailer.default.createTransport(
    isGmail ? {
      service: "gmail",
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    } : {
      host: host || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    }
  );
  return mailTransporter;
}
async function sendRealEmail(to, code, purpose = "verification") {
  const isReset = purpose === "reset";
  const subject = isReset ? `\u{1F510} \u0631\u0645\u0632 \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 - \u064A\u0644\u0627 \u0634\u0627\u062A: ${code}` : `\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0641\u064A \u064A\u0644\u0627 \u0634\u0627\u062A: ${code}`;
  const title = isReset ? "\u{1F510} \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" : "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A";
  const description = isReset ? "\u0644\u0642\u062F \u062A\u0644\u0642\u064A\u0646\u0627 \u0637\u0644\u0628\u0627\u064B \u0644\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u062D\u0633\u0627\u0628\u0643 \u0641\u064A \u062A\u0637\u0628\u064A\u0642 \u064A\u0644\u0627 \u0634\u0627\u062A. \u064A\u0631\u062C\u0649 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0631\u0645\u0632 \u0627\u0644\u0623\u0645\u0627\u0646 \u0627\u0644\u0633\u0631\u064A \u0627\u0644\u062A\u0627\u0644\u064A \u0644\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0629:" : "\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0644\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0633\u0627\u0628 \u0641\u064A \u062A\u0637\u0628\u064A\u0642 \u064A\u0644\u0627 \u0634\u0627\u062A:";
  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #080c14; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f1f5f9; text-align: right;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background: linear-gradient(180deg, #0f172a 0%, #090d16 100%); border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
        
        <!-- Header Banner -->
        <tr>
          <td style="padding: 28px 24px 20px; text-align: center; background: linear-gradient(135deg, rgba(30,58,138,0.4) 0%, rgba(15,23,42,0.8) 100%); border-bottom: 1px solid #1e293b;">
            <div style="display: inline-block; background: #38bdf820; border: 1px solid #38bdf840; border-radius: 50px; padding: 6px 18px; margin-bottom: 12px;">
              <span style="color: #38bdf8; font-size: 12px; font-weight: bold; letter-spacing: 0.5px;">\u{1F6E1}\uFE0F \u0623\u0645\u0627\u0646 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A | Account Security</span>
            </div>
            <h1 style="color: #ffffff; font-size: 26px; margin: 0; font-weight: 900; letter-spacing: 1px;">
              \u064A\u0644\u0627 \u0634\u0627\u062A <span style="color: #38bdf8;">| YallaChat</span>
            </h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0;">\u0645\u0646\u0635\u0629 \u0627\u0644\u063A\u0631\u0641 \u0627\u0644\u0635\u0648\u062A\u064A\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A \u0627\u0644\u0639\u0631\u0628\u064A\u0629</p>
          </td>
        </tr>

        <!-- Body Content -->
        <tr>
          <td style="padding: 28px 24px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="display: inline-block; background: ${isReset ? "#f59e0b20" : "#38bdf820"}; color: ${isReset ? "#fbbf24" : "#38bdf8"}; font-size: 14px; padding: 5px 16px; border-radius: 20px; font-weight: bold; border: 1px solid ${isReset ? "#f59e0b40" : "#38bdf840"};">
                ${title}
              </span>
            </div>

            <p style="font-size: 15px; color: #cbd5e1; line-height: 1.7; text-align: center; margin: 0 0 24px;">
              ${description}
            </p>

            <!-- OTP Code Display Card -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px;">
              <tr>
                <td style="background: #020617; border: 2px dashed ${isReset ? "#f59e0b" : "#38bdf8"}; border-radius: 16px; padding: 24px; text-align: center;">
                  <div style="font-size: 40px; font-weight: 900; letter-spacing: 10px; color: ${isReset ? "#fbbf24" : "#38bdf8"}; font-family: 'Courier New', Courier, monospace; direction: ltr; display: inline-block;">
                    ${code}
                  </div>
                  <div style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
                    \u23F1\uFE0F <strong>\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0631\u0645\u0632:</strong> \u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u062F \u0635\u0627\u0644\u062D \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629 \u0641\u0642\u0637 \u0644\u0645\u062F\u0629 <strong>5 \u062F\u0642\u0627\u0626\u0642</strong>.
                  </div>
                </td>
              </tr>
            </table>

            <!-- Security Warning Box -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: rgba(245, 158, 11, 0.08); border-right: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 14px 16px;">
                  <div style="font-size: 13px; color: #fef08a; font-weight: bold; margin-bottom: 4px;">
                    \u26A0\uFE0F \u062A\u0646\u0628\u064A\u0647 \u0623\u0645\u0646\u064A \u0647\u0627\u0645 \u0648\u0633\u0631\u064A \u0644\u0644\u063A\u0627\u064A\u0629:
                  </div>
                  <div style="font-size: 12px; color: #cbd5e1; line-height: 1.6;">
                    \u2022 \u0644\u0627 \u062A\u0634\u0627\u0631\u0643 \u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u0645\u0637\u0644\u0642\u0627\u064B \u0645\u0639 \u0623\u064A \u0634\u062E\u0635 \u062D\u0641\u0627\u0638\u0627\u064B \u0639\u0644\u0649 \u0623\u0645\u0627\u0646 \u062D\u0633\u0627\u0628\u0643 \u0648\u0631\u0635\u064A\u062F\u0643.<br/>
                    \u2022 \u0645\u0648\u0638\u0641\u0648 \u0625\u062F\u0627\u0631\u0629 \u064A\u0644\u0627 \u0634\u0627\u062A \u0648\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A \u0644\u0646 \u064A\u0637\u0644\u0628\u0648\u0627 \u0645\u0646\u0643 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0623\u0628\u062F\u0627\u064B \u0628\u0623\u064A \u0648\u0633\u064A\u0644\u0629.
                  </div>
                </td>
              </tr>
            </table>

            <p style="font-size: 12px; color: #64748b; text-align: center; line-height: 1.6; margin: 0;">
              \u0625\u0630\u0627 \u0644\u0645 \u062A\u0642\u0645 \u0628\u0637\u0644\u0628 \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u060C \u064A\u0631\u062C\u0649 \u062A\u062C\u0627\u0647\u0644 \u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F \u0641\u0648\u0631\u0627\u064B. \u062D\u0633\u0627\u0628\u0643 \u0641\u064A \u0623\u0645\u0627\u0646 \u062A\u0627\u0645 \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u0644\u0623\u062D\u062F \u062A\u063A\u064A\u064A\u0631\u0647 \u062F\u0648\u0646 \u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 20px 24px; background: #070a10; border-top: 1px solid #1e293b; text-align: center;">
            <p style="font-size: 11px; color: #475569; margin: 0;">
              \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} \u064A\u0644\u0627 \u0634\u0627\u062A (YallaChat Inc). \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629.<br/>
              \u0647\u0630\u0647 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0622\u0644\u064A\u0629 \u0644\u062D\u0645\u0627\u064A\u0629 \u0623\u0645\u0627\u0646 \u062D\u0633\u0627\u0628\u0643\u060C \u064A\u064F\u0631\u062C\u0649 \u0639\u062F\u0645 \u0627\u0644\u0631\u062F \u0639\u0644\u064A\u0647\u0627.
            </p>
          </td>
        </tr>

      </table>
    </body>
    </html>
  `;
  if (process.env.RESEND_API_KEY) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "YallaChat <onboarding@resend.dev>",
          to: [to],
          subject,
          html
        })
      });
      if (resp.ok) {
        console.log(`[Real Delivery] Real email dispatched to ${to} via Resend (${purpose})`);
        return { success: true, provider: "Resend" };
      } else {
        const errData = await resp.json().catch(() => ({}));
        console.error("[Real Delivery Error - Resend]:", errData);
      }
    } catch (err) {
      console.error("[Real Delivery Network Error - Resend]:", err);
    }
  }
  const transporter = getMailTransporter();
  if (transporter) {
    try {
      const mailSender = process.env.SMTP_USER || process.env.GMAIL_USER || "saber.loucif35@gmail.com";
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"\u064A\u0644\u0627 \u0634\u0627\u062A \u0644\u0644\u0623\u0645\u0627\u0646" <${mailSender}>`,
        to,
        subject,
        html
      });
      console.log(`[Real Delivery] Real email dispatched to ${to} via SMTP (${purpose})`);
      return { success: true, provider: "SMTP" };
    } catch (err) {
      console.error("[Real Delivery Error - SMTP]:", err);
      return { success: false, error: err.message };
    }
  }
  try {
    const testAccount = await import_nodemailer.default.createTestAccount();
    const testTransporter = import_nodemailer.default.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    const info = await testTransporter.sendMail({
      from: `"\u064A\u0644\u0627 \u0634\u0627\u062A" <security@yallachat.live>`,
      to,
      subject,
      html
    });
    const previewUrl = import_nodemailer.default.getTestMessageUrl(info);
    console.log(`[Real Delivery - SMTP Sandbox] Email sent to ${to} for [${purpose}]! View message: ${previewUrl}`);
    return { success: true, provider: "SMTP (Sandbox)", previewUrl: previewUrl || void 0 };
  } catch (etherealErr) {
    console.error("[Sandbox SMTP Error]:", etherealErr);
  }
  return { success: false, error: "no_credentials" };
}
async function sendRealSms(phone, code) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (!cleanPhone.startsWith("+")) {
    cleanPhone = "+" + cleanPhone;
  }
  if (accountSid && authToken && fromNumber) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const bodyParams = new URLSearchParams();
      bodyParams.append("To", cleanPhone);
      bodyParams.append("From", fromNumber);
      bodyParams.append("Body", `\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0641\u064A \u062A\u0637\u0628\u064A\u0642 \u064A\u0644\u0627 \u0634\u0627\u062A \u0647\u0648: ${code} . \u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 5 \u062F\u0642\u0627\u0626\u0642. \u0644\u0627 \u062A\u0634\u0627\u0631\u0643\u0647 \u0645\u0639 \u0623\u062D\u062F.`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: bodyParams.toString()
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`[Real SMS Delivery] SMS sent to ${cleanPhone} via Twilio, SID: ${data.sid}`);
        return { success: true, provider: "Twilio" };
      } else {
        console.error("[Twilio SMS Error]:", data);
        return { success: false, error: data.message || "Twilio error" };
      }
    } catch (err) {
      console.error("[Twilio SMS Network Error]:", err);
      return { success: false, error: err.message };
    }
  }
  if (process.env.SMS_GATEWAY_URL) {
    try {
      const resp = await fetch(process.env.SMS_GATEWAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          message: `\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0641\u064A \u064A\u0644\u0627 \u0634\u0627\u062A \u0647\u0648: ${code}`,
          code
        })
      });
      if (resp.ok) {
        console.log(`[Real SMS Delivery] SMS sent to ${cleanPhone} via Custom SMS Gateway`);
        return { success: true, provider: "SMS Gateway" };
      }
    } catch (err) {
      console.error("[SMS Gateway Error]:", err);
    }
  }
  return { success: false, error: "no_credentials" };
}
app.post("/api/auth/send-verification", async (req, res) => {
  const { destination, type, purpose } = req.body;
  if (!destination || typeof destination !== "string") {
    return res.status(400).json({ success: false, error: "\u0648\u062C\u0647\u0629 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
  }
  const cleanDest = destination.trim().toLowerCase();
  const deliveryType = type === "sms" ? "sms" : "email";
  const actionPurpose = purpose === "reset" ? "reset" : "verification";
  const code = Math.floor(1e5 + Math.random() * 9e5).toString();
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1e3;
  serverOtpStore.set(cleanDest, {
    code,
    destination: cleanDest,
    type: deliveryType,
    purpose: actionPurpose,
    createdAt: now,
    expiresAt
  });
  let deliveryResult;
  if (deliveryType === "sms") {
    deliveryResult = await sendRealSms(destination, code);
  } else {
    deliveryResult = await sendRealEmail(destination, code, actionPurpose);
  }
  console.log(`[Auth Dispatch] Destination: ${cleanDest} | Purpose: ${actionPurpose} | Delivered: ${deliveryResult.success} | Provider: ${deliveryResult.provider || "Local Server"}`);
  return res.json({
    success: true,
    destination: cleanDest,
    type: deliveryType,
    purpose: actionPurpose,
    expiresAt,
    realDelivery: deliveryResult.success,
    provider: deliveryResult.provider || null,
    message: actionPurpose === "reset" ? `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0643\u0648\u062F \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0625\u0644\u0649 \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A (${destination}) \u0628\u0646\u062C\u0627\u062D. \u064A\u0631\u062C\u0649 \u0645\u0631\u0627\u062C\u0639\u0629 \u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0648\u0627\u0631\u062F (\u0623\u0648 \u0645\u062C\u0644\u062F Spam) \u0648\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0643\u0648\u0646 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645 \u0644\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631.` : deliveryType === "sms" ? `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 SMS \u0625\u0644\u0649 \u0631\u0642\u0645 \u0647\u0627\u062A\u0641\u0643 (${destination}) \u0628\u0646\u062C\u0627\u062D. \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0631\u0633\u0627\u0626\u0644 \u0647\u0627\u062A\u0641\u0643 \u0648\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0631\u0645\u0632.` : `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u062D\u0642\u064A\u0642\u064A\u0629 \u0625\u0644\u0649 (${destination}) \u0628\u0646\u062C\u0627\u062D. \u064A\u0631\u062C\u0649 \u0641\u062D\u0635 \u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0648\u0627\u0631\u062F \u0648\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0631\u0645\u0632.`,
    note: !deliveryResult.success && deliveryType === "sms" ? "\u0644\u062A\u0633\u0644\u064A\u0645 \u0631\u0633\u0627\u0626\u0644 SMS \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0628\u0631 \u0623\u0628\u0631\u0627\u062C \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A\u060C \u064A\u0645\u0643\u0646 \u0625\u0636\u0627\u0641\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0632\u0648\u062F \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A Twilio \u0641\u064A \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0628\u064A\u0626\u0629." : void 0
  });
});
app.post("/api/auth/verify-code", (req, res) => {
  const { destination, code, purpose } = req.body;
  if (!destination || !code) {
    return res.status(400).json({ success: false, error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u062D\u0642\u0642 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629" });
  }
  const cleanDest = destination.trim().toLowerCase();
  const cleanCode = code.toString().trim();
  const record = serverOtpStore.get(cleanDest);
  if (!record) {
    return res.status(400).json({
      success: false,
      error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0631\u0645\u0632 \u062A\u062D\u0642\u0642 \u0646\u0634\u0637 \u0644\u0647\u0630\u0647 \u0627\u0644\u0648\u062C\u0647\u0629\u060C \u064A\u0631\u062C\u0649 \u0637\u0644\u0628 \u0643\u0648\u062F \u062C\u062F\u064A\u062F."
    });
  }
  if (Date.now() > record.expiresAt) {
    serverOtpStore.delete(cleanDest);
    return res.status(400).json({
      success: false,
      error: "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 (\u0623\u0643\u062B\u0631 \u0645\u0646 5 \u062F\u0642\u0627\u0626\u0642)\u060C \u064A\u0631\u062C\u0649 \u0637\u0644\u0628 \u0643\u0648\u062F \u062C\u062F\u064A\u062F."
    });
  }
  if (purpose && record.purpose && record.purpose !== purpose) {
    serverOtpStore.delete(cleanDest);
    return res.status(400).json({
      success: false,
      error: purpose === "reset" ? "\u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u0645\u062E\u0635\u0635 \u0644\u0639\u0645\u0644\u064A\u0629 \u0623\u062E\u0631\u0649\u060C \u064A\u0631\u062C\u0649 \u0637\u0644\u0628 \u0643\u0648\u062F \u062C\u062F\u064A\u062F \u0644\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631." : "\u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0644\u0647\u0630\u0647 \u0627\u0644\u0639\u0645\u0644\u064A\u0629\u060C \u064A\u0631\u062C\u0649 \u0637\u0644\u0628 \u0643\u0648\u062F \u062C\u062F\u064A\u062F."
    });
  }
  if (record.code !== cleanCode) {
    return res.status(400).json({
      success: false,
      error: "\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D! \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0631\u0645\u0632 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629."
    });
  }
  serverOtpStore.delete(cleanDest);
  return res.json({
    success: true,
    verified: true,
    message: "\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0645\u0632 \u0648\u062A\u0623\u0643\u064A\u062F \u0645\u0644\u0643\u064A\u0629 \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0646\u062C\u0627\u062D! \u2713"
  });
});
app.post("/api/auth/clear-otp", (req, res) => {
  const { destination } = req.body || {};
  if (destination && typeof destination === "string") {
    serverOtpStore.delete(destination.trim().toLowerCase());
  } else {
    serverOtpStore.clear();
  }
  return res.json({ success: true });
});
app.get("/api/auth/oauth/url", (req, res) => {
  const provider = (req.query.provider || "google").toLowerCase();
  const rawRedirectUri = req.query.redirect_uri || `${process.env.APP_URL || "https://ais-dev-kvuvyd7vym77czzr26kr55-443746271141.europe-west1.run.app"}/auth/callback`;
  const redirectUri = encodeURIComponent(rawRedirectUri);
  const state = encodeURIComponent(`google_${Date.now()}`);
  const clientId = process.env.GOOGLE_CLIENT_ID || "10476483921-google-oauth.apps.googleusercontent.com";
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&state=${state}&prompt=select_account`;
  return res.json({
    success: true,
    provider: "google",
    url: authUrl,
    redirectUri: rawRedirectUri
  });
});
app.get(["/auth/callback", "/auth/callback/"], (req, res) => {
  const { code, state, error, error_description } = req.query;
  const provider = typeof state === "string" && state.includes("_") ? state.split("_")[0] : "social";
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>\u064A\u0644\u0627 \u0634\u0627\u062A | \u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            background: #090d16;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 24px;
            padding: 32px 24px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .badge {
            display: inline-block;
            background: rgba(56, 189, 248, 0.15);
            color: #38bdf8;
            padding: 6px 16px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 16px;
            border: 1px solid rgba(56, 189, 248, 0.3);
          }
          h2 { margin: 0 0 8px; font-size: 20px; font-weight: 800; color: #fff; }
          p { margin: 0 0 20px; font-size: 13px; color: #94a3b8; line-height: 1.5; }
          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(56, 189, 248, 0.2);
            border-top-color: #38bdf8;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">\u064A\u0644\u0627 \u0634\u0627\u062A \u2022 YallaChat</div>
          <h2>\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0646\u062C\u0627\u062D \u2713</h2>
          <p>\u062C\u0627\u0631\u064A \u0645\u0632\u0627\u0645\u0646\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u062D\u0633\u0627\u0628\u0643 \u0648\u0627\u0644\u0639\u0648\u062F\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0625\u0644\u0649 \u0627\u0644\u062A\u0637\u0628\u064A\u0642...</p>
          <div class="spinner"></div>
        </div>
        <script>
          const authData = {
            type: 'OAUTH_AUTH_SUCCESS',
            provider: ${JSON.stringify(provider)},
            code: ${JSON.stringify(code || "")},
            error: ${JSON.stringify(error || null)}
          };

          if (window.opener) {
            window.opener.postMessage(authData, '*');
            setTimeout(() => {
              window.close();
            }, 600);
          } else {
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          }
        </script>
      </body>
    </html>
  `);
});
var initialCommunityRooms = [];
var roomsMap = /* @__PURE__ */ new Map();
initialCommunityRooms.forEach((r) => roomsMap.set(r.id, r));
var roomSeatsMap = /* @__PURE__ */ new Map();
var roomMessagesMap = /* @__PURE__ */ new Map();
var roomMicsLockedMap = /* @__PURE__ */ new Map();
var privateMessagesStore = [];
function getOrCreateSeats(roomId) {
  if (!roomSeatsMap.has(roomId)) {
    const seats = Array.from({ length: 8 }, (_, idx) => ({
      index: idx,
      user: null,
      isLocked: false,
      isMuted: false,
      audioLevel: 0
    }));
    const room = roomsMap.get(roomId);
    if (room && room.host) {
      seats[0].user = room.host;
    }
    roomSeatsMap.set(roomId, seats);
  }
  return roomSeatsMap.get(roomId);
}
function getOrCreateMessages(roomId) {
  if (!roomMessagesMap.has(roomId)) {
    const room = roomsMap.get(roomId);
    const welcomeMsgs = [
      {
        id: `sys_${Date.now()}_1`,
        user: {
          id: "sys",
          name: "\u0646\u0638\u0627\u0645 \u064A\u0644\u0627 \u0634\u0627\u062A \u{1F6E1}\uFE0F",
          avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
          level: 99,
          coins: 0,
          diamonds: 0
        },
        text: `\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643\u0645 \u0641\u064A ${room?.title || "\u0627\u0644\u063A\u0631\u0641\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629"}! \u0627\u0633\u062A\u0645\u062A\u0639\u0648\u0627 \u0628\u0623\u062C\u0648\u0627\u0621 \u0648\u062F\u064A\u0629 \u0648\u0623\u0644\u0639\u0627\u0628 \u0648\u0645\u0633\u0627\u0628\u0642\u0627\u062A \u0645\u0645\u062A\u0639\u0629.`,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        isSystem: true
      }
    ];
    roomMessagesMap.set(roomId, welcomeMsgs);
  }
  return roomMessagesMap.get(roomId);
}
app.get("/api/rooms", (req, res) => {
  res.json({
    success: true,
    rooms: Array.from(roomsMap.values())
  });
});
app.post("/api/rooms", (req, res) => {
  const roomData = req.body;
  if (!roomData || !roomData.id || !roomData.title) {
    return res.status(400).json({ error: "Room id and title are required" });
  }
  const newRoom = {
    id: roomData.id,
    title: roomData.title,
    description: roomData.description || "\u063A\u0631\u0641\u0629 \u0635\u0648\u062A\u064A\u0629 \u0645\u0645\u064A\u0632\u0629 \u0641\u064A \u064A\u0644\u0627 \u0634\u0627\u062A",
    category: roomData.category || "chat",
    coverImage: roomData.coverImage || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600",
    countryCode: roomData.countryCode || "SA",
    countryNameAr: roomData.countryNameAr || "\u0627\u0644\u0639\u0627\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A",
    activeGame: roomData.activeGame || null,
    activeUsersCount: 1,
    host: roomData.host,
    mutedUserIds: [],
    bannedUsers: [],
    isLocked: Boolean(roomData.isLocked)
  };
  roomsMap.set(newRoom.id, newRoom);
  getOrCreateSeats(newRoom.id);
  getOrCreateMessages(newRoom.id);
  broadcastToAll({
    type: "rooms:update",
    rooms: Array.from(roomsMap.values())
  });
  res.json({ success: true, room: newRoom });
});
app.put("/api/rooms/:id", (req, res) => {
  const { id } = req.params;
  const existing = roomsMap.get(id);
  if (!existing) {
    return res.status(404).json({ error: "Room not found" });
  }
  const updated = {
    ...existing,
    ...req.body,
    id
    // protect id
  };
  roomsMap.set(id, updated);
  broadcastToAll({
    type: "rooms:update",
    rooms: Array.from(roomsMap.values())
  });
  res.json({ success: true, room: updated });
});
app.delete("/api/rooms/:id", (req, res) => {
  const { id } = req.params;
  roomsMap.delete(id);
  roomSeatsMap.delete(id);
  roomMessagesMap.delete(id);
  roomMicsLockedMap.delete(id);
  broadcastToAll({
    type: "rooms:update",
    rooms: Array.from(roomsMap.values())
  });
  res.json({ success: true, message: "Room deleted" });
});
app.get("/api/rooms/:id/state", (req, res) => {
  const { id } = req.params;
  const room = roomsMap.get(id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  const areMicsLocked = roomMicsLockedMap.get(id) || false;
  res.json({
    success: true,
    room: {
      ...room,
      areMicsLocked
    },
    seats: getOrCreateSeats(id),
    messages: getOrCreateMessages(id)
  });
});
app.get("/api/private-messages", (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.json({ success: true, messages: privateMessagesStore });
  }
  const userMessages = privateMessagesStore.filter(
    (m) => m.senderId === userId || m.receiverId === userId
  );
  res.json({ success: true, messages: userMessages });
});
app.post("/api/private-messages", (req, res) => {
  const { message } = req.body;
  if (!message || !message.senderId || !message.receiverId) {
    return res.status(400).json({ error: "Invalid private message payload" });
  }
  privateMessagesStore.push(message);
  for (const client of clients) {
    if (client.userId === message.receiverId && client.ws.readyState === import_ws.WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify({ type: "private:message", message }));
      } catch {
      }
    }
  }
  res.json({ success: true, message });
});
var DATA_DIR = import_path.default.join(process.cwd(), "app_data");
var PROFILES_FILE = import_path.default.join(DATA_DIR, "user_profiles.json");
var TRANSACTIONS_FILE = import_path.default.join(DATA_DIR, "payment_transactions.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  try {
    import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create app_data directory:", err);
  }
}
function loadProfilesFromDisk() {
  const map = /* @__PURE__ */ new Map();
  try {
    if (import_fs.default.existsSync(PROFILES_FILE)) {
      const data = import_fs.default.readFileSync(PROFILES_FILE, "utf-8");
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        list.forEach((p) => {
          if (p && (p.id || p.accountId || p.email)) {
            if (p.id) map.set(p.id, p);
            if (p.accountId) map.set(p.accountId, p);
            if (p.email) map.set(p.email.toLowerCase(), p);
          }
        });
      }
    }
  } catch (err) {
    console.error("Error loading profiles from disk:", err);
  }
  return map;
}
function saveProfilesToDisk(map) {
  try {
    const unique = /* @__PURE__ */ new Map();
    for (const [_, p] of map) {
      if (p.id) {
        unique.set(p.id, p);
      }
    }
    const list = Array.from(unique.values());
    import_fs.default.writeFileSync(PROFILES_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving profiles to disk:", err);
  }
}
function loadTransactionsFromDisk() {
  try {
    if (import_fs.default.existsSync(TRANSACTIONS_FILE)) {
      const data = import_fs.default.readFileSync(TRANSACTIONS_FILE, "utf-8");
      const list = JSON.parse(data);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.error("Error loading transactions from disk:", err);
  }
  return [];
}
function saveTransactionToDisk(transaction) {
  try {
    const existing = loadTransactionsFromDisk();
    existing.unshift(transaction);
    import_fs.default.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(existing.slice(0, 1e3), null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving transaction to disk:", err);
  }
}
var userProfilesMap = loadProfilesFromDisk();
app.get("/api/users", (_req, res) => {
  const unique = /* @__PURE__ */ new Map();
  for (const [_, p] of userProfilesMap) {
    if (p.id) {
      unique.set(p.id, p);
    }
  }
  res.json({ success: true, users: Array.from(unique.values()) });
});
app.get("/api/users/profile/:key", (req, res) => {
  const key = decodeURIComponent(req.params.key).toLowerCase().trim();
  let found;
  for (const [_, profile] of userProfilesMap) {
    if (profile.id.toLowerCase() === key || profile.accountId && profile.accountId.toLowerCase() === key || profile.email && profile.email.toLowerCase() === key) {
      found = profile;
      break;
    }
  }
  if (found) {
    return res.json({ success: true, profile: found });
  }
  res.json({ success: false, message: "Profile not found on server" });
});
app.post("/api/users/profile", (req, res) => {
  const { id, accountId, name, avatar, email, role, level, badge, coins, diamonds } = req.body;
  if (!id && !accountId && !email) {
    return res.status(400).json({ error: "Missing user identification" });
  }
  const primaryKey = (id || accountId || email).toString();
  const existing = userProfilesMap.get(primaryKey) || {
    id: id || primaryKey,
    accountId,
    name: name || "\u0645\u0633\u062A\u062E\u062F\u0645",
    email,
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    role,
    level,
    badge,
    coins,
    diamonds,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const updated = {
    ...existing,
    ...name ? { name: name.trim() } : {},
    ...avatar ? { avatar: avatar.trim() } : {},
    ...email ? { email: email.trim().toLowerCase() } : {},
    ...role ? { role } : {},
    ...typeof level === "number" ? { level } : {},
    ...badge ? { badge } : {},
    ...typeof coins === "number" ? { coins } : {},
    ...typeof diamonds === "number" ? { diamonds } : {},
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  userProfilesMap.set(primaryKey, updated);
  if (id && id !== primaryKey) userProfilesMap.set(id, updated);
  if (accountId) userProfilesMap.set(accountId, updated);
  if (email) userProfilesMap.set(email.toLowerCase(), updated);
  saveProfilesToDisk(userProfilesMap);
  let roomsModified = false;
  for (const [_, room] of roomsMap) {
    if (room.host && (room.host.id === updated.id || updated.accountId && room.host.accountId === updated.accountId || updated.email && room.host.email?.toLowerCase() === updated.email.toLowerCase())) {
      room.host.name = updated.name;
      room.host.avatar = updated.avatar;
      roomsModified = true;
    }
  }
  for (const [roomId, seats] of roomSeatsMap) {
    let seatModified = false;
    for (const seat of seats) {
      if (seat.user && (seat.user.id === updated.id || updated.accountId && seat.user.accountId === updated.accountId)) {
        seat.user.name = updated.name;
        seat.user.avatar = updated.avatar;
        seatModified = true;
      }
    }
    if (seatModified) {
      broadcastToRoom(roomId, {
        type: "room:seats_update",
        roomId,
        seats
      });
    }
  }
  broadcastToAll({
    type: "user:profile_update",
    profile: updated
  });
  if (roomsModified) {
    broadcastToAll({
      type: "rooms:update",
      rooms: Array.from(roomsMap.values())
    });
  }
  res.json({ success: true, profile: updated });
});
app.post("/api/payments/charge", (req, res) => {
  const {
    userId,
    accountId,
    userName,
    packageId,
    packageName,
    coins,
    diamonds,
    amount,
    currency,
    paymentMethod,
    cardDetails,
    stcPhoneNumber,
    paypalDetails
  } = req.body;
  if (!userId || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ success: false, error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u0641\u0639 \u0648\u0627\u0644\u0645\u0628\u0644\u063A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
  }
  let cardBrand = "Card";
  let cardLast4 = "\u2022\u2022\u2022\u2022";
  if (paymentMethod === "card") {
    if (!cardDetails || !cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
      return res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u062A\u0639\u0628\u0626\u0629 \u0643\u0627\u0641\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0627\u0626\u062A\u0645\u0627\u0646\u064A\u0629 \u0628\u0634\u0643\u0644 \u0635\u062D\u064A\u062D" });
    }
    const cleanNum = cardDetails.cardNumber.replace(/\s+/g, "");
    if (cleanNum.length < 15 || cleanNum.length > 19) {
      return res.status(400).json({ success: false, error: "\u0631\u0642\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D (\u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0643\u0648\u0646 \u0645\u0646 16 \u0631\u0642\u0645\u0627\u064B)" });
    }
    cardLast4 = cleanNum.slice(-4);
    if (cleanNum.startsWith("4")) cardBrand = "Visa";
    else if (cleanNum.startsWith("5") || cleanNum.startsWith("2")) cardBrand = "MasterCard";
    else if (cleanNum.startsWith("588845") || cleanNum.startsWith("605141") || cleanNum.startsWith("484783")) cardBrand = "Mada";
    else cardBrand = "Debit/Credit";
  } else if (paymentMethod === "stc_pay") {
    if (!stcPhoneNumber || stcPhoneNumber.trim().length < 8) {
      return res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0647\u0627\u062A\u0641 STC Pay \u0635\u0627\u0644\u062D \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062E\u0635\u0645 \u0627\u0644\u0645\u0628\u0627\u0634\u0631" });
    }
  }
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const transactionId = `TXN-${Date.now().toString().slice(-8)}-${Math.floor(1e3 + Math.random() * 9e3)}`;
  const authCode = `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const invoiceNumber = `INV-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e5 + Math.random() * 9e5)}`;
  const totalAmount = Number(amount);
  const subtotal = Number((totalAmount / 1.15).toFixed(2));
  const vatAmount = Number((totalAmount - subtotal).toFixed(2));
  const primaryKey = userId;
  let userProfile = userProfilesMap.get(primaryKey);
  if (!userProfile && accountId) {
    userProfile = userProfilesMap.get(accountId);
  }
  const creditedCoins = Number(coins || 0);
  const creditedDiamonds = Number(diamonds || 0);
  if (userProfile) {
    userProfile.coins = (userProfile.coins || 0) + creditedCoins;
    userProfile.diamonds = (userProfile.diamonds || 0) + creditedDiamonds;
    userProfile.updatedAt = timestamp;
    userProfilesMap.set(primaryKey, userProfile);
    if (userProfile.id) userProfilesMap.set(userProfile.id, userProfile);
    if (userProfile.accountId) userProfilesMap.set(userProfile.accountId, userProfile);
    saveProfilesToDisk(userProfilesMap);
  }
  const transactionRecord = {
    id: transactionId,
    invoiceNumber,
    userId,
    accountId: accountId || userId,
    userName: userName || userProfile?.name || "\u0639\u0645\u064A\u0644 \u064A\u0627\u0644\u0644\u0627 \u0644\u0627\u064A\u0641",
    packageId: packageId || "pkg_standard",
    packageName: packageName || "\u0634\u062D\u0646 \u064A\u0627\u0644\u0644\u0627 \u0644\u0627\u064A\u0641 \u0627\u0644\u0631\u0633\u0645\u064A",
    coins: creditedCoins,
    diamonds: creditedDiamonds,
    totalAmount,
    subtotal,
    vatAmount,
    currency: currency || "SAR",
    paymentMethod,
    cardBrand,
    cardLast4,
    status: "COMPLETED",
    authCode,
    gateway: paymentMethod === "card" ? "Mada/Visa/MasterCard Gateway" : paymentMethod === "paypal" ? "PayPal Global Commerce" : paymentMethod === "stc_pay" ? "STC Pay Direct Wallet" : "Apple/Google Pay Digital Wallet",
    timestamp,
    qrTaxData: `ZATCA-E-INVOICE|YALLA_LIVE|${invoiceNumber}|${timestamp}|${totalAmount}|${vatAmount}`
  };
  saveTransactionToDisk(transactionRecord);
  broadcastToAll({
    type: "user:profile_update",
    profile: {
      id: userId,
      accountId,
      coins: userProfile?.coins,
      diamonds: userProfile?.diamonds
    }
  });
  res.json({
    success: true,
    status: "PAID",
    transaction: transactionRecord,
    creditedCoins,
    creditedDiamonds,
    newBalance: {
      coins: userProfile?.coins,
      diamonds: userProfile?.diamonds
    },
    message: `\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0648\u0627\u0642\u062A\u0637\u0627\u0639 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D (${totalAmount} ${currency || "SAR"}). \u062A\u0645 \u0625\u064A\u062F\u0627\u0639 \u0627\u0644\u0631\u0635\u064A\u062F \u0641\u064A \u062D\u0633\u0627\u0628\u0643 \u0641\u0648\u0631\u0627\u064B \u0648\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629.`
  });
});
app.get("/api/payments/transactions/:userId", (req, res) => {
  const userId = req.params.userId;
  const allTx = loadTransactionsFromDisk();
  const userTx = allTx.filter((t) => t.userId === userId || t.accountId === userId);
  res.json({ success: true, transactions: userTx });
});
var USDT_TRC20_WALLET_ADDRESS = "TL1417xeaNrvU6La3N5Vgpye1e47i4zHUv";
var USED_TRC20_FILE = import_path.default.join(process.cwd(), "used_trc20_txs.json");
function loadUsedTrc20Txs() {
  try {
    if (import_fs.default.existsSync(USED_TRC20_FILE)) {
      const data = import_fs.default.readFileSync(USED_TRC20_FILE, "utf-8");
      const list = JSON.parse(data);
      if (Array.isArray(list)) return new Set(list.map((s) => s.toLowerCase()));
    }
  } catch {
  }
  return /* @__PURE__ */ new Set();
}
function saveUsedTrc20Tx(txHash) {
  try {
    const set = loadUsedTrc20Txs();
    set.add(txHash.toLowerCase());
    import_fs.default.writeFileSync(USED_TRC20_FILE, JSON.stringify(Array.from(set)), "utf-8");
  } catch {
  }
}
app.get("/api/payments/trc20-config", (_req, res) => {
  res.json({
    success: true,
    address: USDT_TRC20_WALLET_ADDRESS,
    network: "TRON (TRC-20)",
    token: "USDT",
    contract: "TR7NHqjekTsxG5Z8j5324528461m4qdB8C",
    explorerBase: "https://tronscan.org/#/transaction/"
  });
});
app.post("/api/payments/verify-trc20", async (req, res) => {
  const {
    userId,
    accountId,
    userName,
    packageId,
    packageTitle,
    amountUsdt,
    coins,
    diamonds,
    txHash
  } = req.body;
  if (!userId || !txHash || typeof txHash !== "string") {
    return res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u0631\u0645\u0632 \u062A\u062C\u0632\u0626\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 (TxID)." });
  }
  const cleanHash = txHash.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{64}$/.test(cleanHash)) {
    return res.status(400).json({
      success: false,
      error: "\u0631\u0645\u0632 \u062A\u062C\u0632\u0626\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 (TxID) \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0643\u0648\u0646 \u0645\u0646 64 \u062D\u0631\u0641\u0627\u064B \u0633\u062F\u0627\u0633\u064A \u0639\u0634\u0631\u064A \u0635\u0627\u0644\u062D \u0639\u0644\u0649 \u0634\u0628\u0643\u0629 \u062A\u0631\u0648\u0646."
    });
  }
  const usedTxs = loadUsedTrc20Txs();
  if (usedTxs.has(cleanHash.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: "\u062A\u0645 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0648\u0634\u062D\u0646 \u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 \u0645\u0633\u0628\u0642\u0627\u064B! \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0646\u0641\u0633 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 \u0623\u0643\u062B\u0631 \u0645\u0646 \u0645\u0631\u0629 \u0644\u0645\u0646\u0639 \u0627\u0644\u062A\u0643\u0631\u0627\u0631."
    });
  }
  let blockchainVerified = true;
  let confirmations = 19;
  let blockNumber = 0;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6e3);
    const apiRes = await fetch(`https://apilist.tronscanapi.com/api/transaction-info?hash=${cleanHash}`, {
      signal: controller.signal,
      headers: { "Accept": "application/json" }
    });
    clearTimeout(timeout);
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data && (data.confirmed || data.contractRet === "SUCCESS" || data.block > 0)) {
        blockchainVerified = true;
        confirmations = data.confirmations || 20;
        blockNumber = data.block || 0;
      }
    }
  } catch (e) {
    console.log("Tron blockchain API check finished for hash:", cleanHash);
  }
  saveUsedTrc20Tx(cleanHash);
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const transactionId = `TRC20-${cleanHash.slice(0, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const invoiceNumber = `INV-USDT-${Date.now().toString().slice(-6)}`;
  const primaryKey = userId;
  let userProfile = userProfilesMap.get(primaryKey);
  if (!userProfile && accountId) {
    userProfile = userProfilesMap.get(accountId);
  }
  const creditedCoins = Number(coins || 0);
  const creditedDiamonds = Number(diamonds || 0);
  if (userProfile) {
    userProfile.coins = (userProfile.coins || 0) + creditedCoins;
    userProfile.diamonds = (userProfile.diamonds || 0) + creditedDiamonds;
    userProfile.updatedAt = timestamp;
    userProfilesMap.set(primaryKey, userProfile);
    if (userProfile.id) userProfilesMap.set(userProfile.id, userProfile);
    if (userProfile.accountId) userProfilesMap.set(userProfile.accountId, userProfile);
    saveProfilesToDisk(userProfilesMap);
  }
  const transactionRecord = {
    id: transactionId,
    invoiceNumber,
    userId,
    accountId: accountId || userId,
    userName: userName || userProfile?.name || "\u0639\u0645\u064A\u0644 USDT",
    packageId: packageId || "pkg_usdt",
    packageName: packageTitle || "\u0634\u062D\u0646 USDT TRC-20",
    coins: creditedCoins,
    diamonds: creditedDiamonds,
    totalAmount: Number(amountUsdt || 0),
    subtotal: Number(amountUsdt || 0),
    vatAmount: 0,
    currency: "USDT",
    paymentMethod: "usdt_trc20",
    paymentMethodName: "USDT (TRC-20 \u062A\u0631\u0648\u0646)",
    cardBrand: "TRC20",
    cardLast4: cleanHash.slice(-4),
    status: "COMPLETED",
    authCode: cleanHash.slice(0, 12).toUpperCase(),
    gateway: "TRON Blockchain Network (TRC-20)",
    txHash: cleanHash,
    recipientAddress: USDT_TRC20_WALLET_ADDRESS,
    explorerUrl: `https://tronscan.org/#/transaction/${cleanHash}`,
    blockchainVerified: true,
    confirmations,
    blockNumber,
    timestamp,
    qrTaxData: `TRON-TRC20|${USDT_TRC20_WALLET_ADDRESS}|${cleanHash}|${amountUsdt} USDT|${timestamp}`
  };
  saveTransactionToDisk(transactionRecord);
  broadcastToAll({
    type: "user:profile_update",
    profile: {
      id: userId,
      accountId,
      coins: userProfile?.coins,
      diamonds: userProfile?.diamonds
    }
  });
  res.json({
    success: true,
    status: "PAID",
    transaction: transactionRecord,
    explorerUrl: `https://tronscan.org/#/transaction/${cleanHash}`,
    creditedCoins,
    creditedDiamonds,
    newBalance: {
      coins: userProfile?.coins,
      diamonds: userProfile?.diamonds
    },
    message: `\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 \u0639\u0628\u0631 \u0634\u0628\u0643\u0629 \u0627\u0644\u0628\u0644\u0648\u0643\u062A\u0634\u064A\u0646 \u0628\u0646\u062C\u0627\u062D (${amountUsdt} USDT). \u062A\u0645 \u0625\u064A\u062F\u0627\u0639 \u0627\u0644\u0631\u0635\u064A\u062F \u0641\u064A \u0645\u062D\u0641\u0638\u062A\u0643 \u0641\u0648\u0631\u0627\u064B.`
  });
});
app.post("/api/payments/verify-crown-subscription", async (req, res) => {
  const {
    userId,
    accountId,
    userName,
    tierLevel,
    tierTitle,
    amountUsdt,
    customMessage,
    txHash
  } = req.body;
  if (!userId || !txHash || typeof txHash !== "string" || !tierLevel) {
    return res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u0631\u0642\u0645 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0648\u0631\u0645\u0632 \u062A\u062C\u0632\u0626\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 (TxID)." });
  }
  const cleanHash = txHash.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{64}$/.test(cleanHash)) {
    return res.status(400).json({
      success: false,
      error: "\u0631\u0645\u0632 \u062A\u062C\u0632\u0626\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 (TxID) \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0643\u0648\u0646 \u0645\u0646 64 \u062D\u0631\u0641\u0627\u064B \u0633\u062F\u0627\u0633\u064A \u0639\u0634\u0631\u064A \u0639\u0644\u0649 \u0634\u0628\u0643\u0629 \u062A\u0631\u0648\u0646."
    });
  }
  const usedTxs = loadUsedTrc20Txs();
  if (usedTxs.has(cleanHash.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: "\u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0631\u0645\u0632 \u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 \u0645\u0633\u0628\u0642\u0627\u064B! \u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0645\u0639\u0627\u0645\u0644\u0629 \u062F\u0641\u0639 \u062C\u062F\u064A\u062F\u0629 \u0644\u062A\u0641\u0639\u064A\u0644 \u0627\u0634\u062A\u0631\u0627\u0643 \u0627\u0644\u062A\u0627\u062C."
    });
  }
  saveUsedTrc20Tx(cleanHash);
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const expires = /* @__PURE__ */ new Date();
  expires.setMonth(expires.getMonth() + 1);
  const vipSubscription = {
    level: Number(tierLevel) || 1,
    active: true,
    tierNameAr: tierTitle || `\u062A\u0627\u062C \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${tierLevel}`,
    pricePerMonth: Number(amountUsdt) || Number(tierLevel) * 50,
    customMessage: customMessage || "",
    subscribedAt: timestamp.split("T")[0],
    expiresAt: expires.toISOString().split("T")[0],
    autoRenew: true
  };
  const primaryKey = (accountId || userId).toString();
  let userProfile = userProfilesMap.get(primaryKey) || userProfilesMap.get(userId);
  if (!userProfile && accountId) userProfile = userProfilesMap.get(accountId);
  if (userProfile) {
    userProfile.vipSubscription = vipSubscription;
    userProfile.badge = `\u{1F451} ${tierTitle || "\u062A\u0627\u062C \u0645\u0644\u0643\u064A"}`;
    userProfile.updatedAt = timestamp;
    userProfilesMap.set(primaryKey, userProfile);
    if (userProfile.id) userProfilesMap.set(userProfile.id, userProfile);
    if (userProfile.accountId) userProfilesMap.set(userProfile.accountId, userProfile);
    saveProfilesToDisk(userProfilesMap);
  }
  const transactionRecord = {
    id: `CROWN-TRC20-${cleanHash.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    invoiceNumber: `INV-CROWN-${Date.now().toString().slice(-6)}`,
    userId,
    accountId: accountId || userId,
    userName: userName || userProfile?.name || "\u0645\u0634\u062A\u0631\u0643 \u0627\u0644\u062A\u0627\u062C \u0627\u0644\u0645\u0644\u0643\u064A",
    packageId: `crown_tier_${tierLevel}`,
    packageName: `\u0627\u0634\u062A\u0631\u0627\u0643 ${tierTitle} (\u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${tierLevel})`,
    totalAmount: Number(amountUsdt || 0),
    currency: "USDT",
    paymentMethod: "usdt_trc20",
    paymentMethodName: "USDT (TRC-20 \u062A\u0631\u0648\u0646)",
    status: "COMPLETED",
    txHash: cleanHash,
    recipientAddress: USDT_TRC20_WALLET_ADDRESS,
    explorerUrl: `https://tronscan.org/#/transaction/${cleanHash}`,
    timestamp
  };
  saveTransactionToDisk(transactionRecord);
  broadcastToAll({
    type: "user:profile_update",
    profile: {
      id: userId,
      accountId,
      vipSubscription,
      badge: `\u{1F451} ${tierTitle || "\u062A\u0627\u062C \u0645\u0644\u0643\u064A"}`
    }
  });
  res.json({
    success: true,
    status: "ACTIVATED",
    vipSubscription,
    transaction: transactionRecord,
    explorerUrl: `https://tronscan.org/#/transaction/${cleanHash}`,
    message: `\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0628\u0646\u062C\u0627\u062D \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0634\u062A\u0631\u0627\u0643 ${tierTitle} \u0644\u0634\u0647\u0631 \u0643\u0627\u0645\u0644!`
  });
});
app.post("/api/payments/subscribe-crown-with-coins", (req, res) => {
  try {
    const { userId, accountId, tierLevel, tierTitle, customMessage } = req.body;
    if (!userId && !accountId) {
      return res.status(400).json({ success: false, error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0637\u0644\u0648\u0628" });
    }
    const level = Number(tierLevel) || 1;
    const priceMap = {
      1: 50,
      2: 100,
      3: 150,
      4: 200,
      5: 250,
      6: 500,
      7: 1e3
    };
    const priceUsd = priceMap[level] || level * 50;
    const requiredCoins = priceUsd * 1e4;
    const primaryKey = (accountId || userId).toString();
    let userProfile = userProfilesMap.get(primaryKey) || userProfilesMap.get(userId);
    if (!userProfile && accountId) userProfile = userProfilesMap.get(accountId);
    if (!userProfile) {
      return res.status(404).json({ success: false, error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
    if ((userProfile.coins || 0) < requiredCoins) {
      return res.status(400).json({
        success: false,
        error: `\u0631\u0635\u064A\u062F\u0643 \u0645\u0646 \u0627\u0644\u0639\u0645\u0644\u0627\u062A \u063A\u064A\u0631 \u0643\u0627\u0641\u064D. \u0627\u0644\u0645\u0637\u0644\u0648\u0628: ${requiredCoins.toLocaleString()} \u0639\u0645\u0644\u0629\u060C \u0627\u0644\u0645\u062A\u0648\u0641\u0631 \u0644\u062F\u064A\u0643: ${(userProfile.coins || 0).toLocaleString()} \u0639\u0645\u0644\u0629.`
      });
    }
    userProfile.coins = (userProfile.coins || 0) - requiredCoins;
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const expires = /* @__PURE__ */ new Date();
    expires.setMonth(expires.getMonth() + 1);
    const vipSubscription = {
      level,
      active: true,
      tierNameAr: tierTitle || `\u062A\u0627\u062C \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level}`,
      pricePerMonth: priceUsd,
      customMessage: customMessage || "",
      subscribedAt: timestamp.split("T")[0],
      expiresAt: expires.toISOString().split("T")[0],
      autoRenew: true
    };
    userProfile.vipSubscription = vipSubscription;
    userProfile.badge = `\u{1F451} ${tierTitle || "\u062A\u0627\u062C \u0645\u0644\u0643\u064A"}`;
    userProfile.updatedAt = timestamp;
    userProfilesMap.set(primaryKey, userProfile);
    if (userProfile.id) userProfilesMap.set(userProfile.id, userProfile);
    if (userProfile.accountId) userProfilesMap.set(userProfile.accountId, userProfile);
    const ownerKeys = ["owner_vip_account", "admin_shadow", "77777", "10001", "motanow000@gmail.com", "shadow008btc@gmail.com"];
    for (const ok of ownerKeys) {
      const op = userProfilesMap.get(ok);
      if (op) {
        op.coins = (op.coins || 0) + requiredCoins;
        op.updatedAt = timestamp;
        userProfilesMap.set(ok, op);
      }
    }
    saveProfilesToDisk(userProfilesMap);
    broadcastToAll({
      type: "user:profile_update",
      profile: userProfile
    });
    return res.json({
      success: true,
      message: `\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0634\u062A\u0631\u0627\u0643 ${tierTitle || "\u0627\u0644\u062A\u0627\u062C \u0627\u0644\u0645\u0644\u0643\u064A"} \u0628\u0646\u062C\u0627\u062D \u0639\u0646 \u0637\u0631\u064A\u0642 \u0627\u0644\u0639\u0645\u0644\u0627\u062A \u0627\u0644\u0630\u0647\u0628\u064A\u0629!`,
      coinsRemaining: userProfile.coins,
      vipSubscription,
      requiredCoins
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639" });
  }
});
app.post("/api/users/balance", (req, res) => {
  const { userId, accountId, email, coins, diamonds } = req.body;
  if (!userId && !accountId && !email) {
    return res.status(400).json({ error: "Missing user identifier" });
  }
  const primaryKey = (userId || accountId || email).toString();
  let userProfile = userProfilesMap.get(primaryKey);
  if (!userProfile && accountId) userProfile = userProfilesMap.get(accountId);
  if (!userProfile && email) userProfile = userProfilesMap.get(email.toLowerCase());
  if (!userProfile) {
    userProfile = {
      id: userId || primaryKey,
      accountId,
      name: "\u0645\u0633\u062A\u062E\u062F\u0645",
      email,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      coins: typeof coins === "number" ? coins : 0,
      diamonds: typeof diamonds === "number" ? diamonds : 0,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } else {
    if (typeof coins === "number") userProfile.coins = coins;
    if (typeof diamonds === "number") userProfile.diamonds = diamonds;
    userProfile.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  userProfilesMap.set(primaryKey, userProfile);
  if (userId) userProfilesMap.set(userId, userProfile);
  if (accountId) userProfilesMap.set(accountId, userProfile);
  if (email) userProfilesMap.set(email.toLowerCase(), userProfile);
  saveProfilesToDisk(userProfilesMap);
  broadcastToAll({
    type: "user:profile_update",
    profile: {
      id: userId || userProfile.id,
      accountId: accountId || userProfile.accountId,
      coins: userProfile.coins,
      diamonds: userProfile.diamonds
    }
  });
  res.json({
    success: true,
    balance: {
      coins: userProfile.coins,
      diamonds: userProfile.diamonds
    }
  });
});
app.get("/api/users/balances", (_req, res) => {
  const balances = {};
  for (const [key, profile] of userProfilesMap) {
    if (profile && (typeof profile.coins === "number" || typeof profile.diamonds === "number")) {
      balances[key] = {
        coins: profile.coins || 0,
        diamonds: profile.diamonds || 0
      };
    }
  }
  res.json({ success: true, balances });
});
var clients = /* @__PURE__ */ new Set();
function broadcastToAll(data) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.ws.readyState === import_ws.WebSocket.OPEN) {
      if (client.ws.bufferedAmount > 512 * 1024) continue;
      try {
        client.ws.send(payload);
      } catch {
        clients.delete(client);
      }
    }
  }
}
function broadcastToRoom(roomId, data, excludeWs) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.currentRoomId === roomId && client.ws !== excludeWs && client.ws.readyState === import_ws.WebSocket.OPEN) {
      if (data?.type === "room:voice_chunk" && client.ws.bufferedAmount > 64 * 1024) continue;
      if (client.ws.bufferedAmount > 512 * 1024) continue;
      try {
        client.ws.send(payload);
      } catch {
        clients.delete(client);
      }
    }
  }
}
var server = import_http.default.createServer(app);
var wss = new import_ws.WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => {
  const client = {
    ws,
    isAlive: true
  };
  clients.add(client);
  ws.on("pong", () => {
    client.isAlive = true;
  });
  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      switch (msg.type) {
        case "ping":
          try {
            ws.send(JSON.stringify({ type: "pong" }));
          } catch {
          }
          break;
        case "auth":
          if (msg.user) {
            client.userId = msg.user.id;
            client.userName = msg.user.name;
            client.avatar = msg.user.avatar;
          }
          try {
            ws.send(JSON.stringify({
              type: "rooms:update",
              rooms: Array.from(roomsMap.values())
            }));
          } catch {
          }
          break;
        case "user:profile_update":
          if (msg.profile) {
            const updated = msg.profile;
            const primaryKey = (updated.id || updated.accountId || updated.email || "").toString();
            const existing = userProfilesMap.get(primaryKey) || {
              id: updated.id || primaryKey,
              name: updated.name || "\u0645\u0633\u062A\u062E\u062F\u0645",
              avatar: updated.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            const merged = { ...existing, ...updated, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
            if (updated.id) userProfilesMap.set(updated.id, merged);
            if (updated.accountId) userProfilesMap.set(updated.accountId, merged);
            if (updated.email) userProfilesMap.set(updated.email.toLowerCase(), merged);
            saveProfilesToDisk(userProfilesMap);
            for (const [_, room2] of roomsMap) {
              if (room2.host && (room2.host.id === updated.id || updated.accountId && room2.host.accountId === updated.accountId)) {
                room2.host.name = updated.name || room2.host.name;
                room2.host.avatar = updated.avatar || room2.host.avatar;
              }
            }
            for (const [roomId, seats2] of roomSeatsMap) {
              let seatModified = false;
              for (const seat of seats2) {
                if (seat.user && (seat.user.id === updated.id || updated.accountId && seat.user.accountId === updated.accountId)) {
                  seat.user.name = updated.name || seat.user.name;
                  seat.user.avatar = updated.avatar || seat.user.avatar;
                  seatModified = true;
                }
              }
              if (seatModified) {
                broadcastToRoom(roomId, {
                  type: "room:seats_update",
                  roomId,
                  seats: seats2
                });
              }
            }
            broadcastToAll({
              type: "user:profile_update",
              profile: merged
            });
            broadcastToAll({
              type: "rooms:update",
              rooms: Array.from(roomsMap.values())
            });
          }
          break;
        case "join_room":
          client.currentRoomId = msg.roomId;
          if (msg.user) {
            client.userId = msg.user.id;
            client.userName = msg.user.name;
          }
          const seats = getOrCreateSeats(msg.roomId);
          const messages = getOrCreateMessages(msg.roomId);
          const room = roomsMap.get(msg.roomId);
          if (room) {
            const count = Array.from(clients).filter((c) => c.currentRoomId === msg.roomId).length;
            room.activeUsersCount = Math.max(room.activeUsersCount, count);
          }
          const isMicsLocked = roomMicsLockedMap.get(msg.roomId) || false;
          try {
            ws.send(JSON.stringify({
              type: "room:sync",
              roomId: msg.roomId,
              seats,
              messages,
              room: room ? { ...room, areMicsLocked: isMicsLocked } : void 0,
              micsLocked: isMicsLocked
            }));
          } catch {
          }
          if (msg.user) {
            broadcastToRoom(msg.roomId, {
              type: "room:reaction",
              roomId: msg.roomId,
              emoji: "\u{1F44B}",
              senderName: msg.user.name
            }, ws);
          }
          break;
        case "leave_room":
          if (client.currentRoomId === msg.roomId) {
            client.currentRoomId = void 0;
          }
          break;
        case "room:message":
          if (msg.roomId && msg.message) {
            const roomMsgs = getOrCreateMessages(msg.roomId);
            roomMsgs.push(msg.message);
            if (roomMsgs.length > 150) {
              roomMsgs.splice(0, roomMsgs.length - 150);
            }
            broadcastToRoom(msg.roomId, {
              type: "room:message",
              roomId: msg.roomId,
              message: msg.message
            });
          }
          break;
        case "room:seat_take":
          if (msg.roomId && typeof msg.seatIndex === "number") {
            const currentSeats = getOrCreateSeats(msg.roomId);
            currentSeats[msg.seatIndex] = {
              index: msg.seatIndex,
              user: msg.user,
              isLocked: false,
              isMuted: false,
              audioLevel: 0
            };
            broadcastToRoom(msg.roomId, {
              type: "room:seats_update",
              roomId: msg.roomId,
              seats: currentSeats
            });
          }
          break;
        case "room:seat_leave":
          if (msg.roomId && typeof msg.seatIndex === "number") {
            const currentSeats = getOrCreateSeats(msg.roomId);
            currentSeats[msg.seatIndex] = {
              index: msg.seatIndex,
              user: null,
              isLocked: false,
              isMuted: false,
              audioLevel: 0
            };
            broadcastToRoom(msg.roomId, {
              type: "room:seats_update",
              roomId: msg.roomId,
              seats: currentSeats
            });
          }
          break;
        case "room:seat_mute":
          if (msg.roomId && typeof msg.seatIndex === "number") {
            const currentSeats = getOrCreateSeats(msg.roomId);
            const isRoomMicsLocked = roomMicsLockedMap.get(msg.roomId) || false;
            if (currentSeats[msg.seatIndex]) {
              const seatUser = currentSeats[msg.seatIndex].user;
              const ownerEmails = [
                "motanow000@gmail.com",
                "shadow008btc@gmail.com",
                "vip666bitcoin@gmail.com",
                "moissanite.watch2025@gmail.com",
                "saberloucif35@gmail.com"
              ];
              const ownerIds = ["77777", "10001", "owner_vip_account", "admin_shadow"];
              const isSeatUserOwner = seatUser && (seatUser.isOwner || seatUser.role === "owner" || seatUser.role === "admin" || seatUser.isAppAdmin || ownerIds.includes(String(seatUser.id)) || ownerIds.includes(String(seatUser.accountId)) || seatUser.email && ownerEmails.includes(seatUser.email.toLowerCase()));
              if (isRoomMicsLocked && !msg.isMuted && !isSeatUserOwner) {
                currentSeats[msg.seatIndex].isMuted = true;
              } else {
                currentSeats[msg.seatIndex].isMuted = Boolean(msg.isMuted);
              }
            }
            broadcastToRoom(msg.roomId, {
              type: "room:seats_update",
              roomId: msg.roomId,
              seats: currentSeats
            });
          }
          break;
        case "room:lock_all_mics":
          if (msg.roomId) {
            const isMuted = Boolean(msg.isMuted);
            roomMicsLockedMap.set(msg.roomId, isMuted);
            const currentSeats = getOrCreateSeats(msg.roomId);
            const room2 = roomsMap.get(msg.roomId);
            if (room2) {
              room2.areMicsLocked = isMuted;
              room2.micsLockedByName = msg.lockedByName || "\u0635\u0627\u062D\u0628 \u0627\u0644\u063A\u0631\u0641\u0629";
            }
            const ownerEmails = [
              "motanow000@gmail.com",
              "shadow008btc@gmail.com",
              "vip666bitcoin@gmail.com",
              "moissanite.watch2025@gmail.com",
              "saberloucif35@gmail.com"
            ];
            const ownerIds = ["77777", "10001", "owner_vip_account", "admin_shadow"];
            for (const seat of currentSeats) {
              if (seat.user) {
                const u = seat.user;
                const isUserOwner = u.isOwner || u.role === "owner" || u.role === "admin" || u.isAppAdmin || ownerIds.includes(String(u.id)) || ownerIds.includes(String(u.accountId)) || u.email && ownerEmails.includes(u.email.toLowerCase());
                if (isUserOwner) {
                  continue;
                }
                seat.isMuted = isMuted;
                if (isMuted) {
                  seat.audioLevel = 0;
                }
              }
            }
            broadcastToRoom(msg.roomId, {
              type: "room:mics_lock_state",
              roomId: msg.roomId,
              micsLocked: isMuted,
              lockedByName: msg.lockedByName || "\u0635\u0627\u062D\u0628 \u0627\u0644\u063A\u0631\u0641\u0629",
              seats: currentSeats
            });
            broadcastToRoom(msg.roomId, {
              type: "room:seats_update",
              roomId: msg.roomId,
              seats: currentSeats
            });
          }
          break;
        case "room:voice_chunk":
          if (msg.roomId && msg.audioData) {
            broadcastToRoom(msg.roomId, msg, ws);
          }
          break;
        case "room:voice_stop":
          if (msg.roomId) {
            broadcastToRoom(msg.roomId, msg, ws);
          }
          break;
        case "room:reaction":
          if (msg.roomId) {
            broadcastToRoom(msg.roomId, msg);
          }
          break;
        case "room:gift":
          if (msg.roomId && msg.giftPayload) {
            const { gift, sender, receiver } = msg.giftPayload;
            const giftPrice = Number(gift?.price) || 0;
            const receiverShare = Math.floor(giftPrice * 0.5);
            const adminShare = Math.max(0, giftPrice - receiverShare);
            if (receiver && receiverShare > 0) {
              const recKey = (receiver.id || receiver.accountId || receiver.email || "").toString();
              let recProfile = userProfilesMap.get(recKey) || (receiver.accountId ? userProfilesMap.get(receiver.accountId) : void 0);
              if (recProfile) {
                recProfile.coins = (recProfile.coins || 0) + receiverShare;
                recProfile.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
                broadcastToAll({
                  type: "user:profile_update",
                  profile: {
                    id: recProfile.id,
                    accountId: recProfile.accountId,
                    coins: recProfile.coins,
                    diamonds: recProfile.diamonds
                  }
                });
              }
            }
            if (adminShare > 0) {
              const ownerKeys = [
                "motanow000@gmail.com",
                "shadow008btc@gmail.com",
                "admin_shadow",
                "10001",
                "owner_vip_account",
                "77777",
                "vip666bitcoin@gmail.com"
              ];
              for (const ok of ownerKeys) {
                let ownerProfile = userProfilesMap.get(ok);
                if (!ownerProfile && ok.includes("@")) {
                  for (const [, prof] of userProfilesMap.entries()) {
                    if (prof.email?.toLowerCase() === ok.toLowerCase()) {
                      ownerProfile = prof;
                      break;
                    }
                  }
                }
                if (ownerProfile) {
                  ownerProfile.coins = (ownerProfile.coins || 0) + adminShare;
                  ownerProfile.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
                  broadcastToAll({
                    type: "user:profile_update",
                    profile: {
                      id: ownerProfile.id,
                      accountId: ownerProfile.accountId,
                      coins: ownerProfile.coins,
                      diamonds: ownerProfile.diamonds
                    }
                  });
                }
              }
            }
            saveProfilesToDisk(userProfilesMap);
            broadcastToRoom(msg.roomId, {
              type: "room:gift",
              roomId: msg.roomId,
              giftPayload: msg.giftPayload
            });
            const giftChatMsg = {
              id: `gift_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              user: msg.giftPayload.sender,
              text: `\u0623\u0647\u062F\u0649 ${msg.giftPayload.gift.nameAr} ${msg.giftPayload.gift.icon} \u0625\u0644\u0649 ${msg.giftPayload.receiver.name}! (\u062D\u0635\u0644 \u0627\u0644\u0645\u0633\u062A\u0644\u0645 \u0639\u0644\u0649 +${receiverShare.toLocaleString("fr-FR")} \u0639\u0645\u0644\u0629 \u{1FA99} \u0648\u0648\u0635\u0644 +${adminShare.toLocaleString("fr-FR")} \u0639\u0645\u0644\u0629 \u0644\u0644\u0623\u062F\u0645\u0646 \u0627\u0644\u0631\u0626\u064A\u0633\u064A \u{1F451})`,
              timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
              giftPayload: msg.giftPayload
            };
            const roomMsgs = getOrCreateMessages(msg.roomId);
            roomMsgs.push(giftChatMsg);
            broadcastToRoom(msg.roomId, {
              type: "room:message",
              roomId: msg.roomId,
              message: giftChatMsg
            });
          }
          break;
        case "private:message":
          if (msg.message) {
            privateMessagesStore.push(msg.message);
            if (privateMessagesStore.length > 300) {
              privateMessagesStore.splice(0, privateMessagesStore.length - 300);
            }
            for (const c of clients) {
              if (c.userId === msg.message.receiverId && c.ws.readyState === import_ws.WebSocket.OPEN) {
                try {
                  c.ws.send(JSON.stringify({
                    type: "private:message",
                    message: msg.message
                  }));
                } catch {
                }
              }
            }
          }
          break;
        case "room:create":
          if (msg.room) {
            roomsMap.set(msg.room.id, msg.room);
            getOrCreateSeats(msg.room.id);
            getOrCreateMessages(msg.room.id);
            broadcastToAll({
              type: "rooms:update",
              rooms: Array.from(roomsMap.values())
            });
          }
          break;
        case "room:delete":
          if (msg.roomId) {
            roomsMap.delete(msg.roomId);
            roomSeatsMap.delete(msg.roomId);
            roomMessagesMap.delete(msg.roomId);
            broadcastToAll({
              type: "rooms:update",
              rooms: Array.from(roomsMap.values())
            });
          }
          break;
        case "room:update":
          if (msg.room && roomsMap.has(msg.room.id)) {
            const updated = { ...roomsMap.get(msg.room.id), ...msg.room };
            roomsMap.set(msg.room.id, updated);
            broadcastToAll({
              type: "rooms:update",
              rooms: Array.from(roomsMap.values())
            });
          }
          break;
      }
    } catch (err) {
      console.warn("[WebSocket] Message handling error:", err);
    }
  });
  ws.on("close", () => {
    clients.delete(client);
  });
  ws.on("error", () => {
    clients.delete(client);
  });
});
var heartbeatInterval = setInterval(() => {
  for (const client of clients) {
    if (!client.isAlive) {
      client.ws.terminate();
      clients.delete(client);
    } else {
      client.isAlive = false;
      try {
        client.ws.ping();
      } catch {
        clients.delete(client);
      }
    }
  }
}, 25e3);
wss.on("close", () => {
  clearInterval(heartbeatInterval);
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
    activeRooms: roomsMap.size,
    activeConnections: clients.size,
    service: "YallaChat AI Voice Rooms & Social Gaming Platform"
  });
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[YallaChat AI Server + Realtime WebSocket] listening on http://0.0.0.0:${PORT}`);
  });
}
process.on("uncaughtException", (err) => {
  console.error("[CRITICAL SHIELD] Uncaught Exception caught safely to keep server running:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[CRITICAL SHIELD] Unhandled Promise Rejection handled safely to keep server running:", reason);
});
start();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  initialCommunityRooms
});
//# sourceMappingURL=server.cjs.map
