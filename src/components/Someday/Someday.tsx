"use client";

import { Archive } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { useActionsByStatus } from "@/hooks/useFilteredActions";
import { actionMatchesQuery, formatDate } from "@/lib/utils";
import { ActionListView } from "../ui/ActionListView";

export function Someday({ searchQuery = "" }: { searchQuery?: string }) {
  const { actions, loading, saving, deleteAction, updateAction } = useActions();
  const somedayBase = useActionsByStatus(actions, "someday", true);
  const somedayActions = somedayBase.filter((action) =>
    actionMatchesQuery(action, searchQuery),
  );

  return (
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
        date: formatDate(action.created_at ?? ""),
        text: action.text,
        cta: "Activate",
        ctaAction: () =>
          updateAction({
            id: action.id,
            updates: { status: "backLog" },
          }),
      })}
    />
  );
}
