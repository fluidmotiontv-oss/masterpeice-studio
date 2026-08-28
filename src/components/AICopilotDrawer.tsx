import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  Zap,
  Code,
  ListTodo,
  FileText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage, Project, WorkbenchTab } from "../types";

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: Project;
  activeTab: WorkbenchTab;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  activeProject,
  activeTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      role: "model",
      content: `Hello! I am your **Masterpiece Copilot**. I have full context on **${activeProject.name}**. How can I assist you with tasks, architecture design, document writing, or code prototypes?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const contextStr = `Project: ${activeProject.name} (${activeProject.category})\nDescription: ${activeProject.description}\nActive Tab: ${activeTab}`;

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          context: contextStr,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to communicate with AI model");
      }

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "model",
        content: data.text || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error("Copilot Error:", err);
      const errMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: "model",
        content: `⚠️ **Copilot Error**: ${err.message || "Failed to generate AI response."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPresetChips = () => {
    if (activeTab === "tasks") {
      return [
        "Suggest sprint milestones",
        "Identify potential task bottlenecks",
        "Generate user acceptance criteria",
      ];
    }
    if (activeTab === "canvas") {
      return [
        "Suggest system architecture nodes",
        "Design UX journey map flow",
        "Brainstorm core feature cards",
      ];
    }
    if (activeTab === "docs") {
      return [
        "Draft Executive PRD Summary",
        "Generate API endpoint specs",
        "Outline security & compliance section",
      ];
    }
    if (activeTab === "code") {
      return [
        "Review component state logic",
        "Optimize WebGL particle canvas",
        "Add glassmorphism CSS styles",
      ];
    }
    return [
      "Critique active project design",
      "Suggest marketing pitch points",
      "Draft project launch checklist",
    ];
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Masterpiece Copilot
              <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded">
                Gemini 3.6
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Context: {activeProject.name}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Chips */}
      <div className="p-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
        {getPresetChips().map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-300 text-[10px] font-medium transition-all"
          >
            ✨ {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-xs shadow-md leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none font-medium"
                  : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none"
              }`}
            >
              {m.role === "model" ? (
                <div className="markdown-body space-y-2">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{m.content}</p>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Analyzing project context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Copilot about code, docs, tasks..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
