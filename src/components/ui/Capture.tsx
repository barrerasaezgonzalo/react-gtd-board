"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { useActions } from "@/context/ActionContext";

export function Capture() {
  const [value, setValue] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { addCapture } = useActions();
  const isValid = value.trim().length >= 5;

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleCapture = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    setShowSuccess(false);
    if (e.key === "Enter" && isValid) {
      await addCapture(value);
      setShowSuccess(true);
    }
  };

  return (
    <div className="relative group mb-12">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Plus
          size={18}
          className={`transition-colors ${
            isValid ? "text-blue-400" : "text-zinc-500"
          }`}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleCapture}
        placeholder="Capture something on your mind..."
        className="w-full bg-zinc-900/60 border border-zinc-800 rounded py-5 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 transition-all placeholder:text-zinc-600 text-lg shadow-2xl"
      />

      {value.length > 0 && !isValid && (
        <span className="absolute -bottom-6 left-2 text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
          At least 5 characters required
        </span>
      )}

      <div
        className={`absolute -bottom-7 left-2 flex items-center gap-2 text-emerald-500 transition-all duration-300 ${
          showSuccess
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <CheckCircle2 size={14} />
        <span className="text-[10px] font-medium uppercase tracking-wider">
          Action captured to backlog
        </span>
      </div>
    </div>
  );
}
