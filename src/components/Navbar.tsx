import React, { useState } from "react";
import {
  Sparkles,
  LayoutGrid,
  Kanban,
  FileText,
  Code2,
  Image,
  Layers,
  Search,
  Bot,
  Plus,
  ChevronDown,
  CheckCircle2,
  FolderPlus,
} from "lucide-react";
import { Project, WorkbenchTab } from "../types";

interface NavbarProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (p: Project) => void;
  onCreateProject: (name: string, category: string, desc: string) => void;
  activeTab: WorkbenchTab;
  onSelectTab: (tab: WorkbenchTab) => void;
  synergyScore: number;
  onOpenCopilot: () => void;
  onOpenSearch: () => void;
  onOpenMasterAssembly: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  activeTab,
  onSelectTab,
  synergyScore,
  onOpenCopilot,
  onOpenSearch,
  onOpenMasterAssembly,
}) => {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProject(newName.trim(), newCat.trim() || "General", newDesc.trim() || "New project workspace");
    setNewName("");
    setNewCat("");
    setNewDesc("");
    setShowNewProjectModal(false);
  };

  const tabs: { id: WorkbenchTab; label: string; icon: React.ReactNode }[] = [
    { id: "tasks", label: "Tasks & Roadmap", icon: <Kanban className="w-4 h-4" /> },
    { id: "canvas", label: "Visual Canvas", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "docs", label: "Docs & PRDs", icon: <FileText className="w-4 h-4" /> },
    { id: "code", label: "Code Sandbox", icon: <Code2 className="w-4 h-4" /> },
    { id: "assets", label: "Asset Studio", icon: <Image className="w-4 h-4" /> },
    { id: "assembly", label: "Master Showcase", icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left Branding & Project Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-bold text-base bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                Masterpiece Studio
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-800/50 px-2 py-0.5 rounded-full">
                Pro Workbench
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* Project Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="max-w-[140px] truncate">{activeProject.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProjectDropdown && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Select Project Workspace
                </div>
                <div className="space-y-1 my-1">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p);
                        setShowProjectDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        p.id === activeProject.id
                          ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30"
                          : "text-slate-300 hover:bg-slate-800/70"
                      }`}
                    >
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.category}</div>
                      </div>
                      {p.id === activeProject.id && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-800 pt-1.5 mt-1">
                  <button
                    onClick={() => {
                      setShowProjectDropdown(false);
                      setShowNewProjectModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-indigo-400 hover:bg-indigo-950/40 transition-colors font-medium"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    New Project Space
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Workbench Navigation Tabs */}
        <nav className="hidden lg:flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 space-x-1">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Synergy Score, Command Palette, Copilot */}
        <div className="flex items-center gap-3">
          {/* Project Progress Synergy Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400">Synergy</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${synergyScore}%` }}
              />
            </div>
            <span className="font-semibold text-slate-200 text-[11px]">{synergyScore}%</span>
          </div>

          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            title="Search Project Artifacts (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Search</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] bg-slate-950 rounded text-slate-400 border border-slate-800">
              ⌘K
            </kbd>
          </button>

          {/* Master Assembly Trigger */}
          <button
            onClick={onOpenMasterAssembly}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Assemble Showcase</span>
          </button>

          {/* Copilot Drawer Toggle */}
          <button
            onClick={onOpenCopilot}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800/80 text-indigo-200 hover:bg-indigo-900/80 text-xs font-medium transition-all"
          >
            <Bot className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span className="hidden sm:inline">Copilot</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden border-t border-slate-800 px-2 py-1.5 flex items-center justify-around overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTab(t.id)}
            className={`p-2 rounded-lg text-xs flex items-center gap-1 ${
              activeTab === t.id ? "bg-indigo-600 text-white" : "text-slate-400"
            }`}
          >
            {t.icon}
            <span className="text-[11px] whitespace-nowrap">{t.label}</span>
          </button>
        ))}
      </div>

      {/* New Project Space Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-400" />
              Create Project Space
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Set up a new workspace for tasks, docs, code sandboxes, and visual canvases.
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Quantum Studio App"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="e.g. Full-Stack AI / Design System"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Goal</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe project vision or target capabilities..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
