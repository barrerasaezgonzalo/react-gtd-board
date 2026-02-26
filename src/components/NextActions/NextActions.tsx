"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";
import { Card } from "../ui/Card";
import { Capture } from "../ui/Capture";
import { Title } from "../ui/Title";
import { useActions } from "@/context/ActionContext";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { EditModal } from "../ui/EditModal";
import { ConfirmModal } from "../ui/ConfirmModal";
import { MAX_ITEMS_PER_PAGE } from "@/constants";
import { EmptyState } from "../ui/EmptyState";
import { Action } from "@/types";
import { Loading } from "../ui/Loading";

export function NextActions() {
  const [showAll, setShowAll] = useState(false);
  const [editingItem, setEditingItem] = useState<Action | null>(null);
  const { actions, loading, saving, updateAction, deleteAction } = useActions();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToComplete, setItemToComplete] = useState<string | null>(null);
  const nextActions = actions.filter(
    (action) => action.status === "nextActions",
  );
  const displayedActions = showAll
    ? nextActions
    : nextActions.slice(0, MAX_ITEMS_PER_PAGE);

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteAction(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleMarkAsDone = async () => {
    if (itemToComplete) {
      await updateAction({ id: itemToComplete, updates: { status: "done" } });
      setItemToComplete(null);
    }
  };

  if (loading) return <Loading />;
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Capture />
      <Title title="Next Actions" icon={Rocket} />

      {displayedActions.length === 0 && <EmptyState />}

      {displayedActions.map((action) => (
        <Card
          key={action.id}
          item={{
            urgent: action.urgent,
            title: action.title,
            onEdit: () => setEditingItem(action),
            onRemove: () => setItemToDelete(action.id),
            date: formatDate(action.created_at ?? ""),
            dueDate: `${getDaysRemaining(action.due_date ?? "")} ${formatDate(action.due_date ?? "")}`,
            text: action.text,
            cta: "Mark as Done",
            ctaAction: () => setItemToComplete(action.id),
          }}
        />
      ))}

      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          saving={saving}
        />
      )}

      {!showAll && nextActions.length > MAX_ITEMS_PER_PAGE && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full cursor-pointer py-4 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/20 transition-all font-medium text-sm"
        >
          + View all next actions ({nextActions.length})
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

      <ConfirmModal
        isOpen={!!itemToComplete}
        onClose={() => setItemToComplete(null)}
        onConfirm={handleMarkAsDone}
        title="Done Action"
        message="Do you want to mark this action as done?"
      />
    </div>
  );
}
