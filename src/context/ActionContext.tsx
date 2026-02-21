"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ActionContextType,
  GtdAction,
  UpdateActionInput,
  UpdateActionWithFileParams,
} from "@/types";
import { useAuth } from "./AuthContext";

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export function ActionProvider({ children }: { children: React.ReactNode }) {
  const [actions, setActions] = useState<GtdAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const fetchActions = async () => {
    if (!user) {
      setActions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("gtd_actions")
      .select("*")
      .order("due_date", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error) {
      setActions(data ?? []);
    }

    setLoading(false);
  };

  const addCapture = async (value: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("gtd_actions")
      .insert([
        {
          title: value.trim(),
          status: "backLog",
          urgent: false,
          user_id: user?.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error capturing action:", error);
      return;
    }

    setActions((prev) => [data, ...prev]);
  };

  const updateAction = async (id: string, updates: UpdateActionInput) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("gtd_actions")
      .update(updates)
      .eq("id", id);

    setSaving(false);

    if (error) {
      console.error("Error updating action:", error);
      return;
    }

    await fetchActions();
  };

  const deleteAction = async (id: string) => {
    if (!user) return;
    setSaving(true);
    const { data: existing, error: fetchError } = await supabase
      .from("gtd_actions")
      .select("file_path")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching action before delete:", fetchError);
      return;
    }

    if (existing?.file_path) {
      const { error: storageError } = await supabase.storage
        .from("gtd")
        .remove([existing.file_path]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
      }
    }

    const { error } = await supabase.from("gtd_actions").delete().eq("id", id);

    if (error) {
      console.error("Error deleting action:", error);
      return;
    }

    setActions((prev) => prev.filter((action) => action.id !== id));
    setSaving(false);
  };

  const updateActionWithFile = async ({
    id,
    updates,
    file,
    previousFilePath,
  }: UpdateActionWithFileParams) => {
    setSaving(true);

    let filePath = previousFilePath ?? null;

    if (file) {
      const { data, error } = await supabase.storage
        .from("gtd")
        .upload(`actions/${crypto.randomUUID()}-${file.name}`, file);

      if (error) {
        console.error("Upload error:", error);
        setSaving(false);
        return;
      }

      filePath = data.path;

      if (previousFilePath) {
        await supabase.storage.from("gtd").remove([previousFilePath]);
      }
    }

    const { error } = await supabase
      .from("gtd_actions")
      .update({
        ...updates,
        file_path: filePath,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      console.error("Update error:", error);
      return;
    }

    await fetchActions();
  };

  useEffect(() => {
    const load = async () => {
      await fetchActions();
    };

    load();
  }, [user]);

  return (
    <ActionContext.Provider
      value={{
        actions,
        loading,
        saving,
        refreshActions: fetchActions,
        updateAction,
        deleteAction,
        addCapture,
        updateActionWithFile,
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
