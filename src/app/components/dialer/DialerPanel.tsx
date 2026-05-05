import { useState } from "react";
import { X, Minus, Phone, PhoneOff, ChevronDown, ChevronUp } from "lucide-react";
import { useDialer } from "@/app/contexts/DialerContext";

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

  const [input, setInput] = useState(
    session?.phone ?? initialNumber ?? "",
  );
  const [minimized, setMinimized] = useState(false);
  const [showObjective, setShowObjective] = useState(false);

  const handleKey = (k: string) => setInput((v) => v + k);
  const handleBackspace = () => setInput((v) => v.slice(0, -1));

  const handleClose = () => {
    closeDialer();
    onClose();
  };

  const isTaskBound = !!session?.taskId;
  const isOutcomePending = session?.status === "outcome-pending";
  const isCompleted = session?.status === "completed";

  // ── Outcome-pending state — slim banner ───────────────────────────────────
  if (isOutcomePending || isCompleted) {
    return (
      <div
        className="fixed bottom-6 z-[60] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{ width: 260, right: offsetRight }}
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
        <div className="p-4 text-center space-y-2">
          {isCompleted ? (
            <p className="text-sm text-green-600 font-medium">✓ Outcome saved</p>
          ) : (
            <>
              <div className="w-8 h-8 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                <PhoneOff className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-foreground">Call ended</p>
              <p className="text-xs text-muted-foreground leading-snug">
                Log the outcome in the task panel on the right.
              </p>
            </>
          )}
          <button
            onClick={handleClose}
            className="w-full mt-2 py-2 text-xs text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
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
