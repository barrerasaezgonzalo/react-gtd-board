"use client";

import { useMemo, useState } from "react";
import { MAX_ITEMS_PER_PAGE } from "@/constants";
import { Action, ActionListViewProps, CardViewModel } from "@/types";
import { useProjects } from "@/context/ProjectsContext";
import { Capture } from "./Capture";
import { Title } from "./Title";
import { EmptyState } from "./EmptyState";
import { Card } from "./Card";
import { EditModal } from "./EditModal";
import { ConfirmModal } from "./ConfirmModal";
import { Loading } from "./Loading";

export function ActionListView({
  titleProps,
  actions,
  loading,
  saving,
  viewAllLabel,
  onDeleteAction,
  buildCardItem,
  extraModals,
}: ActionListViewProps) {
  const [showAll, setShowAll] = useState(false);
  const [editingItem, setEditingItem] = useState<Action | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { projects } = useProjects();
  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );
  const accentTone = titleProps.accentTone ?? "neutral";
  const viewAllToneClass =
    accentTone === "next"
      ? "border-sky-300 text-sky-700 hover:text-sky-800 hover:border-sky-400 hover:bg-sky-50"
      : accentTone === "waiting"
        ? "border-rose-300 text-rose-700 hover:text-rose-800 hover:border-rose-400 hover:bg-rose-50"
        : accentTone === "backlog"
          ? "border-amber-300 text-amber-700 hover:text-amber-800 hover:border-amber-400 hover:bg-amber-50"
          : accentTone === "someday"
            ? "border-cyan-300 text-cyan-700 hover:text-cyan-800 hover:border-cyan-400 hover:bg-cyan-50"
            : accentTone === "done"
              ? "border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50"
              : "border-slate-300 text-slate-600 hover:text-slate-800 hover:border-slate-400 hover:bg-slate-50";

  const displayedActions = useMemo(
    () => (showAll ? actions : actions.slice(0, MAX_ITEMS_PER_PAGE)),
    [actions, showAll],
  );

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await onDeleteAction(itemToDelete);
    setItemToDelete(null);
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <Capture />
      <Title {...titleProps} />

      {displayedActions.length === 0 && <EmptyState />}

      {displayedActions.map((action) => {
        const baseItem = buildCardItem(action, {
          openEdit: (actionOverride) =>
            setEditingItem(actionOverride ?? action),
          openDelete: () => setItemToDelete(action.id),
        });
        const project = action.project_id
          ? projectsById.get(action.project_id)
          : undefined;
        const item: CardViewModel = {
          accentTone,
          context: action.context ?? "home",
          projectName: project?.name,
          projectColor: project?.color,
          ...baseItem,
        };

        return <Card key={action.id} item={item} />;
      })}

      {!showAll && actions.length > MAX_ITEMS_PER_PAGE && (
        <button
          onClick={() => setShowAll(true)}
          className={`w-full cursor-pointer py-4 border-2 border-dashed rounded-xl transition-all font-medium text-sm ${viewAllToneClass}`}
        >
          + View all {viewAllLabel} ( +{actions.length - MAX_ITEMS_PER_PAGE} )
        </button>
      )}

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Action"
        message="Are you sure? This action cannot be undone."
        variant="danger"
      />

      {extraModals}

      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
