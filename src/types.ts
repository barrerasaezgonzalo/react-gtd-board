export interface ActionContextType {
  actions: Action[];
  loading: boolean;
  saving: boolean;
  refreshActions: () => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  addCapture: (value: string) => Promise<void>;
  updateAction: (params: UpdateActionParams) => Promise<void>;
}

export interface Action {
  id: string;
  title: string;
  due_date: string | null;
  status: "nextActions" | "backLog" | "waiting" | "done";
  text: string;
  urgent: boolean;
  file_path?: string | null;
  created_at?: string;
}

export type ActionParams = Partial<Omit<Action, "id" | "created_at">>;

export interface UpdateActionParams {
  id: string;
  updates: ActionParams;
  file?: File | null;
  removeFile?: boolean;
}

export interface EditModalProps {
  item: Action;
  onClose: () => void;
  saving: boolean;
}

export interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export interface ActionCardProps {
  item: CardViewModel;
}

export interface CardViewModel {
  urgent?: boolean;
  title: string;
  date: string;
  dueDate?: string;
  remainingDays?: number;
  text?: string;
  cta?: string;
  ctaAction?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

export interface HeaderProps {
  openSidebar?: () => void;
}

import { LucideIcon } from "lucide-react";

export interface TitleProps {
  title: string;
  icon: LucideIcon;
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
