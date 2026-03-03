"use client";

import { useState } from "react";
import {
  SquarePen,
  Trash,
  Calendar,
  Loader,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { ActionCardProps } from "@/types";

export function Card({ item }: ActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayText = isExpanded
    ? item.text
    : (item.text ?? "").length > 100
      ? `${item.text?.substring(0, 100)}...`
      : item.text;
  const late = item?.dueDate?.includes("Vencida");
  return (
    <div
      className={`
     rounded-xl p-5 shadow-sm transition-all duration-300 group relative overflow-hidden
    ${late ? "bg-red-900/15 border border-red-500/40" : "bg-blue-900/15 border border-blue-500/40"}
    `}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold flex items-center text-lg gap-3 text-zinc-100 border-b border-b-zinc-500">
            {item.title}
          </p>
          <div className="flex items-center gap-3">
            {item.onEdit && (
              <SquarePen
                size={16}
                className="text-white hover:text-blue-400 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  item.onEdit?.();
                }}
              />
            )}
            {item.onRemove && (
              <Trash
                size={16}
                className="text-white hover:text-rose-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  item.onRemove?.();
                }}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] uppercase tracking-tight">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Calendar size={12} /> {item.date}
          </span>

          {item.dueDate?.trim() && item.remainingDays != null && (
            <span
              className={`
        flex items-center gap-1.5 font-bold
        ${
          item.remainingDays < 0
            ? "text-rose-500"
            : item.remainingDays < 1
              ? "text-rose-400"
              : "text-zinc-400"
        }
      `}
            >
              <Loader size={12} className="animate-spin-slow" />
              {item.remainingDays < 0
                ? "Vencido"
                : `Quedan ${Math.ceil(item.remainingDays)} día(s)`}{" "}
              {item.dueDate}
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
              className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition border border-2 border-zinc-600 hover:border-zinc-400 text-white whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                item.ctaAction?.();
              }}
            >
              {item.cta}
            </span>
          </div>
        )}
        {item.urgent && (
          <div className="absolute right-2 text-xs bottom-0 w-8 my-4 text-red-500">
            <ShieldAlert size={25} />
          </div>
        )}
      </div>
    </div>
  );
}
