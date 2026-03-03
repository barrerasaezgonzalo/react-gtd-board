"use client";

import { CheckCheck } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { actionMatchesQuery, formatDate } from "@/lib/utils";
import { useActionsByStatus } from "@/hooks/useFilteredActions";
import { ActionListView } from "../ui/ActionListView";

export function Done({ searchQuery = "" }: { searchQuery?: string }) {
  const { actions, loading, deleteAction, saving } = useActions();
  const donesBase = useActionsByStatus(actions, "done");
  const dones = donesBase.filter((action) =>
    actionMatchesQuery(action, searchQuery),
  );

  return (
    <ActionListView
      titleProps={{ title: "Done", icon: CheckCheck, accentTone: "done" }}
      actions={dones}
      loading={loading}
      saving={saving}
      viewAllLabel="done"
      onDeleteAction={deleteAction}
      buildCardItem={(action, { openDelete, openEdit }) => ({
        urgent: action.urgent,
        title: action.title,
        onEdit: () => openEdit(),
        onRemove: openDelete,
        date: formatDate(action.created_at ?? ""),
        text: action.text,
      })}
    />
  );
}
