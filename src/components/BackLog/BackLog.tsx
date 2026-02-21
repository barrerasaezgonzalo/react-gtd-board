"use client";

import { useState } from "react";
import { Logs } from "lucide-react";
import { Card } from "../ui/Card";
import { Title } from "../ui/Title";
import { useActions } from "@/context/ActionContext";
import { formatDate } from "@/lib/utils";
import { EditModal } from "../ui/EditModal";
import { ConfirmModal } from "../ui/ConfirmModal";
import { MAX_ITEMS_PER_PAGE } from "@/constants";
import { GtdAction, UpdateActionInput } from "@/types";
import { Capture } from "../ui/Capture";
import { EmptyState } from "../ui/EmptyState";

export function BackLog() {
  const [showAll, setShowAll] = useState(false);
  const [editingItem, setEditingItem] = useState<GtdAction | null>(null);
  const { actions, loading, saving, updateAction, deleteAction } = useActions();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const backLogs = actions.filter((action) => action.status === "backLog");
  const displayedActions = showAll
    ? backLogs
    : backLogs.slice(0, MAX_ITEMS_PER_PAGE);

  if (loading)
    return <div className="text-zinc-500 text-center py-10">Loading...</div>;

  const handleSave = async (formData: UpdateActionInput) => {
    if (editingItem) {
      await updateAction(editingItem.id, formData);
      setEditingItem(null);
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteAction(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Capture />
      <Title title="Backlog" icon={Logs} />

      {displayedActions.length === 0 && <EmptyState />}

      {displayedActions.map((action) => (
        <Card
          key={action.id}
          item={{
            title: action.title,
            onRemove: () => setItemToDelete(action.id),
            date: formatDate(action.created_at ?? ""),
            cta: "Mark as Action",
            ctaAction: () =>
              setEditingItem({ ...action, status: "nextActions" }),
          }}
        />
      ))}

      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {!showAll && backLogs.length > MAX_ITEMS_PER_PAGE && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full cursor-pointer py-4 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/20 transition-all font-medium text-sm"
        >
          + View all backlog ({backLogs.length})
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
    </div>
  );
}
