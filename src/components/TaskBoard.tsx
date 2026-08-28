import React, { useState } from "react";
import {
  Kanban,
  Plus,
  Sparkles,
  CheckSquare,
  Square,
  Tag,
  User,
  ArrowRight,
  Trash2,
  Filter,
  Loader2,
  ChevronRight,
  ListTodo,
} from "lucide-react";
import { Task, ColumnId, Priority, Project } from "../types";

interface TaskBoardProps {
  tasks: Task[];
  activeProject: Project;
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void;
  onUpdateTaskColumn: (taskId: string, columnId: ColumnId) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddGeneratedTasks: (tasks: Omit<Task, "id" | "createdAt">[]) => void;
}

const COLUMNS: { id: ColumnId; title: string; color: string }[] = [
  { id: "todo", title: "Backlog / To Do", color: "border-slate-700 bg-slate-900/50" },
  { id: "in-progress", title: "In Progress", color: "border-indigo-500/40 bg-indigo-950/20" },
  { id: "review", title: "Code Review", color: "border-purple-500/40 bg-purple-950/20" },
  { id: "done", title: "Completed", color: "border-emerald-500/40 bg-emerald-950/20" },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  activeProject,
  onAddTask,
  onUpdateTaskColumn,
  onToggleSubtask,
  onDeleteTask,
  onAddGeneratedTasks,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newTags, setNewTags] = useState("");
  const [newAssignee, setNewAssignee] = useState("");

  const projectTasks = tasks.filter((t) => t.projectId === activeProject.id);

  const filteredTasks = projectTasks.filter((t) => {
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesSearch;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      projectId: activeProject.id,
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      columnId: "todo",
      assignee: newAssignee.trim() || "Team Member",
      subtasks: [],
    });

    setNewTitle("");
    setNewDesc("");
    setNewPriority("medium");
    setNewTags("");
    setNewAssignee("");
    setShowAddModal(false);
  };

  const handleGenerateAITasks = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/gemini/task-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle: activeProject.name,
          goal: activeProject.description,
          currentPhase: "Execution",
        }),
      });

      const data = await res.json();
      if (data.tasks && Array.isArray(data.tasks)) {
        const mapped = data.tasks.map((t: any) => ({
          projectId: activeProject.id,
          title: t.title,
          description: t.description,
          priority: (t.priority || "medium") as Priority,
          tags: Array.isArray(t.tags) ? t.tags : ["AI Generated"],
          columnId: (t.columnId || "todo") as ColumnId,
          assignee: "Gemini Copilot",
          subtasks: [
            { id: "st-1", title: "Review architecture specs", completed: false },
            { id: "st-2", title: "Execute unit tests", completed: false },
          ],
        }));
        onAddGeneratedTasks(mapped);
      }
    } catch (err) {
      console.error("Failed to generate AI tasks", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const priorityBadge = (p: Priority) => {
    if (p === "high") return "bg-rose-950/80 text-rose-300 border-rose-800/60";
    if (p === "medium") return "bg-amber-950/80 text-amber-300 border-amber-800/60";
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* Board Controls & Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Task Execution & Milestones
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {projectTasks.length} total tasks
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Manage deliverables, track subtasks, and trigger AI roadmap decomposition.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none text-xs"
            >
              <option value="all" className="bg-slate-900">All Priorities</option>
              <option value="high" className="bg-slate-900">High Priority</option>
              <option value="medium" className="bg-slate-900">Medium Priority</option>
              <option value="low" className="bg-slate-900">Low Priority</option>
            </select>
          </div>

          {/* AI Task Roadmap Generator */}
          <button
            onClick={handleGenerateAITasks}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-200 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>AI Roadmap Gen</span>
          </button>

          {/* New Task Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Grid Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.columnId === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-3 flex flex-col min-h-[500px] ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  {col.title}
                  <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-400">
                    {columnTasks.length}
                  </span>
                </span>
              </div>

              {/* Task Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnTasks.map((task) => {
                  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

                  return (
                    <div
                      key={task.id}
                      className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800/90 rounded-xl p-3.5 shadow-md hover:border-slate-700 transition-all group"
                    >
                      {/* Priority & Delete Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-xs font-bold text-slate-100 mb-1 line-clamp-2">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks checklist */}
                      {task.subtasks.length > 0 && (
                        <div className="my-2.5 bg-slate-950/70 rounded-lg p-2 border border-slate-800/60 space-y-1.5">
                          <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                            <span>Checklist</span>
                            <span>
                              {completedSubtasks}/{task.subtasks.length}
                            </span>
                          </div>
                          {task.subtasks.map((st) => (
                            <button
                              key={st.id}
                              onClick={() => onToggleSubtask(task.id, st.id)}
                              className="w-full text-left flex items-center gap-2 text-[11px] text-slate-300 hover:text-slate-100"
                            >
                              {st.completed ? (
                                <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              )}
                              <span
                                className={`truncate ${
                                  st.completed ? "line-through text-slate-500" : ""
                                }`}
                              >
                                {st.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap my-2">
                          {task.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Footer: Assignee & Move Controls */}
                      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          {task.assignee || "Unassigned"}
                        </span>

                        {/* Move column action buttons */}
                        <div className="flex items-center gap-1">
                          {col.id !== "todo" && (
                            <button
                              onClick={() => {
                                const prevCol =
                                  col.id === "in-progress"
                                    ? "todo"
                                    : col.id === "review"
                                    ? "in-progress"
                                    : "review";
                                onUpdateTaskColumn(task.id, prevCol);
                              }}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Move Left"
                            >
                              ←
                            </button>
                          )}
                          {col.id !== "done" && (
                            <button
                              onClick={() => {
                                const nextCol =
                                  col.id === "todo"
                                    ? "in-progress"
                                    : col.id === "in-progress"
                                    ? "review"
                                    : "done";
                                onUpdateTaskColumn(task.id, nextCol);
                              }}
                              className="px-1.5 py-0.5 rounded bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 flex items-center gap-0.5 font-semibold"
                              title="Move Right"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {columnTasks.length === 0 && (
                  <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-600 text-xs">
                    No tasks in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement WebSocket state hook"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details and technical guidelines..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. Frontend, WebGL, AI"
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
