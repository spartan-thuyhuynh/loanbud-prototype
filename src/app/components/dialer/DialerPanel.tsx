import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight, ChevronDown, ChevronUp, FileEdit, Grid3x3, MessageSquare,
  Mic, MicOff, Minus, Pause, Phone, PhoneOff, Send, Settings, UserPlus,
  Voicemail, X,
} from "lucide-react";
import { toast } from "sonner";
import { useDialer } from "@/app/contexts/DialerContext";
import { useAppData } from "@/app/contexts/AppDataContext";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

interface DialerPanelProps {
  onClose: () => void;
  initialNumber?: string;
  offsetRight?: number;
}

export function DialerPanel({ onClose, initialNumber, offsetRight = 24 }: DialerPanelProps) {
  const { session, handleCallStarted, handleCallEnded, closeDialer } = useDialer();
  const { voicemailScripts } = useAppData();

  const [input, setInput] = useState(session?.phone ?? initialNumber ?? "");
  const [minimized, setMinimized] = useState(false);

  // Call simulation
  const [callState, setCallState] = useState<"idle" | "ringing" | "active">("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Active call panel state
  const [showVoicemailPanel, setShowVoicemailPanel] = useState(false);
  const [showKeypadPanel, setShowKeypadPanel] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [dropped, setDropped] = useState(false);
  const [vmTab, setVmTab] = useState<"record" | "script">("record");

  // Outcome-pending VM state
  const [showVmDrop, setShowVmDrop] = useState(false);
  const [expandedTranscriptId, setExpandedTranscriptId] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    if (callState === "ringing" || callState === "active") {
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  // Auto-answer after 4 seconds of ringing
  useEffect(() => {
    if (callState === "ringing" && elapsedSeconds >= 4) {
      setCallState("active");
      setElapsedSeconds(0);
      handleCallStarted();
    }
  }, [callState, elapsedSeconds, handleCallStarted]);

  // Auto-close when outcome is logged
  useEffect(() => {
    if (session?.status === "completed") {
      const t = setTimeout(() => { closeDialer(); onClose(); }, 600);
      return () => clearTimeout(t);
    }
  }, [session?.status, closeDialer, onClose]);

  const handleKey = (k: string) => setInput((v) => v + k);
  const handleBackspace = () => setInput((v) => v.slice(0, -1));

  const handleClose = () => {
    setCallState("idle");
    setElapsedSeconds(0);
    closeDialer();
    onClose();
  };

  const handleStartCall = () => {
    setCallState("ringing");
    setElapsedSeconds(0);
    setDropped(false);
    setShowVoicemailPanel(false);
    setShowKeypadPanel(false);
  };

  const handleHangUp = () => {
    setCallState("idle");
    setElapsedSeconds(0);
    handleCallEnded();
  };

  const handleVmDrop = (vmName: string) => {
    setDropped(true);
    setShowVoicemailPanel(false);
    toast.success(`Voicemail dropped: ${vmName}`);
  };

  const isTaskBound = !!session?.taskId;
  const isOutcomePending = session?.status === "outcome-pending";
  const isCompleted = session?.status === "completed";
  const contactName = session?.contactName ?? "Unknown";
  const phone = session?.phone ?? input;

  // ── Outcome-pending ───────────────────────────────────────────────────────
  if (isOutcomePending || isCompleted) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ width: 320, height: 540 }}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#2c3e50] text-white shrink-0">
          <span className="text-sm font-semibold">Dialer</span>
          <button onClick={handleClose} className="p-1 rounded hover:bg-white/20 transition-colors" aria-label="Close"><X className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col justify-center">
          {isCompleted ? (
            <p className="text-sm text-green-600 font-medium text-center">✓ Outcome saved</p>
          ) : (
            <>
              <div className="text-center space-y-1.5">
                <div className="w-8 h-8 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                  <PhoneOff className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm font-medium">Call ended</p>
                <p className="text-xs text-muted-foreground leading-snug">Log the outcome in the task panel on the right.</p>
              </div>

              {dropped ? (
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-green-50 border border-green-100">
                  <span className="text-xs text-green-700 font-medium">✓ Voicemail dropped</span>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setShowVmDrop((v) => !v)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Drop a Voicemail
                    {showVmDrop ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                  </button>

                  {showVmDrop && (
                    <div className="mt-1.5 border border-border rounded-lg overflow-hidden">
                      <div className="flex border-b border-border bg-muted/30">
                        {(["record", "script"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => { setVmTab(t); setExpandedTranscriptId(null); }}
                            className={`flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${vmTab === t ? "bg-background text-foreground border-b-2 border-[#2c3e50]" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            {t === "record" ? "Drop Recording" : "Read Script"}
                          </button>
                        ))}
                      </div>
                      {(() => {
                        const filtered = voicemailScripts.filter((vm) => (vm.type ?? "script") === vmTab);
                        if (filtered.length === 0) return <p className="px-3 py-3 text-xs text-muted-foreground text-center">{vmTab === "record" ? "No recordings — add one in Settings." : "No scripts — add one in Settings."}</p>;
                        return filtered.map((vm) => (
                          <div key={vm.id} className="border-b border-border/50 last:border-b-0">
                            <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-muted/30">
                              <Mic className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{vm.name}</p>
                                <p className="text-[10px] text-muted-foreground">{vm.estimatedDurationSeconds}s · {vm.category}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button type="button" onClick={() => setExpandedTranscriptId((id) => id === vm.id ? null : vm.id)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                  {expandedTranscriptId === vm.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                                {vmTab === "record" && (
                                  <button onClick={() => handleVmDrop(vm.name)} className="text-[10px] font-semibold px-2 py-1 rounded bg-[#2c3e50] text-white hover:bg-[#3d5166] transition-colors">Drop</button>
                                )}
                              </div>
                            </div>
                            {expandedTranscriptId === vm.id && vm.scriptText && (
                              <div className="px-2.5 pb-2.5 pt-2 bg-muted/20 border-t border-border/30">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{vmTab === "record" ? "Transcript" : "Script"}</p>
                                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{vm.scriptText}</p>
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <button onClick={handleClose} className="w-full py-2 text-xs text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors">Close Dialer</button>
        </div>
      </div>
    );
  }

  // ── Ringing state ─────────────────────────────────────────────────────────
  if (callState === "ringing") {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ width: 320, height: 540 }}>
        <div className="bg-green-500 px-4 py-3 flex items-center gap-3 text-white shrink-0">
          <div className="animate-pulse"><Phone className="w-4 h-4" /></div>
          <div className="flex-1">
            <span className="text-sm font-semibold">Ringing</span>
            <span className="ml-2 text-sm opacity-75 font-mono">{formatTime(elapsedSeconds)}</span>
          </div>
          <button onClick={handleClose} className="p-1 rounded hover:bg-white/20 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-gray-600">{getInitials(contactName)}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{contactName}</p>
              <p className="text-sm text-gray-500">{phone}</p>
            </div>
          </div>
          <div className="flex justify-center mb-2">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-16 h-16 rounded-full bg-red-100 animate-ping opacity-40" />
              <button
                onClick={handleHangUp}
                className="relative w-14 h-14 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">Tap to hang up</p>
        </div>
      </div>
    );
  }

  // ── Active call state — new UI ────────────────────────────────────────────
  if (callState === "active") {
    const actions = [
      { id: "add", icon: UserPlus, label: "Add to call", onClick: () => {}, active: false },
      { id: "transfer", icon: ArrowLeftRight, label: "Transfer", onClick: () => {}, active: false },
      { id: "voicemail", icon: Voicemail, label: "Voice Mail", onClick: () => { setShowVoicemailPanel((v) => !v); setShowKeypadPanel(false); }, active: showVoicemailPanel },
      { id: "messages", icon: MessageSquare, label: "Messages", onClick: () => {}, active: false },
      { id: "note", icon: FileEdit, label: "Note", onClick: () => {}, active: false },
      { id: "keypad", icon: Grid3x3, label: "Keypad", onClick: () => { setShowKeypadPanel((v) => !v); setShowVoicemailPanel(false); }, active: showKeypadPanel },
      { id: "hold", icon: Pause, label: "Hold Call", onClick: () => setIsOnHold((v) => !v), active: isOnHold },
      { id: "end", icon: PhoneOff, label: "End Call", onClick: handleHangUp, active: true, danger: true },
      { id: "mute", icon: isMuted ? MicOff : Mic, label: isMuted ? "Unmute" : "Mute", onClick: () => setIsMuted((v) => !v), active: isMuted },
      { id: "settings", icon: Settings, label: "Settings", onClick: () => {}, active: false },
    ];

    const vmScripts = voicemailScripts.filter((vm) => (vm.type ?? "script") === vmTab);

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ width: 320, height: 540 }}>
        {/* Green header */}
        <div className="bg-green-500 px-4 py-3 flex items-center gap-2 text-white shrink-0">
          <Phone className="w-4 h-4 shrink-0" />
          <span className="text-sm font-semibold flex-1">Outbound Call</span>
          <span className="text-sm font-mono opacity-90">{formatTime(elapsedSeconds)}</span>
          <button onClick={handleClose} className="p-1 rounded hover:bg-white/20 transition-colors ml-1"><X className="w-3.5 h-3.5" /></button>
        </div>

        {/* Contact card */}
        <div className="mx-3 mt-3 mb-0 bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-gray-600">{getInitials(contactName)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{contactName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{phone}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        </div>

        {/* Action buttons 5×2 grid */}
        <div className="grid grid-cols-5 gap-x-1 gap-y-3 px-3 py-4 shrink-0">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                action.danger ? "bg-red-500 hover:bg-red-600" :
                action.active ? "bg-gray-700 hover:bg-gray-600" :
                "bg-gray-100 hover:bg-gray-200"
              }`}>
                <action.icon className={`w-5 h-5 ${action.danger || action.active ? "text-white" : "text-gray-700"}`} />
              </div>
              <span className="text-[10px] text-gray-500 leading-tight text-center">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Voicemail panel */}
        {showVoicemailPanel && (
          <div className="border-t border-gray-200 flex flex-col min-h-0 flex-1">
            <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
              <span className="text-sm font-semibold text-gray-900">Voice Mail</span>
              <button onClick={() => setShowVoicemailPanel(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            {/* Record / Script tabs */}
            <div className="flex border-b border-gray-100 px-3 gap-3 shrink-0">
              {(["record", "script"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setVmTab(t); setExpandedTranscriptId(null); }}
                  className={`pb-1.5 text-xs font-medium border-b-2 transition-colors ${vmTab === t ? "border-green-500 text-green-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  {t === "record" ? "Drop Recording" : "Read Script"}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto flex-1">
              {vmScripts.length === 0 ? (
                <p className="px-3 py-3 text-xs text-gray-400 text-center">{vmTab === "record" ? "No recordings — add one in Settings." : "No scripts — add one in Settings."}</p>
              ) : (
                vmScripts.map((vm) => (
                  <div key={vm.id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setExpandedTranscriptId((id) => id === vm.id ? null : vm.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-300 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{vm.name}</p>
                        {vmTab === "script" && vm.scriptText && expandedTranscriptId !== vm.id && (
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{vm.scriptText.slice(0, 60)}…</p>
                        )}
                      </div>
                      {vmTab === "record" ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleVmDrop(vm.name); }}
                          className="w-8 h-8 rounded-lg bg-green-500 hover:bg-green-600 flex items-center justify-center shrink-0 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5 text-white" />
                        </button>
                      ) : (
                        expandedTranscriptId === vm.id
                          ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          : <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                    </button>
                    {expandedTranscriptId === vm.id && vm.scriptText && (
                      <div className="px-3 pb-3 pt-1 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{vm.scriptText}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Keypad panel */}
        {showKeypadPanel && (
          <div className="border-t border-gray-200 px-3 py-3 shrink-0">
            <div className="grid grid-cols-3 gap-2">
              {KEYS.map((k) => (
                <button key={k} onClick={() => handleKey(k)} className="py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm transition-colors">{k}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Idle / keypad state ───────────────────────────────────────────────────
  const displayNumber = input || session?.phone || "";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden" style={{ width: 270 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#2c3e50] text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold shrink-0">Dialer</span>
          {isTaskBound && session?.contactName && (
            <span className="text-xs text-white/70 truncate">· {session.contactName}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setMinimized((v) => !v)} className="p-1 rounded hover:bg-white/20 transition-colors" aria-label="Minimize"><Minus className="w-3.5 h-3.5" /></button>
          <button onClick={handleClose} className="p-1 rounded hover:bg-white/20 transition-colors" aria-label="Close"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {!minimized && (
        <div className="p-4 flex flex-col gap-3">
          {/* Number display */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={displayNumber}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter number"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {displayNumber.length > 0 && (
              <button onClick={handleBackspace} className="text-gray-400 hover:text-gray-600 px-2 text-lg leading-none" aria-label="Backspace">⌫</button>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {KEYS.map((k) => (
              <button key={k} onClick={() => handleKey(k)} className="py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm transition-colors">{k}</button>
            ))}
          </div>

          {/* Call button */}
          <button
            onClick={handleStartCall}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors"
          >
            <Phone className="w-4 h-4" />
            {isTaskBound ? `Call ${session?.contactName ?? ""}` : "Call"}
          </button>

          {isTaskBound && (
            <button onClick={handleCallEnded} className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1">
              Skip call — log outcome manually →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
