import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { TaskItem } from "@/app/types";

// ── Session types ─────────────────────────────────────────────────────────────

export type DialerSessionStatus =
  | "active"          // dialer is open, call is about to start or in progress
  | "outcome-pending" // call ended, waiting for agent to log outcome
  | "completed";      // outcome captured, session closing

export interface DialerSession {
  sessionId: string;
  /** The task this call is bound to. Undefined in free-dial mode. */
  taskId?: string;
  enrollmentId?: string;
  stepId?: string;
  contactId?: string;
  contactName?: string;
  phone: string;
  /** Call objective — shown in the dialer panel as context */
  objective?: string;
  /** Voicemail script — expandable reference in dialer panel */
  voicemailScript?: string;
  status: DialerSessionStatus;
  openedAt: Date;
  callStartedAt?: Date;
  callEndedAt?: Date;
}

// ── Context value ─────────────────────────────────────────────────────────────

interface DialerContextValue {
  /** Whether the dialer panel is visible */
  dialerOpen: boolean;
  /** The currently active session (null when dialer is closed) */
  session: DialerSession | null;
  /** Pre-filled number for free-dial mode (legacy compat) */
  dialerNumber: string;

  /** Open the dialer bound to a specific task (from TaskDetailPanel) */
  openDialerForTask: (task: TaskItem, phone: string) => void;
  /** Open the dialer in free-dial mode (sidebar button, no task) */
  openDialer: (number?: string) => void;

  /** Agent clicked the tel: link / started the call */
  handleCallStarted: () => void;
  /** Agent ended the call — transitions to outcome-pending */
  handleCallEnded: () => void;

  /** Called from OutcomeCapturePanel inside TaskDetailPanel */
  handleOutcomeSubmitted: (
    disposition: string,
    note: string | undefined,
    onComplete: (taskId: string, disposition: string, note?: string) => void,
  ) => void;

  /** Close the dialer (free-dial or after outcome captured) */
  closeDialer: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const DialerContext = createContext<DialerContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function DialerProvider({ children }: { children: ReactNode }) {
  const [dialerOpen, setDialerOpen] = useState(false);
  const [dialerNumber, setDialerNumber] = useState("");
  const [session, setSession] = useState<DialerSession | null>(null);

  const openDialerForTask = useCallback((task: TaskItem, phone: string) => {
    const newSession: DialerSession = {
      sessionId: `session-${Date.now()}`,
      taskId: task.id,
      enrollmentId: task.enrollmentId,
      stepId: task.stepId,
      contactId: task.contactId,
      contactName: task.contactName,
      phone: phone.replace(/\D/g, ""),
      objective: task.triggerContext,
      voicemailScript: task.notes,
      status: "active",
      openedAt: new Date(),
    };
    setSession(newSession);
    setDialerNumber(phone.replace(/\D/g, ""));
    setDialerOpen(true);
  }, []);

  const openDialer = useCallback((number?: string) => {
    // Free-dial — no task bound
    setSession(null);
    setDialerNumber(number ?? "");
    setDialerOpen(true);
  }, []);

  const handleCallStarted = useCallback(() => {
    setSession((prev) =>
      prev ? { ...prev, callStartedAt: new Date() } : prev,
    );
  }, []);

  const handleCallEnded = useCallback(() => {
    setSession((prev) =>
      prev ? { ...prev, status: "outcome-pending", callEndedAt: new Date() } : prev,
    );
  }, []);

  /**
   * Called by OutcomeCapturePanel when the agent submits a disposition.
   * `onComplete` is `handleCompleteTaskWithOutcome` from AppDataContext,
   * passed down via TaskDetailPanel so DialerContext doesn't import AppDataContext
   * (avoiding circular context dependencies).
   */
  const handleOutcomeSubmitted = useCallback(
    (
      disposition: string,
      note: string | undefined,
      onComplete: (taskId: string, disposition: string, note?: string) => void,
    ) => {
      const taskId = session?.taskId;
      if (taskId) {
        onComplete(taskId, disposition, note);
      }
      setSession((prev) =>
        prev ? { ...prev, status: "completed" } : prev,
      );
      // Brief delay so the user sees the completed state before the panel closes
      setTimeout(() => {
        setDialerOpen(false);
        setSession(null);
      }, 400);
    },
    [session],
  );

  const closeDialer = useCallback(() => {
    setDialerOpen(false);
    setSession(null);
    setDialerNumber("");
  }, []);

  return (
    <DialerContext.Provider
      value={{
        dialerOpen,
        session,
        dialerNumber,
        openDialerForTask,
        openDialer,
        handleCallStarted,
        handleCallEnded,
        handleOutcomeSubmitted,
        closeDialer,
      }}
    >
      {children}
    </DialerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDialer(): DialerContextValue {
  const ctx = useContext(DialerContext);
  if (!ctx) throw new Error("useDialer must be used within a DialerProvider");
  return ctx;
}
