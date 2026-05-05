import { useState } from "react";
import { ChevronDown, ChevronUp, Mic, Minus, Phone, PhoneOff, X } from "lucide-react";
import { toast } from "sonner";
import { useDialer } from "@/app/contexts/DialerContext";
import { useAppData } from "@/app/contexts/AppDataContext";
import { AudioPlayer } from "@/app/components/AudioPlayer";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

interface DialerPanelProps {
  onClose: () => void;
  /** Pre-filled number for free-dial mode (legacy compat) */
  initialNumber?: string;
  /** Right offset in px — used to shift the panel left when TaskDetailPanel is open. Defaults to 24. */
  offsetRight?: number;
}

/**
 * Floating dialer panel — three states:
 *
 * 1. idle / free-dial  — no task bound, classic keypad UI
 * 2. active (task-bound) — mini task context header + keypad + red "End Call" button
 * 3. outcome-pending — collapses to slim banner directing agent back to TaskDetailPanel
 */
export function DialerPanel({ onClose, initialNumber, offsetRight = 24 }: DialerPanelProps) {
  const { session, handleCallStarted, handleCallEnded, closeDialer } = useDialer();
  const { voicemailScripts } = useAppData();

  const [input, setInput] = useState(
    session?.phone ?? initialNumber ?? "",
  );
  const [minimized, setMinimized] = useState(false);
  const [showObjective, setShowObjective] = useState(false);

  // VM drop state
  const [showVmDrop, setShowVmDrop] = useState(false);
  const [dropped, setDropped] = useState(false);
  const [expandedTranscriptId, setExpandedTranscriptId] = useState<string | null>(null);

  const handleKey = (k: string) => setInput((v) => v + k);
  const handleBackspace = () => setInput((v) => v.slice(0, -1));

  const handleClose = () => {
    closeDialer();
    onClose();
  };

  const handleVmDrop = (vmId: string, vmName: string) => {
    setDropped(true);
    setShowVmDrop(false);
    toast.success(`Voicemail dropped: ${vmName}`);
  };

  const isTaskBound = !!session?.taskId;
  const isOutcomePending = session?.status === "outcome-pending";
  const isCompleted = session?.status === "completed";

  // ── Outcome-pending state — slim banner ───────────────────────────────────
  if (isOutcomePending || isCompleted) {
    return (
      <div
        className="fixed bottom-6 z-[60] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{ width: 280, right: offsetRight }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#2c3e50] text-white">
          <span className="text-sm font-semibold">Dialer</span>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          {isCompleted ? (
            <p className="text-sm text-green-600 font-medium text-center">✓ Outcome saved</p>
          ) : (
            <>
              <div className="text-center space-y-1.5">
                <div className="w-8 h-8 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                  <PhoneOff className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-foreground">Call ended</p>
                <p className="text-xs text-muted-foreground leading-snug">
                  Log the outcome in the task panel on the right.
                </p>
              </div>

              {/* Voicemail drop section */}
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
                      {voicemailScripts.length === 0 ? (
                        <p className="px-3 py-2.5 text-xs text-muted-foreground text-center">
                          No records — add one in Settings.
                        </p>
                      ) : (
                        voicemailScripts.map((vm) => (
                          <div key={vm.id} className="border-b border-border/50 last:border-b-0">
                            {/* Row header */}
                            <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-muted/30">
                              <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                                <Mic className="w-3 h-3 text-muted-foreground/60" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{vm.name}</p>
                                <p className="text-[10px] text-muted-foreground">{vm.estimatedDurationSeconds}s · {vm.category}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {(vm.audioUrl || vm.scriptText) && (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedTranscriptId((id) => id === vm.id ? null : vm.id)}
                                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    aria-label="Toggle details"
                                  >
                                    {expandedTranscriptId === vm.id
                                      ? <ChevronUp className="w-3 h-3" />
                                      : <ChevronDown className="w-3 h-3" />}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleVmDrop(vm.id, vm.name)}
                                  className="text-[10px] font-semibold px-2 py-1 rounded bg-[#2c3e50] text-white hover:bg-[#3d5166] transition-colors"
                                >
                                  Drop
                                </button>
                              </div>
                            </div>

                            {/* Expanded: player + transcript */}
                            {expandedTranscriptId === vm.id && (
                              <div className="px-2.5 pb-2.5 space-y-2 bg-muted/20 border-t border-border/30">
                                {vm.audioUrl && (
                                  <AudioPlayer src={vm.audioUrl} compact className="pt-2" />
                                )}
                                {vm.scriptText && (
                                  <div>
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Transcript</p>
                                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{vm.scriptText}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <button
            onClick={handleClose}
            className="w-full py-2 text-xs text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Close Dialer
          </button>
        </div>
      </div>
    );
  }

  // ── Active or free-dial state ─────────────────────────────────────────────
  const displayNumber = input || session?.phone || "";

  return (
    <div
      className="fixed bottom-6 z-[60] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{ width: 260, right: offsetRight }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#2c3e50] text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold shrink-0">Dialer</span>
          {isTaskBound && session?.contactName && (
            <span className="text-xs text-white/70 truncate">· {session.contactName}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setMinimized((v) => !v)}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="p-4 flex flex-col gap-3">
          {/* Task context bar (task-bound mode only) */}
          {isTaskBound && session?.objective && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowObjective((v) => !v)}
                className="w-full flex items-center justify-between px-2.5 py-2 text-left"
              >
                <span className="text-[10px] text-blue-700 font-medium uppercase tracking-wider">
                  Call Objective
                </span>
                {showObjective ? (
                  <ChevronUp className="w-3 h-3 text-blue-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-blue-400" />
                )}
              </button>
              {showObjective && (
                <div className="px-2.5 pb-2">
                  <p className="text-xs text-blue-800 leading-snug">{session.objective}</p>
                </div>
              )}
            </div>
          )}

          {/* VM Script hint */}
          {isTaskBound && session?.voicemailScript && !showObjective && (
            <p className="text-[10px] text-muted-foreground text-center">
              📋 Voicemail script available — expand objective above
            </p>
          )}

          {/* Number display */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={displayNumber}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter number"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
            />
            {displayNumber.length > 0 && (
              <button
                onClick={handleBackspace}
                className="text-gray-400 hover:text-gray-600 px-2 text-lg leading-none"
                aria-label="Backspace"
              >
                ⌫
              </button>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {KEYS.map((k) => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className="py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm transition-colors"
              >
                {k}
              </button>
            ))}
          </div>

          {/* Call / End Call button */}
          {isTaskBound && session?.callStartedAt ? (
            // Call in progress → show End Call
            <button
              onClick={handleCallEnded}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              End Call
            </button>
          ) : (
            // Not yet called — show Call button (tel: link)
            <a
              href={`tel:${displayNumber}`}
              onClick={handleCallStarted}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#4ade80] hover:bg-green-400 text-white font-semibold text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              {isTaskBound ? `Call ${session?.contactName ?? ""}` : "Call"}
            </a>
          )}

          {/* End Call shortcut when task-bound and call is dialling */}
          {isTaskBound && !session?.callStartedAt && (
            <button
              onClick={handleCallEnded}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
            >
              Skip call — log outcome manually →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
