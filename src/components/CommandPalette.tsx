import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Kanban,
  LayoutGrid,
  FileText,
  Code2,
  Image,
  Layers,
  Sparkles,
} from "lucide-react";
import { Task, CanvasNode, DocItem, CodeSnippet, WorkbenchTab } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  nodes: CanvasNode[];
  docs: DocItem[];
  snippets: CodeSnippet[];
  onSelectTab: (tab: WorkbenchTab) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  nodes,
  docs,
  snippets,
  onSelectTab,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredNodes = nodes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredDocs = docs.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredSnippets = snippets.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, canvas cards, docs, and code snippets..."
            className="w-full bg-transparent text-sm text-slate-100 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 flex-1">
          {/* Quick Navigation Links */}
          {!query && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
                Workbench Modules
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onSelectTab("tasks");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800"
                >
                  <Kanban className="w-4 h-4 text-indigo-400" />
                  <span>Tasks & Roadmap</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab("canvas");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800"
                >
                  <LayoutGrid className="w-4 h-4 text-purple-400" />
                  <span>Visual Canvas</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab("docs");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Docs & PRDs</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab("code");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800"
                >
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Code Sandbox</span>
                </button>
              </div>
            </div>
          )}

          {/* Filtered Artifact Results */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
                Tasks ({filteredTasks.length})
              </div>
              <div className="space-y-1">
                {filteredTasks.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTab("tasks");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-xs text-slate-300 flex items-center justify-between"
                  >
                    <span className="font-medium line-clamp-1">{t.title}</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      {t.columnId}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredDocs.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
                Documents ({filteredDocs.length})
              </div>
              <div className="space-y-1">
                {filteredDocs.slice(0, 3).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onSelectTab("docs");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-xs text-slate-300 flex items-center justify-between"
                  >
                    <span className="font-medium line-clamp-1">{d.title}</span>
                    <span className="text-[10px] text-cyan-400">{d.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredSnippets.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
                Code Snippets ({filteredSnippets.length})
              </div>
              <div className="space-y-1">
                {filteredSnippets.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectTab("code");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-xs text-slate-300 flex items-center justify-between"
                  >
                    <span className="font-medium line-clamp-1">{s.title}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {s.language}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
