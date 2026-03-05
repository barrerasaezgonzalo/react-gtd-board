import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";

// Domain
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
  | "projects";

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

export type Note = {
  id: string;
  content: string;
  pinned: boolean;
};

export interface Project {
  id: string;
  user_id: string;
  name: string;
  color: string;
  is_active: boolean;
  created_at?: string;
}

// Component/View models
export interface UpdateActionParams {
  id: string;
  updates: ActionParams;
}

export interface CardViewModel {
  accentTone?: AccentTone;
  urgent?: boolean;
  title: string;
  context?: Context;
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

export interface ActionCardProps {
  item: CardViewModel;
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

export interface HeaderProps {
  openSidebar?: () => void;
  onNavigateToView?: (view: ActiveView) => void;
  onSearchSubmit?: (query: string) => void;
  searchQuery?: string;
  onOpenCalendar?: () => void;
  onOpenKanban?: () => void;
}

export interface TitleProps {
  title: string;
  icon: LucideIcon;
  accentTone?: AccentTone;
  selectedContext?: Context;
  setSelectedContext?: (selectedContext: Context) => void;
  selectedEnergy?: EnergyFilter;
  setSelectedEnergy?: (selectedEnergy: EnergyFilter) => void;
}

export interface AuthGateProps {
  onLogin: () => Promise<void> | void;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: "danger" | "success";
}

export type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

// Contexts
export interface ActionContextType {
  actions: Action[];
  loading: boolean;
  saving: boolean;
  refreshActions: () => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  addCapture: (value: string) => Promise<void>;
  updateAction: (params: UpdateActionParams) => Promise<void>;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  addProject: (params: { name: string; color?: string }) => Promise<void>;
  updateProject: (
    id: string,
    updates: { name?: string; color?: string },
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

export type NotesContextType = {
  notes: Note[];
  loading: boolean;
  addNote: () => Promise<Note | undefined>;
  editNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
};

// Composed helpers
export type CardBuilderHelpers = {
  openEdit: (actionOverride?: Action) => void;
  openDelete: () => void;
};

export interface ActionListViewProps {
  titleProps: TitleProps;
  actions: Action[];
  loading: boolean;
  saving: boolean;
  viewAllLabel: string;
  onDeleteAction: (id: string) => Promise<void>;
  buildCardItem: (action: Action, helpers: CardBuilderHelpers) => CardViewModel;
  extraModals?: ReactNode;
}
