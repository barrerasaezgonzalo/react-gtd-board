"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { EditModalProps, ActionParams } from "@/types";
import { useActions } from "@/context/ActionContext";
import { useProjects } from "@/context/ProjectsContext";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { toDateTimeLocalValue } from "@/lib/utils";

export function EditModal({ item, onClose, saving }: EditModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<ActionParams>({
    title: item.title,
    due_date: item.due_date ? toDateTimeLocalValue(item.due_date) : "",
    status: item.status,
    text: item.text,
    urgent: item.urgent,
    energy: item.energy ?? "medium",
    context: item.context ?? "home",
    file_urls: item.file_urls ?? "",
    project_id: item.project_id ?? null,
  });

  const textareaRef = useAutoResizeTextarea(formData.text);
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
      context: formData.context ?? "home",
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

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-sm p-4 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white border border-slate-200 w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200 ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-slate-900 font-semibold">Edit Action</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-2 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center gap-4">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
                Title:
              </span>

              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`
                  w-full pl-16 pr-4 py-2 bg-white border rounded-lg
                  text-sm text-slate-900 focus:outline-none transition
                  ${
                    !((formData.title ?? "").trim().length > 5)
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-300 focus:border-sky-400"
                  }
                `}
              />
            </div>
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
              Due Date:
            </span>
            <input
              name="due_date"
              type="datetime-local"
              value={formData.due_date ?? ""}
              onChange={handleChange}
              className={`
                w-full pl-22 pr-4 bg-white border rounded-lg py-2 text-sm text-slate-900 focus:outline-none transition [color-scheme:light]
                ${isDueDateMissing ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-sky-400"}
                `}
            />
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
              Status
            </span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full pl-22 pr-4 bg-white border border-slate-300 rounded-lg py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-400 transition appearance-none cursor-pointer"
            >
              <option className="bg-white" value="nextActions">
                Next Actions
              </option>
              <option className="bg-white" value="backLog">
                BackLog
              </option>
              <option className="bg-white" value="waiting">
                Waiting
              </option>
              <option className="bg-white" value="done">
                Done
              </option>
              <option className="bg-white" value="someday">
                Someday / Maybe
              </option>
            </select>
          </div>

          <div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-tight text-slate-500 block mb-1.5">
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
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-400 transition resize-none"
              />
            </div>
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
              Priority
            </span>
            <select
              name="urgent"
              value={String(formData.urgent)}
              onChange={handleChange}
              className="w-full pl-22 bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-400 transition appearance-none cursor-pointer"
            >
              <option className="bg-white" value="false">
                Normal
              </option>
              <option className="bg-white" value="true">
                Urgent
              </option>
            </select>
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
              Energy
            </span>
            <select
              name="energy"
              value={formData.energy ?? "medium"}
              onChange={handleChange}
              className="w-full pl-22 bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-400 transition appearance-none cursor-pointer"
            >
              <option className="bg-white" value="high">
                High
              </option>
              <option className="bg-white" value="medium">
                Medium
              </option>
              <option className="bg-white" value="low">
                Low
              </option>
            </select>
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
              Context
            </span>
            <select
              name="context"
              value={formData.context}
              onChange={handleChange}
              className="w-full pl-22 bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-400 transition appearance-none cursor-pointer"
            >
              <option className="bg-white" value="home">
                Home
              </option>
              <option className="bg-white" value="work">
                Work
              </option>
            </select>
          </div>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
              Project
            </span>
            <select
              name="project_id"
              value={formData.project_id ?? ""}
              onChange={handleChange}
              className="w-full pl-22 bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-400 transition appearance-none cursor-pointer"
            >
              <option className="bg-white" value="">
                No project
              </option>
              {projects.map((project) => (
                <option
                  key={project.id}
                  className="bg-white"
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-tight text-slate-500 block mb-1.5">
              Description
            </label>
            <textarea
              ref={textareaRef}
              name="text"
              value={formData.text || ""}
              onChange={handleChange}
              rows={4}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-400 transition resize-none overflow-hidden"
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50/90 flex justify-end gap-3 border-t border-slate-200 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            disabled={saving || !isFormValid}
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              isFormValid
                ? "border border-2 border-sky-500 hover:bg-sky-100 text-sky-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Working..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
