"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { actionMatchesQuery, formatDate, getDaysRemaining } from "@/lib/utils";
import { Context, EnergyFilter } from "@/types";
import { useNextActionsByContext } from "@/hooks/useFilteredActions";
import { ActionListView } from "../ui/ActionListView";
import { ConfirmModal } from "../ui/ConfirmModal";

export function NextActions({ searchQuery = "" }: { searchQuery?: string }) {
  const { actions, loading, saving, updateAction, deleteAction } = useActions();
  const [itemToComplete, setItemToComplete] = useState<string | null>(null);
  const [selectedContext, setSelectedContext] = useState<Context>("all");
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyFilter>("all");

  const nextActionsBase = useNextActionsByContext(
    actions,
    selectedContext,
    selectedEnergy,
  );
  const nextActions = nextActionsBase.filter((action) =>
    actionMatchesQuery(action, searchQuery),
  );

  const handleMarkAsDone = async () => {
    if (!itemToComplete) return;
    await updateAction({ id: itemToComplete, updates: { status: "done" } });
    setItemToComplete(null);
  };

  return (
    <div className="space-y-3">
      <ActionListView
        titleProps={{
          title: "Next Actions",
          icon: Rocket,
          accentTone: "next",
          selectedContext,
          setSelectedContext,
          selectedEnergy,
          setSelectedEnergy,
        }}
        actions={nextActions}
        loading={loading}
        saving={saving}
        viewAllLabel="next actions"
        onDeleteAction={deleteAction}
        buildCardItem={(action, { openDelete, openEdit }) => ({
          file_urls: action.file_urls ?? "",
          urgent: action.urgent,
          energy: action.energy ?? null,
          title: action.title,
          onEdit: () => openEdit(),
          onRemove: openDelete,
          date: formatDate(action.created_at ?? ""),
          remainingDays: getDaysRemaining(action.due_date ?? ""),
          dueDate: `${formatDate(action.due_date ?? "")}`,
          text: action.text,
          cta: "Mark as Done",
          ctaAction: () => setItemToComplete(action.id),
        })}
        extraModals={
          <ConfirmModal
            isOpen={!!itemToComplete}
            onClose={() => setItemToComplete(null)}
            onConfirm={handleMarkAsDone}
            title="Done Action"
            message="Do you want to mark this action as done?"
          />
        }
      />
    </div>
  );
}
