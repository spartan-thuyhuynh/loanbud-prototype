import { useState } from "react";
import { X, Minus, Phone } from "lucide-react";

interface DialerPanelProps {
  onClose: () => void;
  initialNumber?: string;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export function DialerPanel({ onClose, initialNumber }: DialerPanelProps) {
  const [input, setInput] = useState(initialNumber ?? "");
  const [minimized, setMinimized] = useState(false);

  const handleKey = (k: string) => setInput((v) => v + k);
  const handleBackspace = () => setInput((v) => v.slice(0, -1));

  return (
    <div
      className="fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{ width: 260 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#2c3e50] text-white">
        <span className="text-sm font-semibold">Dialer</span>
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
        <div className="p-4 flex flex-col gap-3">
          {/* Number display */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter number"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
            />
            {input.length > 0 && (
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

          {/* Call button */}
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#4ade80] hover:bg-green-400 text-white font-semibold text-sm transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call
          </button>
        </div>
      )}
    </div>
  );
}
