import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Eye,
  FileEdit,
  Globe,
  Play,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  AWARENESS_CATEGORIES,
  AWARENESS_LANGUAGES,
  createAwarenessVideo,
  filterAwarenessVideos,
  loadAwarenessVideos,
  saveAwarenessVideos,
  toggleAwarenessVideoStatus,
  type AwarenessLanguageCode,
  type AwarenessVideoCategory,
  type AwarenessVideoItem,
} from "../../lib/awarenessVideoCatalog";
import {
  AWARENESS_THUMBNAIL_OPTIONS,
  resolveAwarenessThumbnail,
} from "../shared/awarenessThumbnails";
import { CinemaVideoPlayerModal } from "../patient/CinemaVideoPlayerModal";
import { TwoFactorModal } from "./TwoFactorModal";

export function AdminAwarenessHub() {
  const [videos, setVideos] = useState<AwarenessVideoItem[]>(() =>
    loadAwarenessVideos()
  );
  const [categoryFilter, setCategoryFilter] = useState<
    AwarenessVideoCategory | "All"
  >("All");
  const [languageFilter, setLanguageFilter] = useState<
    AwarenessLanguageCode | "all"
  >("all");
  const [search, setSearch] = useState("");
  const [previewVideo, setPreviewVideo] = useState<AwarenessVideoItem | null>(
    null
  );

  // Add Awareness Video Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<AwarenessVideoCategory>(
    AWARENESS_CATEGORIES[0]
  );
  const [newDescription, setNewDescription] = useState("");
  const [newDurationMins, setNewDurationMins] = useState("4");
  const [newMedicalSource, setNewMedicalSource] = useState(
    "Care Preempt Clinical Editorial Board"
  );
  const [newThumbPath, setNewThumbPath] = useState<string>(
    AWARENESS_THUMBNAIL_OPTIONS[0].catalogPath
  );
  const [newLanguages, setNewLanguages] = useState<AwarenessLanguageCode[]>([
    "en",
    "hi",
    "te",
    "ta",
    "kn",
    "es",
  ]);
  const [newPublished, setNewPublished] = useState(true);

  // Optional 2FA Emergency Text Advisory Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [advisoryTitle, setAdvisoryTitle] = useState("");
  const [advisoryBody, setAdvisoryBody] = useState("");
  const [show2FA, setShow2FA] = useState(false);

  const filteredVideos = useMemo(
    () =>
      filterAwarenessVideos(videos, {
        category: categoryFilter,
        language: languageFilter,
        search,
        publishedOnly: false,
      }),
    [videos, categoryFilter, languageFilter, search]
  );

  const publishedCount = videos.filter((v) => v.published).length;
  const draftCount = videos.length - publishedCount;

  const handleTogglePublished = (video: AwarenessVideoItem) => {
    setVideos((prev) => {
      const next = toggleAwarenessVideoStatus(prev, video.id);
      saveAwarenessVideos(next);
      return next;
    });
    const nextLabel = video.published ? "Draft (hidden from patients)" : "Published (live in Patient Portal)";
    toast.success(`"${video.title}" set to ${nextLabel}.`);
  };

  const toggleFormLanguage = (code: AwarenessLanguageCode) => {
    setNewLanguages((prev) => {
      if (prev.includes(code)) {
        return prev.length > 1 ? prev.filter((c) => c !== code) : prev;
      }
      return [...prev, code];
    });
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error("Please provide both a video title and clinical description.");
      return;
    }
    const mins = Math.max(1, Math.min(30, Number(newDurationMins) || 4));
    const created = createAwarenessVideo({
      title: newTitle,
      category: newCategory,
      description: newDescription,
      durationSec: mins * 60,
      medicalSource: newMedicalSource,
      languages: newLanguages,
      thumbnailUrl: newThumbPath,
      published: newPublished,
    });
    setVideos((prev) => {
      const next = [created, ...prev];
      saveAwarenessVideos(next);
      return next;
    });
    toast.success(
      `Added "${created.title}" (${created.published ? "Published" : "Draft"}) across ${created.languages.length} languages.`
    );
    setNewTitle("");
    setNewDescription("");
    setNewDurationMins("4");
    setShowAddModal(false);
  };

  const handleTriggerAdvisory2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryTitle.trim() || !advisoryBody.trim()) {
      toast.error("Enter both headline and advisory message.");
      return;
    }
    setShow2FA(true);
  };

  const handleCompleteAdvisory = () => {
    toast.success(`Emergency advisory "${advisoryTitle}" broadcasted to regional portals.`);
    setAdvisoryTitle("");
    setAdvisoryBody("");
    setShow2FA(false);
    setShowBroadcastModal(false);
  };

  return (
    <div className="space-y-6" data-testid="admin-awareness-hub">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Multilingual Clinical Education & Media Operations
          </p>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
            Multilingual Awareness Hub
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Curate and publish verified assistive technology, inclusive emergency care, and organ donation awareness videos with synchronized subtitles in 6 languages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowBroadcastModal(true)}
            className="text-xs font-semibold border-slate-300 text-slate-800 whitespace-nowrap"
          >
            <Radio size={14} className="mr-1.5 text-amber-700" aria-hidden="true" />
            2FA Text Advisory
          </Button>
          <Button
            type="button"
            onClick={() => setShowAddModal(true)}
            data-testid="admin-add-video-btn"
            className="bg-slate-900 hover:bg-teal-800 text-white text-xs font-semibold whitespace-nowrap"
          >
            <Plus size={15} className="mr-1.5" aria-hidden="true" />
            Add Awareness Video
          </Button>
        </div>
      </div>

      {/* Compact Stats Bar */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Total Videos</div>
          <div className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {videos.length}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Published Live</div>
          <div
            data-testid="admin-published-count"
            className="font-display text-2xl font-bold text-emerald-700 mt-1 tabular-nums"
          >
            {publishedCount}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Drafts</div>
          <div
            data-testid="admin-draft-count"
            className="font-display text-2xl font-bold text-amber-700 mt-1 tabular-nums"
          >
            {draftCount}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Supported Languages</div>
          <div className="font-display text-2xl font-bold text-teal-800 mt-1 tabular-nums">
            {AWARENESS_LANGUAGES.length}
          </div>
        </div>
      </div>

      {/* Category, Language & Search Controls */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Filter */}
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filter awareness videos by category"
          >
            {(["All", ...AWARENESS_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                aria-pressed={categoryFilter === cat}
                data-testid={`admin-cat-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat === "All" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos or medical source..."
              className="pl-9 h-9 text-xs rounded-xl border-slate-300"
            />
          </div>
        </div>

        {/* 6-Language Filter Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 mr-1">
            <Globe size={14} className="text-teal-700" aria-hidden="true" />
            <span>Language Track:</span>
          </span>
          <button
            type="button"
            onClick={() => setLanguageFilter("all")}
            aria-pressed={languageFilter === "all"}
            data-testid="admin-lang-all"
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
              languageFilter === "all"
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            All Languages
          </button>
          {AWARENESS_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguageFilter(lang.code)}
              aria-pressed={languageFilter === lang.code}
              data-testid={`admin-lang-${lang.code}`}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                languageFilter === lang.code
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {lang.nativeLabel !== lang.label
                ? `${lang.label} · ${lang.nativeLabel}`
                : lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Cards Grid */}
      <div
        className="grid md:grid-cols-2 xl:grid-cols-3 gap-5"
        data-testid="admin-awareness-grid"
      >
        {filteredVideos.map((video) => {
          const thumbSrc = resolveAwarenessThumbnail(video.thumbnailUrl);
          return (
            <article
              key={video.id}
              data-testid={`admin-video-card-${video.id}`}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Photorealistic 16:9 Thumbnail */}
                <button
                  type="button"
                  onClick={() => setPreviewVideo(video)}
                  aria-label={`Preview ${video.title}`}
                  className="relative aspect-video w-full bg-slate-900 overflow-hidden block group text-left"
                >
                  <img
                    src={thumbSrc}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="w-12 h-12 rounded-full bg-slate-950/80 border border-white/25 text-white flex items-center justify-center shadow-lg">
                      <Play size={20} className="ml-0.5 fill-white" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-950/85 text-white font-mono text-[11px] font-semibold tabular-nums">
                    {video.durationLabel}
                  </span>
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 text-slate-100 text-[10px] font-semibold">
                    {video.quality}
                  </span>
                </button>

                {/* Metadata */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold text-teal-800 truncate">
                      {video.category}
                    </span>
                    <span
                      data-testid={`admin-video-status-${video.id}`}
                      className={`inline-flex items-center gap-1 font-semibold whitespace-nowrap shrink-0 ${
                        video.published ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {video.published ? (
                        <>
                          <CheckCircle2 size={13} aria-hidden="true" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <FileEdit size={13} aria-hidden="true" />
                          <span>Draft</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {video.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {video.description}
                  </p>

                  <div className="text-[11px] text-slate-500 pt-1 space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <ShieldCheck
                        size={12}
                        className="text-teal-700 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">{video.medicalSource}</span>
                    </div>
                    <div>
                      Languages:{" "}
                      <span className="text-slate-700 font-medium">
                        {video.languages
                          .map(
                            (code) =>
                              AWARENESS_LANGUAGES.find((l) => l.code === code)
                                ?.label || code
                          )
                          .join(" · ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  data-testid={`admin-toggle-publish-${video.id}`}
                  onClick={() => handleTogglePublished(video)}
                  className={`h-8 px-3 text-xs font-semibold whitespace-nowrap ${
                    video.published
                      ? "border-amber-300 text-amber-900 hover:bg-amber-50"
                      : "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  }`}
                >
                  {video.published ? "Move to Draft" : "Publish Live"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  data-testid={`admin-preview-${video.id}`}
                  onClick={() => setPreviewVideo(video)}
                  className="h-8 px-3 text-xs font-semibold border-slate-300 text-slate-800 hover:border-teal-700 hover:text-teal-900 whitespace-nowrap"
                >
                  <Eye size={13} className="mr-1.5" aria-hidden="true" />
                  Preview
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredVideos.length === 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center space-y-3">
          <p className="text-sm font-medium text-slate-700">
            No awareness videos match the selected category or language filter.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setCategoryFilter("All");
              setLanguageFilter("all");
              setSearch("");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Cinema Video Preview Modal */}
      <CinemaVideoPlayerModal
        video={previewVideo}
        initialLanguage={languageFilter === "all" ? "en" : languageFilter}
        onClose={() => setPreviewVideo(null)}
      />

      {/* Add Awareness Video Modal (Portaled to document.body) */}
      {showAddModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-awareness-video-title"
            data-testid="add-awareness-video-modal"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/70">
                <div>
                  <h3
                    id="add-awareness-video-title"
                    className="font-display text-lg font-bold text-slate-900"
                  >
                    Add Multilingual Awareness Video
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Create a new verified clinical video with chapter markers and multilingual subtitles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close modal"
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-900"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleAddVideo} className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="aw-title" className="text-xs font-semibold text-slate-800">
                      Video Title *
                    </Label>
                    <Input
                      id="aw-title"
                      data-testid="add-video-title-input"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Navigating Emergency Triage with Bone-Conduction Audio"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="aw-cat" className="text-xs font-semibold text-slate-800">
                      Category *
                    </Label>
                    <select
                      id="aw-cat"
                      value={newCategory}
                      onChange={(e) =>
                        setNewCategory(e.target.value as AwarenessVideoCategory)
                      }
                      className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900"
                    >
                      {AWARENESS_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="aw-dur" className="text-xs font-semibold text-slate-800">
                      Duration (Minutes)
                    </Label>
                    <Input
                      id="aw-dur"
                      type="number"
                      min={1}
                      max={30}
                      value={newDurationMins}
                      onChange={(e) => setNewDurationMins(e.target.value)}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="aw-source" className="text-xs font-semibold text-slate-800">
                      Verified Medical Source
                    </Label>
                    <Input
                      id="aw-source"
                      value={newMedicalSource}
                      onChange={(e) => setNewMedicalSource(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="aw-thumb" className="text-xs font-semibold text-slate-800">
                      Clinical Visual Thumbnail
                    </Label>
                    <select
                      id="aw-thumb"
                      value={newThumbPath}
                      onChange={(e) => setNewThumbPath(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900"
                    >
                      {AWARENESS_THUMBNAIL_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.catalogPath}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="aw-desc" className="text-xs font-semibold text-slate-800">
                      Clinical Summary & Learning Goal *
                    </Label>
                    <Textarea
                      id="aw-desc"
                      data-testid="add-video-desc-input"
                      rows={3}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Summarize what patients, families, or responders will learn in this video..."
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <span className="text-xs font-semibold text-slate-800 block">
                      Enabled Audio & Subtitle Languages
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {AWARENESS_LANGUAGES.map((lang) => {
                        const checked = newLanguages.includes(lang.code);
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => toggleFormLanguage(lang.code)}
                            aria-pressed={checked}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              checked
                                ? "bg-teal-700 text-white border-teal-700"
                                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {lang.nativeLabel !== lang.label
                              ? `${lang.label} (${lang.nativeLabel})`
                              : lang.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2.5 pt-1">
                    <input
                      id="aw-published"
                      type="checkbox"
                      checked={newPublished}
                      onChange={(e) => setNewPublished(e.target.checked)}
                      className="rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                    />
                    <label htmlFor="aw-published" className="text-xs font-medium text-slate-700">
                      Publish immediately to Patient Portal Awareness Library
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    data-testid="submit-add-video-btn"
                    className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs"
                  >
                    Save Awareness Video
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Optional Secondary 2FA Text Advisory Modal */}
      {showBroadcastModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="advisory-modal-title"
            onClick={() => setShowBroadcastModal(false)}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <h3
                  id="advisory-modal-title"
                  className="font-display text-base font-bold text-slate-900"
                >
                  Broadcast 2FA Public Health Advisory
                </h3>
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  aria-label="Close advisory modal"
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              <form onSubmit={handleTriggerAdvisory2FA} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="adv-title" className="text-xs font-semibold">
                    Advisory Headline *
                  </Label>
                  <Input
                    id="adv-title"
                    value={advisoryTitle}
                    onChange={(e) => setAdvisoryTitle(e.target.value)}
                    placeholder="e.g. Regional Heatwave & Accessible Hydration Shelters"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adv-body" className="text-xs font-semibold">
                    Clinical Guidance *
                  </Label>
                  <Textarea
                    id="adv-body"
                    rows={4}
                    value={advisoryBody}
                    onChange={(e) => setAdvisoryBody(e.target.value)}
                    placeholder="Enter verified public health advisory text..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBroadcastModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-slate-900 text-white text-xs font-semibold"
                  >
                    Authenticate & Broadcast (2FA)
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      <TwoFactorModal
        isOpen={show2FA}
        onClose={() => setShow2FA(false)}
        onSuccess={handleCompleteAdvisory}
        actionTitle="Authorize Emergency Health Advisory"
        actionDescription={`Broadcast regional advisory: "${advisoryTitle}"`}
        targetEntity="Regional Patient & Hospital Portals"
      />
    </div>
  );
}
