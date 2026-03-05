"use client";

import { Archive } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { useActionsByStatus } from "@/hooks/useFilteredActions";
import { formatDueDate, daysRemaining } from "@/lib/datetime";
import { actionMatchesQuery } from "@/lib/utils";
import { ActionListView } from "../ui/ActionListView";

export function Someday({ searchQuery = "" }: { searchQuery?: string }) {
  const { actions, loading, saving, deleteAction } = useActions();
  const somedayBase = useActionsByStatus(actions, "someday", true);
  const somedayActions = somedayBase.filter((action) =>
    actionMatchesQuery(action, searchQuery),
  );

  return (
    <div className="space-y-3">
      <ActionListView
        titleProps={{
          title: "Someday / Maybe",
          icon: Archive,
          accentTone: "someday",
        }}
        actions={somedayActions}
        loading={loading}
        saving={saving}
        viewAllLabel="someday"
        onDeleteAction={deleteAction}
        buildCardItem={(action, { openDelete, openEdit }) => ({
          urgent: action.urgent,
          energy: action.energy ?? null,
          file_urls: action.file_urls ?? "",
          title: action.title,
          onEdit: () => openEdit(),
          onRemove: openDelete,
          date: formatDueDate(action.created_at ?? ""),
          dueDate: `${formatDueDate(action.due_date ?? "")}`,
          remainingDays: daysRemaining(action.due_date ?? ""),
          text: action.text,
        })}
      />
    </div>
  );
}
