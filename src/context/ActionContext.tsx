"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { ActionContextType, Action, UpdateActionParams } from "@/types";
import { useAuth } from "./AuthContext";

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export function ActionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userId = user?.id;
  const fetchActions = useCallback(async () => {
    if (!userId) {
      setActions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("gtd_actions")
        .select("*")
        .eq("user_id", userId)
        .order("urgent", { ascending: false })
        .order("due_date", { ascending: true });

      if (error) throw error;

      setActions(data ?? []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addCapture = async (capture: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("gtd_actions")
        .insert([
          {
            title: capture.trim(),
            status: "backLog",
            urgent: false,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setActions((prev) => [data, ...prev]);
    } catch (err) {
      console.error("Insert error:", err);
    }
  };

  const updateAction = async ({ id, updates }: UpdateActionParams) => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("gtd_actions")
        .update(updates)
        .eq("user_id", userId)
        .eq("id", id);

      if (error) throw error;

      setActions((prev) =>
        prev.map((action) =>
          action.id === id ? { ...action, ...updates } : action,
        ),
      );
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteAction = async (id: string) => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("gtd_actions")
        .delete()
        .eq("user_id", userId)
        .eq("id", id);

      if (error) throw error;

      setActions((prev) => prev.filter((action) => action.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  return (
    <ActionContext.Provider
      value={{
        actions,
        loading,
        saving,
        refreshActions: fetchActions,
        deleteAction,
        addCapture,
        updateAction,
      }}
    >
      {children}
    </ActionContext.Provider>
  );
}

export const useActions = () => {
  const context = useContext(ActionContext);
  if (!context)
    throw new Error("useActions must be used within an ActionProvider");
  return context;
};
