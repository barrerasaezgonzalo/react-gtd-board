"use client";

import { useMemo, useState } from "react";
import { FolderKanban, Trash2 } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { useProjects } from "@/context/ProjectsContext";
import { ActionStatus } from "@/types";
import { formatDate, getDaysRemaining } from "@/lib/utils";
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

export function Projects() {
  const { actions } = useActions();
  const { projects, loading, addProject, deleteProject } = useProjects();
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#38bdf8");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const selectedProjectActions = useMemo(() => {
    if (!selectedProjectId) return [];
    return actions.filter((action) => action.project_id === selectedProjectId);
  }, [actions, selectedProjectId]);

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
    if (!selectedProjectId && projects.length === 0) return;
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    await deleteProject(projectToDelete);
    setSelectedProjectId((prev) => (prev === projectToDelete ? null : prev));
    setProjectToDelete(null);
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <Capture />

      <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-2">
        <FolderKanban className="text-cyan-400" size={24} />
        <h2 className="text-2xl font-bold uppercase tracking-widest text-white">
          Projects
        </h2>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
        <p className="text-xs uppercase tracking-wide text-zinc-400">
          Create Project
        </p>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
            className="flex-1 bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/60"
          />
          <input
            type="color"
            value={newProjectColor}
            onChange={(e) => setNewProjectColor(e.target.value)}
            className="h-10 w-12 bg-zinc-800/60 border border-zinc-700 rounded-lg px-1 py-1 cursor-pointer"
          />
          <button
            onClick={handleAddProject}
            disabled={newProjectName.trim().length < 2}
            className="px-4 py-2 rounded-lg border border-cyan-700 text-cyan-300 hover:bg-cyan-950/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {projects.map((project) => {
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
                  ? "border-cyan-500 bg-cyan-950/20"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <p className="text-zinc-100 font-medium">{project.name}</p>
                </div>
                <span className="text-xs text-zinc-400">
                  {actionCountsByProject[project.id] ?? 0}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {projects.length === 0 && (
        <p className="text-zinc-500 text-sm">No projects yet.</p>
      )}

      {selectedProject && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-100">
              {selectedProject.name}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400">
                {selectedProjectActions.length} tasks
              </span>
              <button
                onClick={() => setProjectToDelete(selectedProject.id)}
                className="inline-flex items-center gap-1 text-xs text-rose-400 border border-rose-800/70 hover:border-rose-600 px-2 py-1 rounded-md transition"
              >
                <Trash2 size={12} />
                Delete project
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(statusLabels) as ActionStatus[]).map((status) => (
              <div
                key={status}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
              >
                <p className="text-[11px] uppercase text-zinc-500">
                  {statusLabels[status]}
                </p>
                <p className="text-lg font-semibold text-zinc-200">
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
                  className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2"
                >
                  <p className="text-sm text-zinc-200">{action.title}</p>
                  <p className="text-[11px] text-zinc-500 uppercase">
                    {statusLabels[action.status]}
                  </p>
                  {action.due_date && remainingDays !== null && (
                    <div className="mt-1 text-[11px]">
                      <p className="text-zinc-400">
                        Due: {formatDate(action.due_date)}
                      </p>
                      <p
                        className={
                          remainingDays < 0
                            ? "text-rose-400"
                            : remainingDays < 1
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }
                      >
                        {remainingDays < 0
                          ? `Vencida (${Math.abs(
                              Math.ceil(remainingDays),
                            )} dia(s))`
                          : `Quedan ${Math.ceil(remainingDays)} dia(s)`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {selectedProjectActions.length === 0 && (
              <p className="text-sm text-zinc-500">
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
