"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { EditModalProps, ActionParams } from "@/types";
import { useActions } from "@/context/ActionContext";
import { useProjects } from "@/context/ProjectsContext";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { format } from "date-fns";

export function EditModal({ item, onClose, saving }: EditModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<ActionParams>({
    title: item.title,
    due_date: item.due_date
      ? format(new Date(item.due_date), "yyyy-MM-dd'T'HH:mm")
      : "",
    status: item.status,
    text: item.text,
    urgent: item.urgent,
    energy: item.energy ?? "medium",
    context: item.context,
    file_urls: item.file_urls ?? "",
    project_id: item.project_id ?? null,
  });

  const textareaRef = useAutoResizeTextarea(formData.text);
  const modalRef = useRef<HTMLDivElement>(null);
  const isFormValid =
    (formData.title ?? "").trim().length > 5 &&
    (formData.status !== "nextActions" ||
      (formData.due_date ?? "").trim() !== "");
  const isDueDateMissing =
    formData.status === "nextActions" && !(formData.due_date ?? "").trim();
  const { updateAction } = useActions();
  const { projects } = useProjects();
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "urgent"
          ? value === "true"
          : name === "project_id"
            ? value || null
            : value,
    }));
  };

  const handleSave = async () => {
    const cleanedUrls = (formData.file_urls || "")
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .sort();

    const normalizedData = {
      ...formData,
      file_urls: cleanedUrls.join("\n"),
      due_date:
        formData.due_date && formData.due_date.trim() !== ""
          ? formData.due_date
          : null,
    };

    await updateAction({
      id: item.id,
      updates: normalizedData,
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
        className={`bg-zinc-900 border border-zinc-800 w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200 ${
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

        <div className="px-6 py-2 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center gap-4">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">
                Title:
              </span>

              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`
                  w-full pl-16 pr-4 py-2 bg-zinc-800/50 border rounded-lg
                  text-sm text-zinc-200 focus:outline-none transition
                  ${
                    !((formData.title ?? "").trim().length > 5)
                      ? "border-red-700 focus:border-red-500/50"
                      : "border-zinc-700 focus:border-blue-500/50"
                  }
                `}
              />
            </div>
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">
              Due Date:
            </span>
            <input
              name="due_date"
              type="datetime-local"
              value={formData.due_date ?? ""}
              onChange={handleChange}
              className={`
                w-full pl-22 pr-4 bg-zinc-800/50 border rounded-lg py-2 text-sm text-zinc-200 focus:outline-none transition [color-scheme:dark]
                ${isDueDateMissing ? "border-red-700 focus:border-red-500/50" : "border-zinc-700 focus:border-blue-500/50"}
                `}
            />
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">
              Status
            </span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full pl-22 pr-4 bg-zinc-800/50 border border-zinc-700 rounded-lg py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition appearance-none cursor-pointer"
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
              <option className="bg-zinc-800" value="someday">
                Someday / Maybe
              </option>
            </select>
          </div>

          <div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-tight text-zinc-500 block mb-1.5">
                Past URL Files // One URL per line
              </label>

              <textarea
                name="file_urls"
                value={formData.file_urls || ""}
                onChange={handleChange}
                placeholder={`https://example.com/file1.pdf
https://example.com/file2.png
`}
                rows={4}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition resize-none"
              />
            </div>
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">
              Priority
            </span>
            <select
              name="urgent"
              value={String(formData.urgent)}
              onChange={handleChange}
              className="w-full pl-22 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition appearance-none cursor-pointer"
            >
              <option className="bg-zinc-800" value="false">
                Normal
              </option>
              <option className="bg-zinc-800" value="true">
                Urgent
              </option>
            </select>
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">
              Energy
            </span>
            <select
              name="energy"
              value={formData.energy ?? "medium"}
              onChange={handleChange}
              className="w-full pl-22 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition appearance-none cursor-pointer"
            >
              <option className="bg-zinc-800" value="low">
                Low
              </option>
              <option className="bg-zinc-800" value="medium">
                Medium
              </option>
              <option className="bg-zinc-800" value="high">
                High
              </option>
            </select>
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">
              Context
            </span>
            <select
              name="context"
              value={formData.context}
              onChange={handleChange}
              className="w-full pl-22 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition appearance-none cursor-pointer"
            >
              <option className="bg-zinc-800" value="home">
                Home
              </option>
              <option className="bg-zinc-800" value="work">
                Work
              </option>
            </select>
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">
              Project
            </span>
            <select
              name="project_id"
              value={formData.project_id ?? ""}
              onChange={handleChange}
              className="w-full pl-22 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition appearance-none cursor-pointer"
            >
              <option className="bg-zinc-800" value="">
                No project
              </option>
              {projects.map((project) => (
                <option
                  key={project.id}
                  className="bg-zinc-800"
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}
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
              rows={4}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition resize-none overflow-hidden"
            />
          </div>
        </div>

        <div className="p-6 bg-zinc-800/20 flex justify-end gap-3 border-t border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
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
