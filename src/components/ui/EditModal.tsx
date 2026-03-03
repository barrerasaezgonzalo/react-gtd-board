"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { EditModalProps, ActionParams } from "@/types";
import { useActions } from "@/context/ActionContext";
import { useFilePreview } from "@/hooks/useFilePreview";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { format } from "date-fns";

export function EditModal({ item, onClose, saving }: EditModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [removeFile, setRemoveFile] = useState(false);
  const [errorFallback, setErrorFallback] = useState<string | null>(null);
  const [formData, setFormData] = useState<ActionParams>({
    title: item.title,
    due_date: item.due_date
      ? format(new Date(item.due_date), "yyyy-MM-dd'T'HH:mm")
      : "",
    status: item.status,
    text: item.text,
    urgent: item.urgent,
  });

  const textareaRef = useAutoResizeTextarea(formData.text);
  const modalRef = useRef<HTMLDivElement>(null);
  const isFormValid =
    (formData.title ?? "").trim().length > 5 &&
    (formData.status !== "nextActions" ||
      (formData.due_date ?? "").trim() !== "");
  const isDueDateMissing =
    formData.status === "nextActions" && !(formData.due_date ?? "").trim();
  const { file, preview, fileName, handleUpload } = useFilePreview({
    bucket: "gtd",
    initialPath: item.file_path,
  });
  const displaySrc = errorFallback || preview || "";
  const { updateAction } = useActions();
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "urgent" ? value === "true" : value,
    }));
  };

  const handleSave = async () => {
    const normalizedData = {
      ...formData,
      due_date:
        formData.due_date && formData.due_date.trim() !== ""
          ? formData.due_date
          : null,
    };

    await updateAction({
      id: item.id,
      updates: normalizedData,
      file,
      removeFile,
    });
    onClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={modalRef}
        className={`bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200 ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h3 className="text-zinc-100 font-semibold">Edit Action</h3>
          <button
            onClick={handleClose}
            className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-tight text-zinc-500 block mb-1.5">
              Title
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`
                w-full bg-zinc-800/50 border rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none transition
                ${!((formData.title ?? "").trim().length > 5) ? "border-red-700 focus:border-red-500/50" : "border-zinc-700 focus:border-blue-500/50"}
                `}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-tight text-zinc-500 block mb-1.5">
              Due Date
            </label>
            <input
              name="due_date"
              type="datetime-local"
              value={formData.due_date ?? ""}
              onChange={handleChange}
              className={`
                w-full bg-zinc-800/50 border rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none transition [color-scheme:dark]
                ${isDueDateMissing ? "border-red-700 focus:border-red-500/50" : "border-zinc-700 focus:border-blue-500/50"}
                `}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-tight text-zinc-500 block mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition appearance-none cursor-pointer"
            >
              <option className="bg-zinc-800" value="nextActions">
                Next Actions
              </option>
              <option className="bg-zinc-800" value="backLog">
                BackLog
              </option>
              <option className="bg-zinc-800" value="waiting">
                Waiting
              </option>
              <option className="bg-zinc-800" value="done">
                Done
              </option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-tight text-zinc-500 block mb-1.5">
              File
            </label>
            <input
              type="file"
              onChange={(e) => {
                if (!e.target.files?.length) return;
                handleUpload(e.target.files[0]);
              }}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition"
            />
            {displaySrc && !removeFile && (
              <div className="mt-3 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <a href={preview ?? "#"} target="_blank">
                  <Image
                    src={displaySrc}
                    alt="preview"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-md border border-zinc-700"
                    onError={() => setErrorFallback("/fallBackImage.png")}
                    unoptimized
                  />
                </a>
                <div className="text-sm text-zinc-300 truncate">{fileName}</div>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setRemoveFile(true);
                  }}
                >
                  <X size={20} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-tight text-zinc-500 block mb-1.5">
              Priority
            </label>
            <select
              name="urgent"
              value={String(formData.urgent)}
              onChange={handleChange}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition appearance-none cursor-pointer"
            >
              <option value="false">Normal</option>
              <option value="true">Urgent</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-tight text-zinc-500 block mb-1.5">
              Description
            </label>
            <textarea
              ref={textareaRef}
              name="text"
              value={formData.text || ""}
              onChange={handleChange}
              rows={2}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition resize-none overflow-hidden"
            />
          </div>
        </div>

        <div className="p-6 bg-zinc-800/20 flex justify-end gap-3 border-t border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition"
          >
            Cancel
          </button>

          <button
            disabled={saving || !isFormValid}
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              isFormValid
                ? "border border-2 border-blue-600 hover:bg-blue-900 text-white"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            {saving ? "Working..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
