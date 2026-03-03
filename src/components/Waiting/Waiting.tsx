"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { actionMatchesQuery, formatDate, getDaysRemaining } from "@/lib/utils";
import { useActionsByStatus } from "@/hooks/useFilteredActions";
import { ActionListView } from "../ui/ActionListView";
import { ConfirmModal } from "../ui/ConfirmModal";

export function Waiting({ searchQuery = "" }: { searchQuery?: string }) {
  const { actions, loading, saving, deleteAction, updateAction } = useActions();
  const [itemMakeAction, setItemMakeAction] = useState<string | null>(null);

  const waitingsBase = useActionsByStatus(actions, "waiting", true);
  const waitings = waitingsBase.filter((action) =>
    actionMatchesQuery(action, searchQuery),
  );

  const handleMarkAsAction = async () => {
    if (!itemMakeAction) return;

    await updateAction({
      id: itemMakeAction,
      updates: { status: "nextActions" },
    });
    setItemMakeAction(null);
  };

  return (
    <ActionListView
      titleProps={{ title: "Waiting", icon: Loader, accentTone: "waiting" }}
      actions={waitings}
      loading={loading}
      saving={saving}
      viewAllLabel="waiting"
      onDeleteAction={deleteAction}
      buildCardItem={(action, { openDelete, openEdit }) => ({
        urgent: action.urgent,
        title: action.title,
        onEdit: () => openEdit(),
        onRemove: openDelete,
        date: formatDate(action.created_at ?? ""),
        remainingDays: getDaysRemaining(action.due_date ?? ""),
        dueDate: `${formatDate(action.due_date ?? "")}`,
        text: action.text,
        cta: "Make Action",
        ctaAction: () => setItemMakeAction(action.id),
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
  );
}
