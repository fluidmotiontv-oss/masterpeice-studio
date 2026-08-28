import React, { useState } from "react";
import {
  Code2,
  Play,
  Sparkles,
  Plus,
  Copy,
  Check,
  Loader2,
  Maximize2,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { CodeSnippet, Project } from "../types";

interface CodeSandboxProps {
  snippets: CodeSnippet[];
  activeProject: Project;
  onAddSnippet: (snippet: Omit<CodeSnippet, "id">) => void;
  onUpdateSnippet: (id: string, code: string) => void;
}

export const CodeSandbox: React.FC<CodeSandboxProps> = ({
  snippets,
  activeProject,
  onAddSnippet,
  onUpdateSnippet,
}) => {
  const projectSnippets = snippets.filter((s) => s.projectId === activeProject.id);

  const [activeSnippetId, setActiveSnippetId] = useState<string>(
    projectSnippets[0]?.id || ""
  );
  const [codeVal, setCodeVal] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Snippet
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const currentSnippet = projectSnippets.find((s) => s.id === activeSnippetId) || projectSnippets[0];

  React.useEffect(() => {
    if (currentSnippet) {
      setCodeVal(currentSnippet.code);
    }
  }, [activeSnippetId, currentSnippet]);

  const handleCodeChange = (val: string) => {
    setCodeVal(val);
    if (currentSnippet) {
      onUpdateSnippet(currentSnippet.id, val);
    }
  };

  const handleCopy = () => {
    if (!codeVal) return;
    navigator.clipboard.writeText(codeVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiGenerateCode = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/gemini/code-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, existingCode: codeVal }),
      });
      const data = await res.json();
      if (data.code) {
        handleCodeChange(data.code);
        setAiPrompt("");
      }
    } catch (err) {
      console.error("AI Code Generation Error:", err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreateSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const defaultHtml = `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin:0; background:#0B0F19; color:#FFF; display:flex; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; }
  .box { padding:24px; background:#1E293B; border-radius:12px; border:1px solid #334155; }
</style>
</head>
<body>
<div class="box">
  <h2>${newTitle}</h2>
  <p>Interactive web component sandbox initialized.</p>
</div>
</body>
</html>`;

    onAddSnippet({
      projectId: activeProject.id,
      title: newTitle.trim(),
      language: "html",
      code: defaultHtml,
      description: newDesc.trim() || "Web component prototype",
    });

    setNewTitle("");
    setNewDesc("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Live Code & Component Sandbox
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {projectSnippets.length} components
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Build and preview interactive UI web components in real-time with AI component generation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Component Snippet</span>
        </button>
      </div>

      {/* Main Split Screen: Snippet Selector + Code Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Snippet List (Left Column) */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Component Presets
          </div>
          <div className="space-y-1">
            {projectSnippets.map((snip) => {
              const isActive = snip.id === (currentSnippet?.id || "");
              return (
                <button
                  key={snip.id}
                  onClick={() => setActiveSnippetId(snip.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    isActive
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-100 shadow-md"
                      : "bg-slate-950/60 border-slate-800/60 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="font-bold line-clamp-1 mb-0.5">{snip.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">
                    {snip.description}
                  </div>
                </button>
              );
            })}

            {projectSnippets.length === 0 && (
              <div className="text-xs text-slate-500 p-4 text-center">No code snippets found.</div>
            )}
          </div>
        </div>

        {/* Code Editor (Center Column) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col min-h-[560px] shadow-2xl">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200">
                {currentSnippet?.title || "Component Editor"}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 border border-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Code"}</span>
            </button>
          </div>

          {/* AI Code Prompt Box */}
          <div className="mb-3 flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiGenerateCode()}
              placeholder="Prompt AI e.g. 'Add a neon hover particle effect'..."
              className="flex-1 bg-transparent px-2 text-xs text-slate-100 focus:outline-none"
            />
            <button
              onClick={handleAiGenerateCode}
              disabled={isAiGenerating || !aiPrompt.trim()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
            >
              {isAiGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              )}
              <span>AI Code</span>
            </button>
          </div>

          {/* Code Textarea */}
          <textarea
            value={codeVal}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="flex-1 w-full bg-slate-950 font-mono text-xs text-cyan-300 p-3 rounded-xl border border-slate-800/80 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            placeholder="Write HTML/CSS/JS..."
          />
        </div>

        {/* Live Preview (Right Column) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col min-h-[560px] shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span className="text-xs font-bold text-slate-200">Interactive Preview</span>
            </div>

            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
              title="Refresh Preview"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sandboxed iframe */}
          <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <iframe
              key={refreshKey}
              srcDoc={codeVal}
              title="Component Preview"
              className="w-full h-full min-h-[460px] border-0"
              sandbox="allow-scripts allow-modals"
            />
          </div>
        </div>
      </div>

      {/* New Snippet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4">Create Component Prototype</h3>
            <form onSubmit={handleCreateSnippet} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Glowing Audio Spectrum Visualizer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Responsive dark canvas component"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-md"
                >
                  Create Prototype
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
