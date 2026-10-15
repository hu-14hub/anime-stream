"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  SkipForward,
  Subtitles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { StreamingSource, SubtitleTrack } from "@/types";
import { getProgress, saveProgress } from "@/lib/library";
import { getSettings } from "@/lib/store";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
/** Seconds of the head/tail treated as intro / outro skip windows. */
const INTRO_WINDOW = 90;
const OUTRO_WINDOW = 90;
const AUTOHIDE_MS = 2600;

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec % 60);
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export interface VideoPlayerProps {
  sources: StreamingSource[];
  subtitles: SubtitleTrack[];
  slug: string;
  episode: number;
  totalEpisodes: number;
  poster: string;
  epTitle: string;
  dict: Dictionary;
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
}

/**
 * Cinematic adaptive-HLS player: hls.js adaptive streaming with quality
 * levels, subtitle & speed selectors, keyboard shortcuts
 * (Space/F/M/←→/J/L/↑↓/T), skip intro/outro, autoplay-next countdown,
 * resume-from-position, theater mode, Picture-in-Picture, fullscreen and
 * mobile gestures (tap → controls, double-tap → seek, swipe → volume).
 */
export function VideoPlayer({
  sources,
  subtitles,
  slug,
  episode,
  poster,
  epTitle,
  dict,
  hasNext,
  hasPrev,
  onNext,
  onPrev,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [srcIndex, setSrcIndex] = useState(() =>
    Math.max(0, sources.findIndex((s) => s.default))
  );
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [levels, setLevels] = useState<{ i: number; label: string }[]>([]);
  const [level, setLevel] = useState(-1); // -1 = adaptive/auto
  const [panel, setPanel] = useState<null | "speed" | "quality" | "subs">(null);
  const [selectedSub, setSelectedSub] = useState<string>("off");
  const [theater, setTheater] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);

  const source = sources[srcIndex] ?? sources[0];
  const settings = useMemo(() => getSettings(), []);

  /* ---------------------------------------------------------------- */
  /* HLS engine                                                        */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;
    setError(false);
    setLoading(true);
    setLevels([]);
    let hls: Hls | null = null;
    const isHls = /\.m3u8(\?|$)/i.test(source.url);

    const onMeta = () => {
      setLoading(false);
      setDuration(video.duration || 0);
      if (settings.rememberProgress && video.currentTime <= 0.5) {
        const saved = getProgress(slug, episode);
        if (saved && saved.time > 10 && saved.duration > 0 && saved.time / saved.duration < 0.95) {
          setResumeAt(saved.time);
        }
      }
    };
    video.addEventListener("loadedmetadata", onMeta);

    if (isHls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(source.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        setLoading(false);
        setLevels(
          data.levels.map((l, i) => ({
            i,
            label: l.height ? `${l.height}p` : `${Math.round((l.bitrate ?? 0) / 1000)}k`,
          }))
        );
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          setError(true);
          setLoading(false);
        }
      });
    } else {
      // Native HLS (Safari) or progressive fallback.
      video.src = source.url;
      video.load();
    }

    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      hls?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source?.url, slug, episode]);

}
