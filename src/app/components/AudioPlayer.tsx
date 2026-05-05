import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface AudioPlayerProps {
  src: string;
  /** Compact layout for tight spaces (e.g. inside list rows). Default: false */
  compact?: boolean;
  className?: string;
}

export function AudioPlayer({ src, compact = false, className = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const btnSize = compact ? "w-6 h-6" : "w-8 h-8";
  const iconSize = compact ? "w-3 h-3" : "w-4 h-4";
  const timeClass = compact ? "text-[10px] tabular-nums text-muted-foreground w-7 shrink-0" : "text-xs tabular-nums text-muted-foreground w-8 shrink-0";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
      />

      <button
        type="button"
        onClick={toggle}
        className={`${btnSize} rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 hover:bg-primary/90 transition-colors`}
      >
        {isPlaying
          ? <Pause className={iconSize} />
          : <Play className={`${iconSize} ml-0.5`} />}
      </button>

      <span className={`${timeClass} text-right`}>{formatTime(currentTime)}</span>

      {/* Slider track */}
      <div className="relative flex-1 flex items-center">
        <div className="w-full h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.05}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          aria-label="Seek"
        />
        {/* Thumb dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-white shadow pointer-events-none transition-none"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      <span className={timeClass}>{formatTime(duration)}</span>
    </div>
  );
}
