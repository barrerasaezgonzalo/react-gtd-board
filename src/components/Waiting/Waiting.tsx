"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { formatDueDate, daysRemaining } from "@/lib/datetime";
import { actionMatchesQuery } from "@/lib/utils";
import { useActionsByStatus } from "@/hooks/useFilteredActions";
import { ActionListView } from "../ui/ActionListView";
import { ConfirmModal } from "../ui/ConfirmModal";

export function Waiting({ searchQuery = "" }: { searchQuery?: string }) {
  const { actions, loading, saving, deleteAction, updateAction } = useActions();
  const [itemMakeAction, setItemMakeAction] = useState<string | null>(null);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  const waitingsBase = useActionsByStatus(actions, "waiting", true);
  const waitings = waitingsBase.filter((action) =>
    actionMatchesQuery(action, searchQuery),
  );

  const handleMarkAsAction = async () => {
    if (!itemMakeAction) return;
    const actionToMove = actions.find((action) => action.id === itemMakeAction);
    if (!actionToMove?.due_date || actionToMove.due_date.trim() === "") {
      setBlockedMessage(
        "No se puede mover a Next Actions sin fecha de vencimiento. Edita la tarea y agrega una fecha primero.",
      );
      setTimeout(() => setBlockedMessage(null), 3000);
      setItemMakeAction(null);
      return;
    }

    await updateAction({
      id: itemMakeAction,
      updates: { status: "nextActions" },
    });
    setItemMakeAction(null);
  };

  return (
    <div className="space-y-3">
      {blockedMessage && (
        <div className="max-w-[1600px] mx-auto rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {blockedMessage}
        </div>
      )}
      <ActionListView
        titleProps={{ title: "Waiting", icon: Loader, accentTone: "waiting" }}
        actions={waitings}
        loading={loading}
        saving={saving}
        viewAllLabel="waiting"
        onDeleteAction={deleteAction}
        buildCardItem={(action, { openDelete, openEdit }) => ({
          urgent: action.urgent,
          energy: action.energy ?? null,
          title: action.title,
          onEdit: () => openEdit(),
          onRemove: openDelete,
          date: formatDueDate(action.created_at ?? ""),
          remainingDays: daysRemaining(action.due_date ?? ""),
          dueDate: `${formatDueDate(action.due_date ?? "")}`,
          text: action.text,
          cta: "Make Action",
          ctaAction: () => setItemMakeAction(action.id),
          file_urls: action.file_urls ?? "",
        })}
        extraModals={
          <ConfirmModal
            isOpen={!!itemMakeAction}
            onClose={() => setItemMakeAction(null)}
            onConfirm={handleMarkAsAction}
            title="Next Action"
            message="Do you want to mark this action as next?"
          />
        }
      />
    </div>
  );
}
