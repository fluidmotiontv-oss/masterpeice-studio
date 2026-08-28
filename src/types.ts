export type Priority = "high" | "medium" | "low";
export type ColumnId = "todo" | "in-progress" | "review" | "done";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  columnId: ColumnId;
  assignee?: string;
  subtasks: Subtask[];
  createdAt: string;
}

export type CanvasNodeType = "card" | "sticky" | "code" | "image" | "palette" | "flow";

export interface CanvasNode {
  id: string;
  projectId: string;
  type: CanvasNodeType;
  title: string;
  content: string;
  color?: string;
  x: number;
  y: number;
  connectedTo?: string[];
}

export interface DocItem {
  id: string;
  projectId: string;
  title: string;
  category: "PRD" | "Architecture" | "Pitch" | "API Specs" | "Notes";
  content: string;
  updatedAt: string;
}

export interface CodeSnippet {
  id: string;
  projectId: string;
  title: string;
  language: "html" | "css" | "javascript" | "typescript";
  code: string;
  description: string;
}

export interface AssetItem {
  id: string;
  projectId: string;
  title: string;
  type: "image" | "palette" | "icon";
  url?: string;
  paletteColors?: string[];
  prompt?: string;
  tags: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string; // Lucide icon name string
  color: string;
  status: "active" | "planning" | "completed";
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export type WorkbenchTab = "tasks" | "canvas" | "docs" | "code" | "assets" | "assembly";
