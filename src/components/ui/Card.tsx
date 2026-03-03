"use client";

import { useState } from "react";
import {
  SquarePen,
  Trash,
  Calendar,
  Loader,
  ChevronDown,
  ShieldAlert,
  ChevronUp,
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
  const toneClass =
    item.accentTone === "next"
      ? "bg-sky-950/20 border border-sky-500/35"
      : item.accentTone === "waiting"
        ? "bg-amber-950/20 border border-amber-500/35"
        : item.accentTone === "backlog"
          ? "bg-violet-950/20 border border-violet-500/35"
          : item.accentTone === "someday"
            ? "bg-fuchsia-950/20 border border-fuchsia-500/35"
            : item.accentTone === "done"
              ? "bg-emerald-950/20 border border-emerald-500/35"
              : "bg-blue-900/15 border border-blue-500/40";

  return (
    <div
      className={`
     rounded-xl p-5 shadow-sm transition-all duration-300 group relative overflow-hidden
    ${late ? "bg-red-900/15 border border-red-500/40" : toneClass}
    `}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="border-b border-b-zinc-500 pb-1">
            <p className="font-semibold flex items-center text-lg gap-3 text-zinc-100">
              {item.title}
            </p>
            {item.projectName && (
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] uppercase tracking-wide text-zinc-300 bg-zinc-800/70 border border-zinc-700 rounded px-2 py-0.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.projectColor ?? "#38bdf8" }}
                />
                {item.projectName}
              </span>
            )}
            {item.energy && (
              <span className="inline-flex items-center gap-1 mt-1 ml-2 text-[10px] uppercase tracking-wide text-zinc-300 bg-zinc-800/70 border border-zinc-700 rounded px-2 py-0.5">
                Energy: {item.energy}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {item.onEdit && (
              <SquarePen
                size={22}
                className="text-white hover:text-blue-400 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  item.onEdit?.();
                }}
              />
            )}
            {item.onRemove && (
              <Trash
                size={22}
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
                : `Quedan ${Math.ceil(item.remainingDays)} dia(s)`}{" "}
              {item.dueDate}
            </span>
          )}
        </div>

        {item.text && (
          <div className="flex justify-between items-start w-full text-sm text-zinc-400 leading-relaxed gap-3">
            <p className="flex-1 max-w-3xl whitespace-pre-wrap">
              {displayText}
            </p>
            {(item.text ?? "").length > 100 &&
              (isExpanded ? (
                <ChevronUp
                  size={18}
                  onClick={() => setIsExpanded(false)}
                  className="text-zinc-600 hover:text-zinc-300 cursor-pointer transition"
                />
              ) : (
                <ChevronDown
                  size={18}
                  onClick={() => setIsExpanded(true)}
                  className="text-zinc-600 hover:text-zinc-300 cursor-pointer transition"
                />
              ))}
          </div>
        )}

        {item.file_urls && (
          <div className="my-3 space-y-2">
            {item.file_urls
              .split("\n")
              .map((url) => url.trim())
              .filter((url) => url.length > 0)
              .map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-400 hover:text-blue-300 hover:underline break-all transition"
                >
                  {url}
                </a>
              ))}
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
