import React, { useState } from "react";
import {
  LayoutGrid,
  Plus,
  StickyNote,
  Code2,
  Palette,
  GitBranch,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  Sparkles,
} from "lucide-react";
import { CanvasNode, CanvasNodeType, Project } from "../types";

interface VisualCanvasProps {
  nodes: CanvasNode[];
  activeProject: Project;
  onAddNode: (node: Omit<CanvasNode, "id">) => void;
  onUpdateNodePos: (id: string, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
}

export const VisualCanvas: React.FC<VisualCanvasProps> = ({
  nodes,
  activeProject,
  onAddNode,
  onUpdateNodePos,
  onDeleteNode,
}) => {
  const [zoom, setZoom] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showNodeModal, setShowNodeModal] = useState(false);

  // Form State
  const [nodeType, setNodeType] = useState<CanvasNodeType>("card");
  const [nodeTitle, setNodeTitle] = useState("");
  const [nodeContent, setNodeContent] = useState("");

  const projectNodes = nodes.filter((n) => n.projectId === activeProject.id);

  const handleMouseDown = (e: React.MouseEvent, id: string, nodeX: number, nodeY: number) => {
    e.stopPropagation();
    setDraggingId(id);
    setDragOffset({
      x: e.clientX / zoom - nodeX,
      y: e.clientY / zoom - nodeY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    const newX = Math.max(20, Math.round(e.clientX / zoom - dragOffset.x));
    const newY = Math.max(20, Math.round(e.clientY / zoom - dragOffset.y));
    onUpdateNodePos(draggingId, newX, newY);
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeTitle.trim()) return;

    let color = "bg-slate-900 border-slate-800 text-slate-200";
    if (nodeType === "sticky") color = "bg-amber-950/70 border-amber-600/50 text-amber-200";
    if (nodeType === "code") color = "bg-slate-950 border-cyan-800/60 text-cyan-200";
    if (nodeType === "palette") color = "bg-purple-950/70 border-purple-600/50 text-purple-200";
    if (nodeType === "flow") color = "bg-emerald-950/70 border-emerald-600/50 text-emerald-200";

    onAddNode({
      projectId: activeProject.id,
      type: nodeType,
      title: nodeTitle.trim(),
      content: nodeContent.trim(),
      color,
      x: 100 + Math.floor(Math.random() * 200),
      y: 100 + Math.floor(Math.random() * 150),
    });

    setNodeTitle("");
    setNodeContent("");
    setShowNodeModal(false);
  };

  // Helper to compute node connections (draw SVG bezier curve lines)
  const renderConnections = () => {
    const lines: React.ReactNode[] = [];
    projectNodes.forEach((source) => {
      if (source.connectedTo && source.connectedTo.length > 0) {
        source.connectedTo.forEach((targetId) => {
          const target = projectNodes.find((n) => n.id === targetId);
          if (target) {
            // Source center anchor approx
            const sx = source.x + 140;
            const sy = source.y + 70;
            const tx = target.x + 140;
            const ty = target.y + 70;

            const dx = Math.abs(tx - sx) / 2;
            const pathData = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;

            lines.push(
              <g key={`${source.id}-${target.id}`}>
                <path
                  d={pathData}
                  fill="none"
                  stroke="url(#wireGradient)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="animate-pulse opacity-80"
                />
                <circle cx={tx} cy={ty} r="4" fill="#38BDF8" />
              </g>
            );
          }
        });
      }
    });

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        {lines}
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Canvas Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Interactive Visual Mindmap Canvas
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {projectNodes.length} active nodes
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Drag architecture cards, sticky notes, and code blocks on an infinite visual board.
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-slate-300">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1 hover:bg-slate-800 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="p-1 hover:bg-slate-800 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowNodeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Canvas Node</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Workspace Container */}
      <div
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full h-[620px] bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl select-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        }}
      >
        {/* Render Connection Wires */}
        {renderConnections()}

        {/* Render Cards */}
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-75 origin-top-left"
          style={{ transform: `scale(${zoom})` }}
        >
          {projectNodes.map((node) => (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDown(e, node.id, node.x, node.y)}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              className={`absolute w-72 rounded-2xl p-4 border shadow-xl cursor-move transition-shadow hover:shadow-2xl z-10 ${
                node.color || "bg-slate-900 border-slate-800 text-slate-200"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 opacity-90">
                  {node.type === "sticky" && <StickyNote className="w-3.5 h-3.5" />}
                  {node.type === "code" && <Code2 className="w-3.5 h-3.5" />}
                  {node.type === "palette" && <Palette className="w-3.5 h-3.5" />}
                  {node.type === "flow" && <GitBranch className="w-3.5 h-3.5" />}
                  {node.type === "card" && <LayoutGrid className="w-3.5 h-3.5" />}
                  {node.type}
                </span>

                <div className="flex items-center gap-1">
                  <Move className="w-3 h-3 opacity-40 cursor-grab" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNode(node.id);
                    }}
                    className="p-1 rounded hover:bg-black/20 text-slate-400 hover:text-rose-400"
                    title="Remove Node"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title & Body */}
              <h4 className="text-xs font-bold mb-1">{node.title}</h4>
              <p className="text-[11px] opacity-90 whitespace-pre-wrap leading-relaxed">
                {node.content}
              </p>
            </div>
          ))}

          {projectNodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs">
              Canvas is empty. Click "Add Canvas Node" to drop sticky notes or architecture cards!
            </div>
          )}
        </div>
      </div>

      {/* Add Canvas Node Modal */}
      {showNodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4">Add Canvas Card</h3>
            <form onSubmit={handleCreateNode} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Node Type</label>
                <select
                  value={nodeType}
                  onChange={(e) => setNodeType(e.target.value as CanvasNodeType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="card">Architecture Card</option>
                  <option value="sticky">Sticky Note</option>
                  <option value="code">Code Block</option>
                  <option value="palette">Theme Swatch</option>
                  <option value="flow">Flowchart Milestone</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Card Title</label>
                <input
                  type="text"
                  value={nodeTitle}
                  onChange={(e) => setNodeTitle(e.target.value)}
                  placeholder="e.g. State Management Architecture"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Content / Specs</label>
                <textarea
                  value={nodeContent}
                  onChange={(e) => setNodeContent(e.target.value)}
                  placeholder="Content details or code snippet..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNodeModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-md"
                >
                  Add Card to Canvas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
