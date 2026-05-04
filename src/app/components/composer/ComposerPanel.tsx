import { useState } from "react";
import { X, Minus, Send } from "lucide-react";

interface ComposerPanelProps {
  onClose: () => void;
  offsetRight?: number;
}

export function ComposerPanel({ onClose, offsetRight = 6 }: ComposerPanelProps) {
  const [minimized, setMinimized] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <div
      className="fixed bottom-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{ width: 480, right: `${offsetRight * 4}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#2c3e50] text-white">
        <span className="text-sm font-semibold">New Message</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized((v) => !v)}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="flex flex-col">
          {/* To */}
          <div className="flex items-center border-b border-gray-100 px-4 py-2 gap-2">
            <span className="text-xs text-gray-500 w-12">To</span>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipients"
              className="flex-1 text-sm focus:outline-none"
            />
          </div>

          {/* Subject */}
          <div className="flex items-center border-b border-gray-100 px-4 py-2 gap-2">
            <span className="text-xs text-gray-500 w-12">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="flex-1 text-sm focus:outline-none"
            />
          </div>

          {/* Body */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message..."
            rows={8}
            className="px-4 py-3 text-sm resize-none focus:outline-none"
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#2c3e50] hover:bg-[#3d5166] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
