"use client";

import { useState, useEffect, useRef } from "react";
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
  const { saving } = useActions();
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: number;
    if (isOpen) {
      timer = requestAnimationFrame(() => setIsVisible(true));
    } else {
      timer = requestAnimationFrame(() => setIsVisible(false));
    }
    return () => cancelAnimationFrame(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={modalRef}
        className={`bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 text-center transition-all duration-200 ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
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
            onClick={handleClose}
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
