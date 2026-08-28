import { Project, Task, CanvasNode, DocItem, CodeSnippet, AssetItem } from "../types";

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Aetheria Spatial Workspace",
    category: "AI & Augmented Reality",
    description: "Next-generation 3D spatial canvas with real-time gesture synthesis and Gemini multimodal copilot.",
    icon: "Sparkles",
    color: "from-indigo-500 to-purple-600",
    status: "active",
    updatedAt: "2026-07-28",
  },
  {
    id: "p2",
    name: "HyperPulse Telemetry App",
    category: "Full-Stack Performance",
    description: "High-frequency streaming metrics dashboard with automated anomaly detection.",
    icon: "Activity",
    color: "from-cyan-500 to-blue-600",
    status: "active",
    updatedAt: "2026-07-27",
  },
  {
    id: "p3",
    name: "Nexus Synth Studio",
    category: "Generative Media & Design",
    description: "Multi-layered generative audio/visual workstation for brand identity pipelines.",
    icon: "Palette",
    color: "from-amber-500 to-rose-600",
    status: "planning",
    updatedAt: "2026-07-25",
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    projectId: "p1",
    title: "Implement 3D Gesture Hand Tracking Pipeline",
    description: "Integrate WebGL canvas gesture hooks with low-latency client smoothing.",
    priority: "high",
    tags: ["WebGL", "Spatial", "AI"],
    columnId: "in-progress",
    assignee: "Alex Rivera",
    subtasks: [
      { id: "s1", title: "Setup WebGL render loop", completed: true },
      { id: "s2", title: "Calibrate gesture landmark confidence", completed: true },
      { id: "s3", title: "Add inertia drag & pinch gesture scaling", completed: false },
    ],
    createdAt: "2026-07-20",
  },
  {
    id: "t2",
    projectId: "p1",
    title: "Server-Side Gemini Multimodal Stream API",
    description: "Build Express proxy routes for real-time spatial node analysis and task expansion.",
    priority: "high",
    tags: ["Backend", "Gemini API"],
    columnId: "review",
    assignee: "Elena Rostova",
    subtasks: [
      { id: "s4", title: "Construct Express route /api/gemini/chat", completed: true },
      { id: "s5", title: "Validate User-Agent telemetry headers", completed: true },
      { id: "s6", title: "Integrate JSON response schema", completed: true },
    ],
    createdAt: "2026-07-22",
  },
  {
    id: "t3",
    projectId: "p1",
    title: "Infinite Canvas Node Wire Connector",
    description: "Render dynamic SVG bezier curves connecting related architectural canvas cards.",
    priority: "medium",
    tags: ["Frontend", "Canvas"],
    columnId: "done",
    assignee: "Marcus Vance",
    subtasks: [
      { id: "s7", title: "Calculate card edge midpoint anchor coordinates", completed: true },
      { id: "s8", title: "Add animated SVG stroke gradient", completed: true },
    ],
    createdAt: "2026-07-18",
  },
  {
    id: "t4",
    projectId: "p1",
    title: "Spatial Audio Feedback Engine",
    description: "Synthesize Web Audio spatial panner nodes for interactive card snaps and drop events.",
    priority: "low",
    tags: ["Audio", "UX"],
    columnId: "todo",
    assignee: "Sophia Chen",
    subtasks: [
      { id: "s9", title: "Design custom oscillator synth clicks", completed: false },
      { id: "s10", title: "Map stereo position to canvas X axis", completed: false },
    ],
    createdAt: "2026-07-24",
  },
  {
    id: "t5",
    projectId: "p2",
    title: "Telemetry Ingestion WebSocket Server",
    description: "Configure 100k events/sec streaming proxy for live metric processing.",
    priority: "high",
    tags: ["Performance", "Backend"],
    columnId: "in-progress",
    assignee: "David Miller",
    subtasks: [
      { id: "s11", title: "Setup Express WebSocket handler", completed: true },
      { id: "s12", title: "Buffer incoming chunk logs", completed: false },
    ],
    createdAt: "2026-07-25",
  },
];

export const INITIAL_CANVAS_NODES: CanvasNode[] = [
  {
    id: "n1",
    projectId: "p1",
    type: "card",
    title: "System Architecture Overview",
    content: "Client SPA React 19 -> Express Server Proxy (Port 3000) -> Gemini 3.6 Flash / 3.1 Flash Lite Image SDK.",
    color: "bg-indigo-950/60 border-indigo-500/40 text-indigo-100",
    x: 60,
    y: 80,
    connectedTo: ["n2", "n3"],
  },
  {
    id: "n2",
    projectId: "p1",
    type: "code",
    title: "Server API Route",
    content: "app.post('/api/gemini/chat', async (req, res) => {\n  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });\n  const response = await ai.models.generateContent({...});\n});",
    color: "bg-slate-900/90 border-slate-700 text-slate-200",
    x: 440,
    y: 60,
    connectedTo: ["n4"],
  },
  {
    id: "n3",
    projectId: "p1",
    type: "sticky",
    title: "UX Core Principle",
    content: "⚡ Zero artificial loading screens. Instant feedback across all 5 workbench modules with responsive micro-interactions.",
    color: "bg-amber-950/60 border-amber-500/40 text-amber-200",
    x: 60,
    y: 320,
  },
  {
    id: "n4",
    projectId: "p1",
    type: "palette",
    title: "Aetheria Theme Palette",
    content: "Deep Indigo (#0F172A), Cyber Violet (#7C3AED), Radiant Cyan (#06B6D4), Slate Gray (#334155)",
    color: "bg-purple-950/60 border-purple-500/40 text-purple-200",
    x: 440,
    y: 340,
  },
  {
    id: "n5",
    projectId: "p1",
    type: "flow",
    title: "User Milestone Journey",
    content: "Idea Stage ➔ Task Decomposition ➔ Architecture Blueprint ➔ Code Sandbox Prototype ➔ Master Synthesis Report",
    color: "bg-emerald-950/60 border-emerald-500/40 text-emerald-200",
    x: 820,
    y: 180,
  },
];

export const INITIAL_DOCS: DocItem[] = [
  {
    id: "d1",
    projectId: "p1",
    title: "Product Requirements Document (PRD)",
    category: "PRD",
    content: `# Aetheria Spatial Workspace - Product Specifications

## 1. Executive Summary
Aetheria Spatial Workspace combines multimodal artificial intelligence with interactive spatial canvases to empower engineering and design teams to build faster and smarter.

## 2. Key Objectives
- **Unified Workbench**: Eliminate context switching between task trackers, document editors, visual mindmaps, and code sandboxes.
- **AI Integration**: Server-side Gemini API copilot providing real-time code generation, task roadmap extraction, and asset synthesis.
- **Master Synthesis**: Ability to compile all project artifacts into a cohesive, client-ready pitch report.

## 3. System Architecture & Security
- **Full-Stack Execution**: Express backend proxying all AI requests to keep secrets protected.
- **Persistent State**: Reactive state sync across workspace views.
- **Accessibility**: High-contrast typography with smooth motion transitions.`,
    updatedAt: "2026-07-28",
  },
  {
    id: "d2",
    projectId: "p1",
    title: "Technical Architecture & API Specifications",
    category: "Architecture",
    content: `# Technical Architecture Guidelines

### Server Endpoint Map
1. \`POST /api/gemini/chat\`
   - **Model**: \`gemini-3.6-flash\`
   - **User Agent**: \`aistudio-build\`
   - **Purpose**: Interactive copilot chat.

2. \`POST /api/gemini/task-gen\`
   - **Model**: \`gemini-3.6-flash\`
   - **Structured Schema**: Task items with columns, priorities, and tags.

3. \`POST /api/gemini/generate-image\`
   - **Model**: \`gemini-3.1-flash-lite-image\`
   - **Output**: Base64 inline data image.`,
    updatedAt: "2026-07-27",
  },
];

export const INITIAL_CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: "c1",
    projectId: "p1",
    title: "Interactive Kinetic Particle Sphere",
    language: "html",
    description: "Self-contained WebGL/Canvas kinetic particle animation component.",
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin:0; background:#0B0F19; overflow:hidden; font-family:sans-serif; }
  canvas { display:block; }
  .badge { position:absolute; top:12px; left:12px; background:rgba(124,58,237,0.3); border:1px solid rgba(124,58,237,0.6); color:#C4B5FD; padding:6px 12px; border-radius:20px; font-size:12px; backdrop-filter:blur(8px); }
</style>
</head>
<body>
<div class="badge">Aetheria Kinetic Engine</div>
<canvas id="c"></canvas>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  
  const particles = [];
  const count = 70;
  for(let i=0; i<count; i++){
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      r: Math.random() * 3 + 2,
      color: i % 2 === 0 ? '#818CF8' : '#06B6D4'
    });
  }

  function draw() {
    ctx.fillStyle = 'rgba(11, 15, 25, 0.2)';
    ctx.fillRect(0,0,w,h);

    for(let i=0; i<count; i++){
      let p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.fill();

      for(let j=i+1; j<count; j++){
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 100){
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = \`rgba(129, 140, 248, \${1 - dist/100})\`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.onresize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
</script>
</body>
</html>`,
  },
  {
    id: "c2",
    projectId: "p1",
    title: "Glow Pulse Glassmorphism Card",
    language: "html",
    description: "Responsive dark luxury metric card with animated border glow.",
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#070A11; font-family:system-ui, -apple-system, sans-serif; color:#F8FAFC; }
  .card {
    position: relative; width: 320px; padding: 24px; border-radius: 16px;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9));
    border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.5); overflow: hidden;
  }
  .card::before {
    content: ''; position: absolute; top:-50%; left:-50%; width:200%; height:200%;
    background: conic-gradient(from 0deg, transparent 0deg, #818CF8 60deg, transparent 120deg);
    animation: rotate 6s linear infinite; z-index:0; opacity: 0.25;
  }
  .inner { position: relative; z-index: 1; }
  .title { font-size: 13px; text-transform: uppercase; tracking: 1px; color: #94A3B8; margin-bottom: 8px; font-weight: 600; }
  .val { font-size: 36px; font-weight: 700; background: linear-gradient(to right, #6366F1, #38BDF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .desc { font-size: 13px; color: #CBD5E1; margin-top: 12px; line-height: 1.4; }
  @keyframes rotate { 100% { transform: rotate(360deg); } }
</style>
</head>
<body>
<div class="card">
  <div class="inner">
    <div class="title">System Latency</div>
    <div class="val">14.2 ms</div>
    <div class="desc">Optimal server response time across all Gemini Express API streaming nodes.</div>
  </div>
</div>
</body>
</html>`,
  },
];

export const INITIAL_ASSETS: AssetItem[] = [
  {
    id: "a1",
    projectId: "p1",
    title: "Aetheria Spatial Visual Concept",
    type: "image",
    url: "https://picsum.photos/seed/aetheria/800/600",
    prompt: "A futuristic holographic spatial user interface floating in a sleek dark studio, cyber indigo and neon cyan lighting, 8k render",
    tags: ["Spatial", "Concept", "AI"],
    createdAt: "2026-07-28",
  },
  {
    id: "a2",
    projectId: "p1",
    title: "Aetheria Cyber Palette",
    type: "palette",
    paletteColors: ["#0F172A", "#4F46E5", "#06B6D4", "#10B981", "#F8FAFC"],
    tags: ["Design System", "Theme"],
    createdAt: "2026-07-27",
  },
  {
    id: "a3",
    projectId: "p2",
    title: "HyperPulse Telemetry Concept",
    type: "image",
    url: "https://picsum.photos/seed/hyperpulse/800/600",
    prompt: "Abstract digital wave grid telemetry metrics dashboard, high tech blue, minimalist clean studio lighting",
    tags: ["Telemetry", "Metrics"],
    createdAt: "2026-07-26",
  },
];
