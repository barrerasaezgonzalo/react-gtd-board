"use client";

import { ReactNode, useMemo, useState } from "react";
import { MAX_ITEMS_PER_PAGE } from "@/constants";
import { Action, CardViewModel, TitleProps } from "@/types";
import { useProjects } from "@/context/ProjectsContext";
import { Capture } from "./Capture";
import { Title } from "./Title";
import { EmptyState } from "./EmptyState";
import { Card } from "./Card";
import { EditModal } from "./EditModal";
import { ConfirmModal } from "./ConfirmModal";
import { Loading } from "./Loading";

type CardBuilderHelpers = {
  openEdit: (actionOverride?: Action) => void;
  openDelete: () => void;
};

interface ActionListViewProps {
  titleProps: TitleProps;
  actions: Action[];
  loading: boolean;
  saving: boolean;
  viewAllLabel: string;
  onDeleteAction: (id: string) => Promise<void>;
  buildCardItem: (action: Action, helpers: CardBuilderHelpers) => CardViewModel;
  extraModals?: ReactNode;
}

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
      ? "border-sky-700 text-sky-400 hover:text-sky-300 hover:border-sky-500 hover:bg-sky-950/20"
      : accentTone === "waiting"
        ? "border-amber-700 text-amber-400 hover:text-amber-300 hover:border-amber-500 hover:bg-amber-950/20"
        : accentTone === "backlog"
          ? "border-violet-700 text-violet-400 hover:text-violet-300 hover:border-violet-500 hover:bg-violet-950/20"
          : accentTone === "someday"
            ? "border-fuchsia-700 text-fuchsia-400 hover:text-fuchsia-300 hover:border-fuchsia-500 hover:bg-fuchsia-950/20"
            : accentTone === "done"
              ? "border-emerald-700 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500 hover:bg-emerald-950/20"
              : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/20";

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
          + View all {viewAllLabel} ({actions.length})
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
