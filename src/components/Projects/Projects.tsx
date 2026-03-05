"use client";

import { useMemo, useState } from "react";
import { Check, FolderKanban, Plus, SquarePen, Trash2 } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { useProjects } from "@/context/ProjectsContext";
import { ActionStatus } from "@/types";
import { actionMatchesQuery, formatDate, getDaysRemaining } from "@/lib/utils";
import { Capture } from "../ui/Capture";
import { Loading } from "../ui/Loading";
import { ConfirmModal } from "../ui/ConfirmModal";

const statusLabels: Record<ActionStatus, string> = {
  backLog: "Backlog",
  nextActions: "Next",
  waiting: "Waiting",
  done: "Done",
  someday: "Someday",
};

export function Projects({ searchQuery = "" }: { searchQuery?: string }) {
  const { actions } = useActions();
  const { projects, loading, addProject, updateProject, deleteProject } =
    useProjects();
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#38bdf8");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState("");

  const filteredProjects = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return projects;
    return projects.filter((project) =>
      project.name.toLowerCase().includes(normalized),
    );
  }, [projects, searchQuery]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const selectedProjectActions = useMemo(() => {
    if (!selectedProjectId) return [];
    return actions.filter(
      (action) =>
        action.project_id === selectedProjectId &&
        actionMatchesQuery(action, searchQuery),
    );
  }, [actions, selectedProjectId, searchQuery]);

  const actionCountsByProject = useMemo(() => {
    return projects.reduce<Record<string, number>>((acc, project) => {
      acc[project.id] = actions.filter(
        (action) => action.project_id === project.id,
      ).length;
      return acc;
    }, {});
  }, [projects, actions]);

  const countsByStatus = useMemo(() => {
    return selectedProjectActions.reduce<Record<ActionStatus, number>>(
      (acc, action) => {
        acc[action.status] += 1;
        return acc;
      },
      {
        backLog: 0,
        nextActions: 0,
        waiting: 0,
        done: 0,
        someday: 0,
      },
    );
  }, [selectedProjectActions]);

  const handleAddProject = async () => {
    await addProject({ name: newProjectName, color: newProjectColor });
    setNewProjectName("");
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    await deleteProject(projectToDelete);
    setSelectedProjectId((prev) => (prev === projectToDelete ? null : prev));
    setProjectToDelete(null);
  };

  const handleSaveProjectName = async () => {
    if (!selectedProject) return;
    const cleanName = editingProjectName.trim();
    if (cleanName.length < 2) return;
    if (cleanName === selectedProject.name) {
      setIsEditingProjectName(false);
      return;
    }

    await updateProject(selectedProject.id, { name: cleanName });
    setIsEditingProjectName(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <Capture />

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <FolderKanban className="text-sky-500" size={24} />
        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
          Projects
        </h2>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/80 p-4 space-y-3 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Create Project
        </p>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-400"
          />
          <div className="flex items-center gap-2 md:contents">
            <input
              type="color"
              value={newProjectColor}
              onChange={(e) => setNewProjectColor(e.target.value)}
              className="h-10 w-12 bg-white border border-slate-300 rounded-lg px-1 py-1 cursor-pointer shrink-0"
            />
            <button
              onClick={handleAddProject}
              disabled={newProjectName.trim().length < 2}
              className="inline-flex h-10 md:flex-none justify-center items-center gap-1.5 rounded-lg border border-slate-200 bg-white/75 px-3 text-xs font-medium text-sky-700 hover:border-slate-300 hover:bg-sky-50 transition whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredProjects.map((project) => {
          const isSelected = selectedProjectId === project.id;
          return (
            <button
              key={project.id}
              onClick={() =>
                setSelectedProjectId((prev) =>
                  prev === project.id ? null : project.id,
                )
              }
              className={`rounded-xl border p-4 text-left transition ${
                isSelected
                  ? "border-sky-300 bg-sky-50"
                  : "border-slate-200 bg-white/80 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <p className="text-slate-900 font-medium">{project.name}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {actionCountsByProject[project.id] ?? 0}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {projects.length === 0 && (
        <p className="text-slate-500 text-sm">No projects yet.</p>
      )}
      {projects.length > 0 && filteredProjects.length === 0 && (
        <p className="text-slate-500 text-sm">
          No projects match the current search.
        </p>
      )}

      {selectedProject && (
        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 space-y-3 shadow-sm">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            {isEditingProjectName ? (
              <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center">
                <input
                  value={editingProjectName}
                  onChange={(e) => setEditingProjectName(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-sky-400"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingProjectName(selectedProject.name);
                      setIsEditingProjectName(false);
                    }}
                    className="cursor-pointer inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:border-slate-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedProject.name}
              </h3>
            )}
            <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <span className="text-xs text-slate-500">
                {selectedProjectActions.length} tasks
              </span>
              <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                <button
                  onClick={() => {
                    if (isEditingProjectName) {
                      handleSaveProjectName();
                      return;
                    }
                    setEditingProjectName(selectedProject.name);
                    setIsEditingProjectName(true);
                  }}
                  disabled={
                    isEditingProjectName && editingProjectName.trim().length < 2
                  }
                  className="inline-flex flex-1 sm:flex-none justify-center items-center gap-1.5 rounded-lg border border-sky-200 px-2.5 py-1 text-xs font-medium text-sky-700 hover:border-sky-400 hover:bg-sky-50 transition cursor-pointer"
                >
                  {isEditingProjectName ? (
                    <Check size={14} />
                  ) : (
                    <SquarePen size={14} />
                  )}
                  {isEditingProjectName ? "Save" : "Edit"}
                </button>
                <button
                  onClick={() => setProjectToDelete(selectedProject.id)}
                  className="inline-flex flex-1 sm:flex-none justify-center items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:border-rose-400 hover:bg-rose-50 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(statusLabels) as ActionStatus[]).map((status) => (
              <div
                key={status}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <p className="text-[11px] uppercase text-slate-500">
                  {statusLabels[status]}
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {countsByStatus[status]}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {selectedProjectActions.slice(0, 12).map((action) => {
              const remainingDays = action.due_date
                ? getDaysRemaining(action.due_date)
                : null;

              return (
                <div
                  key={action.id}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  <p className="text-sm text-slate-800">{action.title}</p>
                  <p className="text-[11px] text-slate-500 uppercase">
                    {statusLabels[action.status]}
                  </p>
                  {action.due_date && remainingDays !== null && (
                    <div className="mt-1 text-[11px]">
                      <p className="text-slate-500">
                        Due: {formatDate(action.due_date)}
                      </p>
                      <p
                        className={
                          remainingDays < 0
                            ? "text-rose-400"
                            : remainingDays === 0
                              ? "text-amber-500"
                              : "text-emerald-400"
                        }
                      >
                        {remainingDays < 0
                          ? `Vencida (${Math.abs(
                              Math.ceil(remainingDays),
                            )} dia(s))`
                          : remainingDays === 0
                            ? "Vence hoy"
                            : `Quedan ${Math.ceil(remainingDays)} dia(s)`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {selectedProjectActions.length === 0 && (
              <p className="text-sm text-slate-500">
                No tasks in this project yet.
              </p>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Are you sure? Actions will remain but without project."
        variant="danger"
      />
    </div>
  );
}
