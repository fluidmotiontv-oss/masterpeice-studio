import React, { useState, useEffect } from "react";
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_CANVAS_NODES,
  INITIAL_DOCS,
  INITIAL_CODE_SNIPPETS,
  INITIAL_ASSETS,
} from "./data/mockData";
import {
  Project,
  Task,
  CanvasNode,
  DocItem,
  CodeSnippet,
  AssetItem,
  WorkbenchTab,
  ColumnId,
} from "./types";
import { Navbar } from "./components/Navbar";
import { TaskBoard } from "./components/TaskBoard";
import { VisualCanvas } from "./components/VisualCanvas";
import { DocStudio } from "./components/DocStudio";
import { CodeSandbox } from "./components/CodeSandbox";
import { AssetStudio } from "./components/AssetStudio";
import { MasterAssemblyModal } from "./components/MasterAssemblyModal";
import { AICopilotDrawer } from "./components/AICopilotDrawer";
import { CommandPalette } from "./components/CommandPalette";

export default function App() {
  // Persistence via LocalStorage
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("mp_projects");
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [activeProject, setActiveProject] = useState<Project>(
    () => projects[0] || INITIAL_PROJECTS[0]
  );

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("mp_tasks");
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [nodes, setNodes] = useState<CanvasNode[]>(() => {
    const saved = localStorage.getItem("mp_nodes");
    return saved ? JSON.parse(saved) : INITIAL_CANVAS_NODES;
  });

  const [docs, setDocs] = useState<DocItem[]>(() => {
    const saved = localStorage.getItem("mp_docs");
    return saved ? JSON.parse(saved) : INITIAL_DOCS;
  });

  const [snippets, setSnippets] = useState<CodeSnippet[]>(() => {
    const saved = localStorage.getItem("mp_snippets");
    return saved ? JSON.parse(saved) : INITIAL_CODE_SNIPPETS;
  });

  const [assets, setAssets] = useState<AssetItem[]>(() => {
    const saved = localStorage.getItem("mp_assets");
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [activeTab, setActiveTab] = useState<WorkbenchTab>("tasks");
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMasterAssemblyOpen, setIsMasterAssemblyOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem("mp_projects", JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem("mp_tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem("mp_nodes", JSON.stringify(nodes));
  }, [nodes]);
  useEffect(() => {
    localStorage.setItem("mp_docs", JSON.stringify(docs));
  }, [docs]);
  useEffect(() => {
    localStorage.setItem("mp_snippets", JSON.stringify(snippets));
  }, [snippets]);
  useEffect(() => {
    localStorage.setItem("mp_assets", JSON.stringify(assets));
  }, [assets]);

  // Compute Synergy Completion Score
  const projectTasks = tasks.filter((t) => t.projectId === activeProject.id);
  const completedTasks = projectTasks.filter((t) => t.columnId === "done").length;
  const synergyScore = projectTasks.length
    ? Math.round((completedTasks / projectTasks.length) * 100)
    : 100;

  // Handlers for Projects
  const handleCreateProject = (name: string, category: string, desc: string) => {
    const newP: Project = {
      id: `p-${Date.now()}`,
      name,
      category,
      description: desc,
      icon: "Sparkles",
      color: "from-indigo-500 to-purple-600",
      status: "active",
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setProjects((prev) => [newP, ...prev]);
    setActiveProject(newP);
  };

  // Handlers for Tasks
  const handleAddTask = (newTask: Omit<Task, "id" | "createdAt">) => {
    const task: Task = {
      ...newTask,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTasks((prev) => [task, ...prev]);
  };

  const handleUpdateTaskColumn = (taskId: string, columnId: ColumnId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, columnId } : t))
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddGeneratedTasks = (newTasks: Omit<Task, "id" | "createdAt">[]) => {
    const formatted: Task[] = newTasks.map((t, idx) => ({
      ...t,
      id: `t-gen-${Date.now()}-${idx}`,
      createdAt: new Date().toISOString().slice(0, 10),
    }));
    setTasks((prev) => [...formatted, ...prev]);
  };

  // Handlers for Canvas Nodes
  const handleAddNode = (newNode: Omit<CanvasNode, "id">) => {
    const node: CanvasNode = {
      ...newNode,
      id: `n-${Date.now()}`,
    };
    setNodes((prev) => [...prev, node]);
  };

  const handleUpdateNodePos = (id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  // Handlers for Docs
  const handleAddDoc = (newDoc: Omit<DocItem, "id" | "updatedAt">) => {
    const doc: DocItem = {
      ...newDoc,
      id: `d-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setDocs((prev) => [doc, ...prev]);
  };

  const handleUpdateDoc = (id: string, content: string) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, content, updatedAt: new Date().toISOString().slice(0, 10) }
          : d
      )
    );
  };

  // Handlers for Code Snippets
  const handleAddSnippet = (newSnippet: Omit<CodeSnippet, "id">) => {
    const snip: CodeSnippet = {
      ...newSnippet,
      id: `c-${Date.now()}`,
    };
    setSnippets((prev) => [snip, ...prev]);
  };

  const handleUpdateSnippet = (id: string, code: string) => {
    setSnippets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, code } : s))
    );
  };

  // Handlers for Assets
  const handleAddAsset = (newAsset: Omit<AssetItem, "id" | "createdAt">) => {
    const asset: AssetItem = {
      ...newAsset,
      id: `a-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setAssets((prev) => [asset, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Studio Header */}
      <Navbar
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onCreateProject={handleCreateProject}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        synergyScore={synergyScore}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMasterAssembly={() => setIsMasterAssemblyOpen(true)}
      />

      {/* Main Studio Workbench Area */}
      <main className="max-w-[1700px] mx-auto p-4 sm:p-6">
        {activeTab === "tasks" && (
          <TaskBoard
            tasks={tasks}
            activeProject={activeProject}
            onAddTask={handleAddTask}
            onUpdateTaskColumn={handleUpdateTaskColumn}
            onToggleSubtask={handleToggleSubtask}
            onDeleteTask={handleDeleteTask}
            onAddGeneratedTasks={handleAddGeneratedTasks}
          />
        )}

        {activeTab === "canvas" && (
          <VisualCanvas
            nodes={nodes}
            activeProject={activeProject}
            onAddNode={handleAddNode}
            onUpdateNodePos={handleUpdateNodePos}
            onDeleteNode={handleDeleteNode}
          />
        )}

        {activeTab === "docs" && (
          <DocStudio
            docs={docs}
            activeProject={activeProject}
            onAddDoc={handleAddDoc}
            onUpdateDoc={handleUpdateDoc}
          />
        )}

        {activeTab === "code" && (
          <CodeSandbox
            snippets={snippets}
            activeProject={activeProject}
            onAddSnippet={handleAddSnippet}
            onUpdateSnippet={handleUpdateSnippet}
          />
        )}

        {activeTab === "assets" && (
          <AssetStudio
            assets={assets}
            activeProject={activeProject}
            onAddAsset={handleAddAsset}
          />
        )}

        {activeTab === "assembly" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-100">
              Master Showcase Report Generator
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Compile all current project tasks, architecture canvas nodes, PRDs, code snippets, and generated assets into a unified pitch report.
            </p>
            <button
              onClick={() => setIsMasterAssemblyOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 hover:opacity-90 transition-all"
            >
              Open Unified Showcase Modal
            </button>
          </div>
        )}
      </main>

      {/* Floating Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeProject={activeProject}
        activeTab={activeTab}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tasks={tasks}
        nodes={nodes}
        docs={docs}
        snippets={snippets}
        onSelectTab={setActiveTab}
      />

      {/* Master Assembly Modal */}
      {isMasterAssemblyOpen && (
        <MasterAssemblyModal
          activeProject={activeProject}
          tasks={tasks}
          nodes={nodes}
          docs={docs}
          snippets={snippets}
          assets={assets}
          onClose={() => setIsMasterAssemblyOpen(false)}
        />
      )}
    </div>
  );
}
