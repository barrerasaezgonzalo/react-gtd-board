import { useMemo } from "react";
import type { Action, ActionStatus, Context, EnergyFilter } from "../types";
import { sortActions } from "../lib/utils.ts";

export function filterByStatus(actions: Action[], status: ActionStatus) {
  return actions.filter((action) => action.status === status);
}

export function filterNextActionsByContext(
  actions: Action[],
  selectedContext: Context,
) {
  return actions.filter((action) => {
    if (action.status !== "nextActions") return false;
    const normalizedContext = action.context ?? "home";

    if (selectedContext === "all") {
      return true;
    }

    return normalizedContext === selectedContext;
  });
}

export function useActionsByStatus(
  actions: Action[],
  status: ActionStatus,
  sort = false,
) {
  return useMemo(
    () => getActionsByStatus(actions, status, sort),
    [actions, status, sort],
  );
}

export function useNextActionsByContext(
  actions: Action[],
  selectedContext: Context,
  selectedEnergy: EnergyFilter = "all",
) {
  return useMemo(() => {
    const filtered = filterNextActionsByContext(actions, selectedContext);
    const byEnergy =
      selectedEnergy === "all"
        ? filtered
        : filtered.filter((action) => action.energy === selectedEnergy);
    return sortActions(byEnergy);
  }, [actions, selectedContext, selectedEnergy]);
}

export function getActionsByStatus(
  actions: Action[],
  status: ActionStatus,
  sort = false,
) {
  const filtered = filterByStatus(actions, status);
  return sort ? sortActions(filtered) : filtered;
}
