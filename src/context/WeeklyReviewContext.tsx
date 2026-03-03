"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { startOfWeek, format } from "date-fns";
import { supabase } from "@/lib/supabase";
import {
  WeeklyReview,
  WeeklyReviewContextType,
  WeeklyReviewStep,
} from "@/types";
import { useAuth } from "./AuthContext";

const DEFAULT_STEPS: Omit<WeeklyReviewStep, "done">[] = [
  {
    id: "inbox",
    title: "Vaciar Inbox / Backlog",
    description: "Procesa todo lo capturado y decide siguiente estado.",
  },
  {
    id: "dates",
    title: "Revisar fechas",
    description: "Ajusta vencidas y tareas de los proximos 7 dias.",
  },
  {
    id: "waiting",
    title: "Revisar Waiting",
    description: "Haz seguimiento o mueve tareas que cambiaron.",
  },
  {
    id: "projects",
    title: "Revisar proyectos",
    description: "Cada proyecto debe tener al menos una Next Action.",
  },
  {
    id: "focus",
    title: "Elegir foco semanal",
    description: "Selecciona 3-5 tareas clave para esta semana.",
  },
];

const WeeklyReviewContext = createContext<WeeklyReviewContextType | undefined>(
  undefined,
);

function buildDefaultSteps(): WeeklyReviewStep[] {
  return DEFAULT_STEPS.map((step) => ({ ...step, done: false }));
}

function getCurrentWeekStart() {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export function WeeklyReviewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const userId = user?.id;
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refreshReview = useCallback(async () => {
    if (!userId) {
      setReview(null);
      setLoading(false);
      return;
    }

    const weekStart = getCurrentWeekStart();

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("weekly_reviews")
        .select("*")
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const steps = buildDefaultSteps();
        const { data: created, error: insertError } = await supabase
          .from("weekly_reviews")
          .insert({
            user_id: userId,
            week_start: weekStart,
            steps,
            completed: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setReview(created as WeeklyReview);
        return;
      }

      setReview(data as WeeklyReview);
    } catch (err) {
      console.error("Weekly review fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const toggleStep = async (stepId: string) => {
    if (!review) return;
    const nextSteps = review.steps.map((step) =>
      step.id === stepId ? { ...step, done: !step.done } : step,
    );
    const completed = nextSteps.every((step) => step.done);

    setSaving(true);
    try {
      const { error } = await supabase
        .from("weekly_reviews")
        .update({
          steps: nextSteps,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", review.id)
        .eq("user_id", review.user_id);

      if (error) throw error;
      setReview((prev) =>
        prev
          ? {
              ...prev,
              steps: nextSteps,
              completed,
              completed_at: completed ? new Date().toISOString() : null,
            }
          : prev,
      );
    } catch (err) {
      console.error("Weekly review update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetWeekReview = async () => {
    if (!review) return;
    const steps = buildDefaultSteps();

    setSaving(true);
    try {
      const { error } = await supabase
        .from("weekly_reviews")
        .update({
          steps,
          completed: false,
          completed_at: null,
        })
        .eq("id", review.id)
        .eq("user_id", review.user_id);

      if (error) throw error;
      setReview((prev) =>
        prev
          ? {
              ...prev,
              steps,
              completed: false,
              completed_at: null,
            }
          : prev,
      );
    } catch (err) {
      console.error("Weekly review reset error:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    refreshReview();
  }, [refreshReview]);

  return (
    <WeeklyReviewContext.Provider
      value={{
        review,
        loading,
        saving,
        toggleStep,
        resetWeekReview,
        refreshReview,
      }}
    >
      {children}
    </WeeklyReviewContext.Provider>
  );
}

export function useWeeklyReview() {
  const context = useContext(WeeklyReviewContext);
  if (!context) {
    throw new Error("useWeeklyReview must be used within WeeklyReviewProvider");
  }
  return context;
}
