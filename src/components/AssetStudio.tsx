import React, { useState } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  Palette,
  Download,
  Copy,
  Check,
  Loader2,
  Tag,
  Plus,
  ExternalLink,
} from "lucide-react";
import { AssetItem, Project } from "../types";

interface AssetStudioProps {
  assets: AssetItem[];
  activeProject: Project;
  onAddAsset: (asset: Omit<AssetItem, "id" | "createdAt">) => void;
}

export const AssetStudio: React.FC<AssetStudioProps> = ({
  assets,
  activeProject,
  onAddAsset,
}) => {
  const projectAssets = assets.filter((a) => a.projectId === activeProject.id);

  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Palette generator state
  const [newPaletteTitle, setNewPaletteTitle] = useState("");
  const [colorsInput, setColorsInput] = useState("#0F172A, #6366F1, #06B6D4, #10B981");

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate image asset");
      }

      if (data.imageUrl) {
        onAddAsset({
          projectId: activeProject.id,
          title: prompt.slice(0, 32) + "...",
          type: "image",
          url: data.imageUrl,
          prompt: prompt.trim(),
          tags: ["AI Generated", "Gemini 3.1"],
        });
        setPrompt("");
      }
    } catch (err: any) {
      console.error("Image Gen Error:", err);
      setErrorMsg(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddPalette = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaletteTitle.trim()) return;

    const colors = colorsInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    onAddAsset({
      projectId: activeProject.id,
      title: newPaletteTitle.trim(),
      type: "palette",
      paletteColors: colors,
      tags: ["Palette", "Theme"],
    });

    setNewPaletteTitle("");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Media & AI Asset Studio
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {projectAssets.length} assets
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Generate AI concept art banners, color palettes, and brand identities using Gemini image models.
            </p>
          </div>
        </div>
      </div>

      {/* AI Generator & Palette Kits Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini Image Generator */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Gemini AI Concept Generator
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Describe hero concept art, background banners, or UI textures for your workspace.
            </p>

            <form onSubmit={handleGenerateImage} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Image Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A futuristic 3D spatial interface floating in dark neon violet studio lighting, 8k render..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300">Aspect Ratio:</span>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="1:1">1:1 Square</option>
                    <option value="16:9">16:9 Banner</option>
                    <option value="4:3">4:3 Card</option>
                    <option value="9:16">9:16 Vertical</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                  )}
                  <span>Generate Asset</span>
                </button>
              </div>
            </form>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* Custom Theme Palette Kit Creator */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">Design System Color Kit</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Create color palettes for workspace themes or CSS variable exports.
            </p>

            <form onSubmit={handleAddPalette} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Palette Title
                </label>
                <input
                  type="text"
                  value={newPaletteTitle}
                  onChange={(e) => setNewPaletteTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk Violet Studio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Hex Colors (comma separated)
                </label>
                <input
                  type="text"
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="#0F172A, #6366F1, #06B6D4, #10B981"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Color Kit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Asset Gallery Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200">Project Asset Gallery</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                {asset.type === "image" && asset.url && (
                  <div className="relative group rounded-xl overflow-hidden mb-3 border border-slate-800 aspect-video bg-slate-950">
                    <img
                      src={asset.url}
                      alt={asset.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Open full view"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {asset.type === "palette" && asset.paletteColors && (
                  <div className="flex items-center h-20 rounded-xl overflow-hidden border border-slate-800 mb-3">
                    {asset.paletteColors.map((color, cIdx) => (
                      <div
                        key={cIdx}
                        style={{ backgroundColor: color }}
                        className="h-full flex-1 relative group cursor-pointer"
                        title={color}
                        onClick={() => copyToClipboard(color, `${asset.id}-${cIdx}`)}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-white opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <h4 className="text-xs font-bold text-slate-100 mb-1">{asset.title}</h4>
                {asset.prompt && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-2 mb-2">
                    "{asset.prompt}"
                  </p>
                )}

                {/* Tags */}
                <div className="flex items-center gap-1 flex-wrap">
                  {asset.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>{asset.createdAt}</span>

                {asset.url && (
                  <button
                    onClick={() => copyToClipboard(asset.url!, asset.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    {copiedIndex === asset.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedIndex === asset.id ? "Copied" : "Copy URL"}</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {projectAssets.length === 0 && (
            <div className="col-span-full h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-2xl text-slate-600 text-xs">
              No assets in gallery. Generate images or save custom color kits!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
