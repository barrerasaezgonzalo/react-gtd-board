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
  const metaBadgeClass =
    "inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-700 bg-white/80 border border-slate-200 rounded px-2 py-1 leading-none";
  const displayText = isExpanded
    ? item.text
    : (item.text ?? "").length > 100
      ? `${item.text?.substring(0, 100)}...`
      : item.text;
  const late = item?.dueDate?.includes("Vencida");
  const isDueToday = item.remainingDays === 0;
  const toneClass =
    item.accentTone === "next"
      ? "bg-sky-100/70 border border-sky-300"
      : item.accentTone === "waiting"
        ? "bg-rose-100/70 border border-rose-300"
        : item.accentTone === "backlog"
          ? "bg-amber-100/75 border border-amber-300"
          : item.accentTone === "someday"
            ? "bg-cyan-100/75 border border-cyan-300"
            : item.accentTone === "done"
              ? "bg-emerald-100/75 border border-emerald-300"
              : "bg-cyan-100/75 border border-cyan-300";

  return (
    <div
      className={`
     rounded-xl p-5 shadow-sm transition-all duration-300 group relative overflow-hidden
    ${late ? "bg-rose-100/80 border border-rose-400" : toneClass}
    `}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="border-b border-b-slate-300 pb-1">
            <p className="font-semibold flex items-center text-lg gap-3 text-slate-900">
              {item.title}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {item.projectName && (
                <span className={metaBadgeClass}>
                  <span
                    className="block h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.projectColor ?? "#38bdf8" }}
                  />
                  {item.projectName}
                </span>
              )}
              {item.energy && (
                <span className={metaBadgeClass}>Energy: {item.energy}</span>
              )}
              {item.context && (
                <span className={metaBadgeClass}>Context: {item.context}</span>
              )}
            </div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            {item.onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  item.onEdit?.();
                }}
                className="inline-flex flex-1 justify-center sm:flex-none sm:w-auto items-center gap-1.5 rounded-lg border border-slate-200 bg-white/75 px-2.5 py-1 text-xs font-medium text-sky-700 hover:border-slate-300 hover:bg-sky-50 transition cursor-pointer"
              >
                <SquarePen size={14} />
                Edit
              </button>
            )}
            {item.onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  item.onRemove?.();
                }}
                className="inline-flex flex-1 justify-center sm:flex-none sm:w-auto items-center gap-1.5 rounded-lg border border-slate-200 bg-white/75 px-2.5 py-1 text-xs font-medium text-rose-700 hover:border-slate-300 hover:bg-rose-50 transition cursor-pointer"
              >
                <Trash size={14} />
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 text-[11px] uppercase tracking-tight sm:flex-row sm:items-center sm:gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Calendar size={12} /> {item.date}
          </span>

          {item.dueDate?.trim() && item.remainingDays != null && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white/70 px-2 py-0.5 font-semibold text-slate-700">
              <Loader
                size={12}
                className={`animate-spin-slow ${
                  item.remainingDays < 0
                    ? "text-rose-400"
                    : isDueToday
                      ? "text-amber-500"
                      : "text-slate-500"
                }`}
              />
              <span
                className={
                  item.remainingDays < 0
                    ? "text-rose-500"
                    : isDueToday
                      ? "text-amber-600"
                      : "text-slate-700"
                }
              >
                {item.remainingDays < 0
                  ? `Vencido ${Math.ceil(item.remainingDays)} dia(s)`
                  : isDueToday
                    ? "Vence hoy"
                    : `Quedan ${Math.ceil(item.remainingDays)} dia(s)`}
              </span>
              <span className="text-slate-500">{item.dueDate}</span>
            </span>
          )}
        </div>

        {item.text && (
          <div className="flex justify-between items-start w-full text-sm text-slate-700 leading-relaxed gap-3">
            <p className="flex-1 max-w-3xl whitespace-pre-wrap">
              {displayText}
            </p>
            {(item.text ?? "").length > 100 &&
              (isExpanded ? (
                <ChevronUp
                  size={18}
                  onClick={() => setIsExpanded(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer transition"
                />
              ) : (
                <ChevronDown
                  size={18}
                  onClick={() => setIsExpanded(true)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer transition"
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
                  className="block text-xs text-sky-600 hover:text-sky-700 hover:underline break-all transition"
                >
                  {url}
                </a>
              ))}
          </div>
        )}

        {item.ctaAction && (
          <div className="flex items-center justify-between">
            <span
              className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition border border-2 border-slate-300 hover:border-slate-500 text-slate-900 whitespace-nowrap bg-white/70"
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
