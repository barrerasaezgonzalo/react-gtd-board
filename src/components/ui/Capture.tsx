"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2, X } from "lucide-react";
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

  const handleCapture = async () => {
    if (!isValid) return;
    setShowSuccess(false);
    await addCapture(value);
    setValue("");
    setShowSuccess(true);
  };

  return (
    <div className="relative group mb-12">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Plus
          size={18}
          className={`transition-colors ${
            isValid ? "text-sky-500" : "text-slate-400"
          }`}
        />
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await handleCapture();
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Capture something on your mind..."
          className="w-full bg-white/85 border border-slate-200 rounded py-4 sm:py-5 pl-12 pr-24 sm:pr-26 outline-none focus:border-sky-400/70 focus:ring-1 focus:ring-sky-200 transition-all placeholder:text-slate-400 text-base sm:text-lg text-slate-900 shadow-lg"
        />
        <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center gap-1 sm:gap-2">
          {value.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setValue("")}
              className="cursor-pointer inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-slate-200 bg-white/80 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"
              title="Limpiar texto"
            >
              <X size={13} />
            </button>
          )}
          <button
            type="submit"
            disabled={!isValid}
            className="cursor-pointer inline-flex h-7 sm:h-8 items-center justify-center rounded-md border border-sky-200 bg-white/90 px-2 sm:px-2.5 text-[11px] sm:text-xs font-semibold text-sky-700 hover:border-sky-400 hover:bg-sky-50 transition disabled:cursor-not-allowed disabled:opacity-50"
            title="Guardar captura"
          >
            Save
          </button>
        </div>
      </form>

      {value.length > 0 && !isValid && (
        <span className="absolute -bottom-6 left-2 text-[10px] text-red-500 font-medium uppercase tracking-wider">
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
