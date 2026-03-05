"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { ProjectsContextType, Project } from "@/types";
import { useAuth } from "./AuthContext";
import {
  normalizeProjectName,
  normalizeProjectUpdates,
} from "./projectsContext.helpers";

const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined,
);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gtd_projects")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects((data ?? []) as Project[]);
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addProject = async ({
    name,
    color = "#38bdf8",
  }: {
    name: string;
    color?: string;
  }) => {
    if (!userId) return;
    const cleanName = normalizeProjectName(name);
    if (!cleanName) return;

    try {
      const { data, error } = await supabase
        .from("gtd_projects")
        .insert({
          user_id: userId,
          name: cleanName,
          color,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) return;

      setProjects((prev) => [data as Project, ...prev]);
    } catch (err) {
      console.error("Add project error:", err);
    }
  };

  const updateProject = async (
    id: string,
    updates: { name?: string; color?: string },
  ) => {
    if (!userId) return;

    const normalizedUpdates = normalizeProjectUpdates(updates);
    if (!normalizedUpdates) return;

    try {
      const { data, error } = await supabase
        .from("gtd_projects")
        .update(normalizedUpdates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) return;

      setProjects((prev) =>
        prev.map((project) =>
          project.id === id ? (data as Project) : project,
        ),
      );
    } catch (err) {
      console.error("Update project error:", err);
    }
  };

  const deleteProject = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("gtd_projects")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;

      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (err) {
      console.error("Delete project error:", err);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        loading,
        addProject,
        updateProject,
        deleteProject,
        refreshProjects,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within ProjectsProvider");
  }
  return context;
}
