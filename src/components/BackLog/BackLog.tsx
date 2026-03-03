"use client";

import { Logs } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { actionMatchesQuery, formatDate } from "@/lib/utils";
import { useActionsByStatus } from "@/hooks/useFilteredActions";
import { ActionListView } from "../ui/ActionListView";

export function BackLog({ searchQuery = "" }: { searchQuery?: string }) {
  const { actions, loading, saving, deleteAction } = useActions();
  const backLogsBase = useActionsByStatus(actions, "backLog");
  const backLogs = backLogsBase.filter((action) =>
    actionMatchesQuery(action, searchQuery),
  );

  return (
    <ActionListView
      titleProps={{ title: "Backlog", icon: Logs, accentTone: "backlog" }}
      actions={backLogs}
      loading={loading}
      saving={saving}
      viewAllLabel="backlog"
      onDeleteAction={deleteAction}
      buildCardItem={(action, { openDelete, openEdit }) => ({
        title: action.title,
        onEdit: () => openEdit(),
        onRemove: openDelete,
        date: formatDate(action.created_at ?? ""),
        dueDate: `${formatDate(action.due_date ?? "")}`,
        cta: "Make Action",
        ctaAction: () => openEdit({ ...action, status: "nextActions" }),
      })}
    />
  );
}
