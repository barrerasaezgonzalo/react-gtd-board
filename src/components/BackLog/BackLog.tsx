"use client";

import { Logs } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { formatDueDate, daysRemaining } from "@/lib/datetime";
import { actionMatchesQuery } from "@/lib/utils";
import { useActionsByStatus } from "@/hooks/useFilteredActions";
import { ActionListView } from "../ui/ActionListView";

export function BackLog({ searchQuery = "" }: { searchQuery?: string }) {
  const { actions, loading, saving, deleteAction } = useActions();
  const backLogsBase = useActionsByStatus(actions, "backLog");
  const backLogs = backLogsBase.filter((action) =>
    actionMatchesQuery(action, searchQuery),
  );

  return (
    <div className="space-y-3">
      <ActionListView
        titleProps={{ title: "Backlog", icon: Logs, accentTone: "backlog" }}
        actions={backLogs}
        loading={loading}
        saving={saving}
        viewAllLabel="backlog"
        onDeleteAction={deleteAction}
        buildCardItem={(action, { openDelete, openEdit }) => ({
          urgent: action.urgent,
          energy: action.energy ?? null,
          file_urls: action.file_urls ?? "",
          title: action.title,
          onEdit: () => openEdit(),
          onRemove: openDelete,
          date: formatDueDate(action.created_at ?? ""),
          remainingDays: daysRemaining(action.due_date ?? ""),
          dueDate: `${formatDueDate(action.due_date ?? "")}`,
          cta: "Make Action",
          ctaAction: () => openEdit({ ...action, status: "nextActions" }),
          text: action.text,
        })}
      />
    </div>
  );
}
