// models/gtd-action.ts

export interface GtdAction {
  id: string;
  title: string;
  due_date: string;
  status: "nextActions" | "backLog" | "waiting" | "done";
  text: string;
  urgent: boolean;
  file_path?: string | null;
  created_at?: string;
}

export type UpdateActionInput = Partial<{
  title: string;
  due_date: string;
  status: "nextActions" | "backLog" | "waiting" | "done";
  text: string;
  urgent: boolean;
}>;

export type CreateActionInput = Omit<GtdAction, "id" | "created_at">;

export interface EditModalProps {
  item: GtdAction;
  onClose: () => void;
  onSave: (updates: UpdateActionInput) => void | Promise<void>;
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
  text?: string;
  cta?: string;
  ctaAction?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

export interface HeaderProps {
  setActiveView: (view: string) => void;
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

export interface ActionContextType {
  actions: GtdAction[];
  loading: boolean;
  saving: boolean;

  refreshActions: () => Promise<void>;

  updateAction: (id: string, updates: UpdateActionInput) => Promise<void>;

  deleteAction: (id: string) => Promise<void>;

  addCapture: (value: string) => Promise<void>;

  updateActionWithFile: (params: UpdateActionWithFileParams) => Promise<void>;
}

export interface UpdateActionWithFileParams {
  id: string;
  updates: UpdateActionInput;
  file?: File | null;
  previousFilePath?: string | null;
}
