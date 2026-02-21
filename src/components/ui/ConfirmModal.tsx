"use client";

import { useActions } from "@/context/ActionContext";
import { ConfirmModalProps } from "@/types";
import { AlertCircle } from "lucide-react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant,
}: ConfirmModalProps) {
  if (!isOpen) return null;
  const { saving } = useActions();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
        <div className="flex justify-center mb-4">
          <div
            className={`bg-gray-500/10 p-3 rounded-full ${variant === "danger" ? "text-rose-600" : "text-blue-600"}`}
          >
            <AlertCircle size={24} />
          </div>
        </div>

        <h3 className="text-zinc-100 font-semibold text-lg mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={onConfirm}
            className={`flex-1 ${variant === "danger" ? "bg-rose-600 hover:bg-rose-500" : "bg-blue-600 hover:bg-blue-500"} text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer`}
          >
            {saving ? "Working..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
