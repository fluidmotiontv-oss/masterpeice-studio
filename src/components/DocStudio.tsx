import React, { useState } from "react";
import {
  FileText,
  Plus,
  Edit3,
  Eye,
  Sparkles,
  Download,
  Copy,
  Check,
  Loader2,
  FileCode,
  ListOrdered,
  Maximize2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { DocItem, Project } from "../types";

interface DocStudioProps {
  docs: DocItem[];
  activeProject: Project;
  onAddDoc: (doc: Omit<DocItem, "id" | "updatedAt">) => void;
  onUpdateDoc: (id: string, content: string) => void;
}

export const DocStudio: React.FC<DocStudioProps> = ({
  docs,
  activeProject,
  onAddDoc,
  onUpdateDoc,
}) => {
  const projectDocs = docs.filter((d) => d.projectId === activeProject.id);

  const [activeDocId, setActiveDocId] = useState<string>(
    projectDocs[0]?.id || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [docContent, setDocContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Doc state
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState<DocItem["category"]>("PRD");

  const currentDoc = projectDocs.find((d) => d.id === activeDocId) || projectDocs[0];

  React.useEffect(() => {
    if (currentDoc) {
      setDocContent(currentDoc.content);
    }
  }, [activeDocId, currentDoc]);

  const handleSaveContent = (val: string) => {
    setDocContent(val);
    if (currentDoc) {
      onUpdateDoc(currentDoc.id, val);
    }
  };

  const handleCopy = () => {
    if (!docContent) return;
    navigator.clipboard.writeText(docContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentDoc) return;
    const blob = new Blob([docContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentDoc.title.toLowerCase().replace(/\s+/g, "_")}.md`;
    a.click();
  };

  const handleAiAssist = async (action: "expand" | "summarize" | "outline" | "polish") => {
    if (!docContent) return;
    setIsAiProcessing(true);
    try {
      const res = await fetch("/api/gemini/doc-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docText: docContent, action }),
      });
      const data = await res.json();
      if (data.result) {
        if (action === "summarize") {
          handleSaveContent(`${docContent}\n\n---\n## Executive AI Summary\n${data.result}`);
        } else {
          handleSaveContent(data.result);
        }
      }
    } catch (err) {
      console.error("AI Doc Assist Error:", err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const initialTemplate = `# ${newTitle}\n\n## 1. Executive Context\nDocument details for ${activeProject.name}.\n\n## 2. Requirements & Specs\n- Feature 1\n- Feature 2`;

    onAddDoc({
      projectId: activeProject.id,
      title: newTitle.trim(),
      category: newCat,
      content: initialTemplate,
    });

    setNewTitle("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Smart PRD & Document Studio
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {projectDocs.length} documents
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Draft technical specs, PRDs, and architecture notes with Gemini AI text assistance.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Document Selector Sidebar */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Project Documents
          </div>
          <div className="space-y-1">
            {projectDocs.map((doc) => {
              const isActive = doc.id === (currentDoc?.id || "");
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    setActiveDocId(doc.id);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between ${
                    isActive
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-100 shadow-md"
                      : "bg-slate-950/60 border-slate-800/60 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div>
                    <div className="font-bold mb-0.5 line-clamp-1">{doc.title}</div>
                    <span className="text-[10px] text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50 font-medium">
                      {doc.category}
                    </span>
                  </div>
                </button>
              );
            })}

            {projectDocs.length === 0 && (
              <div className="text-xs text-slate-500 p-4 text-center">No documents found.</div>
            )}
          </div>
        </div>

        {/* Editor & Viewer Area */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col min-h-[580px] shadow-2xl">
          {currentDoc ? (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-sm">{currentDoc.title}</h3>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    Markdown
                  </span>
                </div>

                {/* AI Assistant Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                  >
                    {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    <span>{isEditing ? "Preview" : "Edit"}</span>
                  </button>

                  <div className="h-4 w-px bg-slate-800 mx-1" />

                  <button
                    onClick={() => handleAiAssist("expand")}
                    disabled={isAiProcessing}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950 border border-indigo-800/80 text-indigo-300 hover:bg-indigo-900 text-xs disabled:opacity-50"
                    title="Expand details with Gemini"
                  >
                    {isAiProcessing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                    )}
                    <span className="hidden sm:inline">Expand</span>
                  </button>

                  <button
                    onClick={() => handleAiAssist("summarize")}
                    disabled={isAiProcessing}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950 border border-purple-800/80 text-purple-300 hover:bg-purple-900 text-xs disabled:opacity-50"
                  >
                    <ListOrdered className="w-3 h-3 text-purple-400" />
                    <span className="hidden sm:inline">Summarize</span>
                  </button>

                  <button
                    onClick={() => handleAiAssist("polish")}
                    disabled={isAiProcessing}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900 text-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="hidden sm:inline">Polish Tone</span>
                  </button>

                  <div className="h-4 w-px bg-slate-800 mx-1" />

                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    title="Copy Markdown"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    title="Download .md file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto">
                {isEditing ? (
                  <textarea
                    value={docContent}
                    onChange={(e) => handleSaveContent(e.target.value)}
                    className="w-full h-[460px] bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    placeholder="Write Markdown document specifications..."
                  />
                ) : (
                  <div className="markdown-body text-slate-200 text-xs space-y-3 leading-relaxed p-2">
                    <ReactMarkdown>{docContent}</ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select or create a document to begin.
            </div>
          )}
        </div>
      </div>

      {/* New Doc Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4">Create New Document</h3>
            <form onSubmit={handleCreateDoc} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. System API & Data Flow Specs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="PRD">PRD Specification</option>
                  <option value="Architecture">Technical Architecture</option>
                  <option value="Pitch">Pitch Deck / Executive Brief</option>
                  <option value="API Specs">API Specification</option>
                  <option value="Notes">General Notes</option>
                </select>
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
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
