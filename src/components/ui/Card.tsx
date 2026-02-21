"use client";

import { useState } from "react";
import { SquarePen, Trash, Calendar, Loader, ChevronDown } from "lucide-react";
import { ActionCardProps } from "@/types";

export function Card({ item }: ActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayText = isExpanded
    ? item.text
    : (item.text ?? "").length > 100
      ? `${item.text?.substring(0, 100)}...`
      : item.text;

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 shadow-sm hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-300 group relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${!item.urgent ? "bg-blue-500" : "bg-red-500"} opacity-40`}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold flex items-center gap-3 text-zinc-100">
            {item.title}
          </p>
          <div className="flex items-center gap-3">
            {item.onEdit && (
              <SquarePen
                size={16}
                className="text-zinc-500 hover:text-indigo-400 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  item.onEdit?.();
                }}
              />
            )}
            {item.onRemove && (
              <Trash
                size={16}
                className="text-zinc-500 hover:text-rose-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  item.onRemove?.();
                }}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-tight text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} /> {item.date}
          </span>
          {item.dueDate && item.dueDate.trim() && (
            <span className="text-rose-400/80 flex items-center gap-1.5">
              <Loader size={12} className="animate-spin-slow" /> {item.dueDate}
            </span>
          )}
        </div>

        {item.text && (
          <div className="flex justify-between w-full text-sm text-zinc-400 leading-relaxed">
            <p className="max-w-3xl whitespace-pre-wrap">{displayText}</p>
            {(item.text ?? "").length > 100 && (
              <ChevronDown
                size={18}
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-zinc-600 hover:text-zinc-300 cursor-pointer transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
              />
            )}
          </div>
        )}

        {item.ctaAction && (
          <div className="flex items-center justify-between">
            <span
              className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/20 uppercase cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                item.ctaAction?.();
              }}
            >
              {item.cta}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
