import React, { useEffect, useMemo, useState } from "react";
import {
  Captions,
  Clock,
  Eye,
  Globe,
  Play,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  AWARENESS_CATEGORIES,
  AWARENESS_LANGUAGES,
  filterAwarenessVideos,
  loadAwarenessVideos,
  type AwarenessLanguageCode,
  type AwarenessVideoCategory,
  type AwarenessVideoItem,
} from "../../lib/awarenessVideoCatalog";
import { resolveAwarenessThumbnail } from "../shared/awarenessThumbnails";
import { CinemaVideoPlayerModal } from "./CinemaVideoPlayerModal";

export function PatientAwarenessHub() {
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
  const [activeVideo, setActiveVideo] = useState<AwarenessVideoItem | null>(
    null
  );

  // Stay synced when Admin publishes/unpublishes or adds videos
  useEffect(() => {
    const syncCatalog = () => setVideos(loadAwarenessVideos());
    window.addEventListener("awareness-catalog-updated", syncCatalog);
    window.addEventListener("storage", syncCatalog);
    return () => {
      window.removeEventListener("awareness-catalog-updated", syncCatalog);
      window.removeEventListener("storage", syncCatalog);
    };
  }, []);

  const publishedVideos = useMemo(
    () =>
      filterAwarenessVideos(videos, {
        category: categoryFilter,
        language: languageFilter,
        search,
        publishedOnly: true,
      }),
    [videos, categoryFilter, languageFilter, search]
  );

  const spotlightVideo = publishedVideos[0] || null;
  const preferredLang: AwarenessLanguageCode =
    languageFilter === "all" ? "en" : languageFilter;

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="patient-awareness-hub">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Verified Multilingual Video Library · HD 1080p with Live CC
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Health & Inclusive Care Awareness
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Physician-verified video guides on AI assistive technology, inclusive emergency care, and organ donation—with real-time narration, live closed captions, and full synchronized transcripts in 6 languages.
          </p>
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-2 shrink-0">
          <Captions size={15} className="text-teal-700" aria-hidden="true" />
          <span className="font-medium">
            {publishedVideos.length} videos ready · 6 subtitle languages
          </span>
        </div>
      </div>

      {/* Featured Cinema Spotlight */}
      {spotlightVideo && !search.trim() && categoryFilter === "All" && (
        <section
          aria-label="Featured awareness video"
          data-testid="patient-awareness-spotlight"
          className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 text-white shadow-md"
        >
          <div className="grid lg:grid-cols-12">
            {/* 16:9 Photorealistic Cinema Preview */}
            <button
              type="button"
              onClick={() => setActiveVideo(spotlightVideo)}
              aria-label={`Watch featured video: ${spotlightVideo.title}`}
              className="lg:col-span-7 relative aspect-video lg:aspect-auto lg:min-h-[300px] bg-slate-900 overflow-hidden group text-left"
            >
              <img
                src={resolveAwarenessThumbnail(spotlightVideo.thumbnailUrl)}
                alt={spotlightVideo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-16 h-16 rounded-full bg-teal-600/95 group-hover:bg-teal-500 text-white shadow-2xl flex items-center justify-center border border-white/25 transition-transform group-hover:scale-105">
                  <Play size={26} className="ml-1 fill-white" aria-hidden="true" />
                </span>
              </span>
              <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/85 text-white font-mono text-xs font-semibold tabular-nums">
                {spotlightVideo.durationLabel}
              </span>
            </button>

            {/* Editorial Details */}
            <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between gap-5 bg-slate-950">
              <div className="space-y-3">
                <div className="text-xs font-semibold text-teal-400">
                  Featured Guide · {spotlightVideo.category}
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                  {spotlightVideo.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {spotlightVideo.description}
                </p>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
                  <span>{spotlightVideo.quality}</span>
                  <span>·</span>
                  <span>{spotlightVideo.viewsLabel}</span>
                  <span>·</span>
                  <span>{spotlightVideo.chapters.length} chapters</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <ShieldCheck size={14} className="text-teal-400 shrink-0" aria-hidden="true" />
                  <span>{spotlightVideo.medicalSource}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setActiveVideo(spotlightVideo)}
                  data-testid="spotlight-watch-btn"
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-5 h-10 whitespace-nowrap"
                >
                  <Play size={14} className="mr-1.5 fill-white" aria-hidden="true" />
                  Watch in Theater Player
                </Button>
                <span className="text-xs text-slate-400">
                  Audio & CC in {spotlightVideo.languages.length} languages
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search, Category & 6-Language Filter Bar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filter awareness videos by topic"
          >
            {(["All", ...AWARENESS_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                aria-pressed={categoryFilter === cat}
                data-testid={`patient-cat-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat === "All" ? "All Topics" : cat}
              </button>
            ))}
          </div>

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
              placeholder="Search videos, topics, or devices..."
              className="pl-9 h-9 text-xs rounded-xl border-slate-300"
            />
          </div>
        </div>

        {/* 6-Language Audio & Subtitle Track Picker */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 mr-1">
            <Globe size={14} className="text-teal-700" aria-hidden="true" />
            <span>Preferred Audio & Subtitles:</span>
          </span>
          <button
            type="button"
            onClick={() => setLanguageFilter("all")}
            aria-pressed={languageFilter === "all"}
            data-testid="patient-lang-all"
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
              languageFilter === "all"
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            All (6 Languages)
          </button>
          {AWARENESS_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguageFilter(lang.code)}
              aria-pressed={languageFilter === lang.code}
              data-testid={`patient-lang-${lang.code}`}
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

      {/* Video Library Grid */}
      <div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        data-testid="patient-awareness-grid"
      >
        {publishedVideos.map((video) => {
          const thumbSrc = resolveAwarenessThumbnail(video.thumbnailUrl);
          return (
            <article
              key={video.id}
              data-testid={`patient-video-card-${video.id}`}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-teal-300 hover:shadow-sm transition-all group"
            >
              <div>
                {/* Crisp 16:9 Photorealistic Thumbnail */}
                <button
                  type="button"
                  onClick={() => setActiveVideo(video)}
                  aria-label={`Play ${video.title}`}
                  className="relative aspect-video w-full bg-slate-900 overflow-hidden block text-left"
                >
                  <img
                    src={thumbSrc}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                    <span className="w-12 h-12 rounded-full bg-slate-950/80 group-hover:bg-teal-600 border border-white/25 text-white flex items-center justify-center shadow-lg transition-colors">
                      <Play size={19} className="ml-0.5 fill-white" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-950/85 text-white font-mono text-[11px] font-semibold tabular-nums">
                    {video.durationLabel}
                  </span>
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 text-slate-100 text-[10px] font-semibold">
                    {video.quality} · CC
                  </span>
                </button>

                {/* Quiet Unboxed Editorial Metadata */}
                <div className="p-5 space-y-2.5">
                  <div className="text-[11px] font-semibold text-teal-800 truncate">
                    {video.category}
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      className="text-left hover:text-teal-800 transition-colors focus-visible:outline-none focus-visible:underline"
                    >
                      {video.title}
                    </button>
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {video.description}
                  </p>

                  <div className="pt-1 space-y-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                      <ShieldCheck
                        size={12}
                        className="text-teal-700 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">{video.medicalSource}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={11} aria-hidden="true" />
                        {video.viewsLabel}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} aria-hidden="true" />
                        {video.chapters.length} chapters
                      </span>
                      <span>·</span>
                      <span>{video.languages.length} languages</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 font-medium">
                  Synced Transcript & CC
                </span>
                <Button
                  type="button"
                  size="sm"
                  data-testid={`watch-video-${video.id}`}
                  onClick={() => setActiveVideo(video)}
                  className="bg-slate-900 hover:bg-teal-800 text-white text-xs font-semibold h-8 px-3.5 whitespace-nowrap"
                >
                  <Play size={12} className="mr-1.5 fill-white" aria-hidden="true" />
                  Watch Video
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {publishedVideos.length === 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center space-y-3">
          <p className="text-sm font-medium text-slate-700">
            No published awareness videos matched your current filter.
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
            Show All Videos
          </Button>
        </div>
      )}

      {/* Theater-Style In-Place Video Player Modal */}
      <CinemaVideoPlayerModal
        video={activeVideo}
        initialLanguage={preferredLang}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
}
