export interface ActionContextType {
  actions: Action[];
  loading: boolean;
  saving: boolean;
  refreshActions: () => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  addCapture: (value: string) => Promise<void>;
  updateAction: (params: UpdateActionParams) => Promise<void>;
}
export type Context = "all" | "work" | "home";
export type Energy = "low" | "medium" | "high";
export type EnergyFilter = Energy | "all";
export type ActionStatus =
  | "nextActions"
  | "backLog"
  | "waiting"
  | "done"
  | "someday";
export type ActiveView =
  | ActionStatus
  | "notes"
  | "calendar"
  | "kanban"
  | "projects"
  | "weeklyReview"
  | "systemHealth";
export type AccentTone =
  | "next"
  | "waiting"
  | "backlog"
  | "done"
  | "someday"
  | "neutral";

export interface Action {
  id: string;
  title: string;
  due_date: string | null;
  status: ActionStatus;
  context?: Context;
  text: string;
  urgent: boolean;
  created_at?: string;
  file_urls?: string;
  project_id?: string | null;
  energy?: Energy | null;
}

export type ActionParams = Partial<Omit<Action, "id" | "created_at">>;

export interface UpdateActionParams {
  id: string;
  updates: ActionParams;
}

export interface EditModalProps {
  item: Action;
  onClose: () => void;
  saving: boolean;
}

export interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export interface ActionCardProps {
  item: CardViewModel;
}

export interface CardViewModel {
  accentTone?: AccentTone;
  urgent?: boolean;
  title: string;
  projectName?: string;
  projectColor?: string;
  energy?: Energy | null;
  date: string;
  dueDate?: string;
  remainingDays?: number;
  text?: string;
  cta?: string;
  ctaAction?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  file_urls?: string;
}

export interface HeaderProps {
  openSidebar?: () => void;
  onNavigateToView?: (view: ActiveView) => void;
  onSearchSubmit?: (query: string) => void;
  onOpenWeeklyReview?: () => void;
  onOpenCalendar?: () => void;
  onOpenKanban?: () => void;
  onOpenSystemHealth?: () => void;
}

import type { LucideIcon } from "lucide-react";

export interface TitleProps {
  title: string;
  icon: LucideIcon;
  accentTone?: AccentTone;
  selectedContext?: Context;
  setSelectedContext?: (selectedContext: Context) => void;
  selectedEnergy?: EnergyFilter;
  setSelectedEnergy?: (selectedEnergy: EnergyFilter) => void;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: "danger" | "success";
}

export type Note = {
  id: string;
  content: string;
  pinned: boolean;
};

export type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export interface userMenu {
  id: string;
  slug: string;
  label: string;
  url: string;
  user_id: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  color: string;
  is_active: boolean;
  created_at?: string;
}

export interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  addProject: (params: { name: string; color?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

export interface WeeklyReviewStep {
  id: string;
  title: string;
  description: string;
  done: boolean;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string;
  steps: WeeklyReviewStep[];
  completed: boolean;
  completed_at?: string | null;
  created_at?: string;
}

export interface WeeklyReviewContextType {
  review: WeeklyReview | null;
  loading: boolean;
  saving: boolean;
  toggleStep: (stepId: string) => Promise<void>;
  resetWeekReview: () => Promise<void>;
  refreshReview: () => Promise<void>;
}
