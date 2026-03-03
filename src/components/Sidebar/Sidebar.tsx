import Image from "next/image";
import { ActionStatus, ActiveView, SidebarProps } from "@/types";
import {
  Rocket,
  Logs,
  Loader,
  CheckCheck,
  StickyNote,
  CalendarDays,
  KanbanSquare,
  ClipboardCheck,
  ActivitySquare,
  FolderKanban,
  Archive,
} from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { useAuth } from "@/context/AuthContext";

export function Sidebar({ setActiveView, activeView }: SidebarProps) {
  const { actions } = useActions();
  const { user } = useAuth();

  const getCount = (status: ActionStatus) => {
    return actions.filter((action) => action.status === status).length;
  };

  const navItems: {
    id: ActiveView;
    label: string;
    icon: typeof Rocket;
    countStatus?: ActionStatus;
  }[] = [
    {
      id: "nextActions",
      label: "Next Actions",
      icon: Rocket,
      countStatus: "nextActions",
    },
    {
      id: "backLog",
      label: "Backlog",
      icon: Logs,
      countStatus: "backLog",
    },
    {
      id: "waiting",
      label: "Waiting",
      icon: Loader,
      countStatus: "waiting",
    },
    {
      id: "done",
      label: "Done",
      icon: CheckCheck,
      countStatus: "done",
    },
    {
      id: "someday",
      label: "Someday / Maybe",
      icon: Archive,
      countStatus: "someday",
    },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "notes", label: "Notes", icon: StickyNote },
  ];

  return (
    <aside className="w-80 h-screen bg-zinc-900/50 border-r border-zinc-800/60 flex flex-col">
      <div className="flex items-center px-6 border-b border-zinc-800/60">
        <Image
          src="/logo.jpg"
          alt="Logo"
          width={350}
          height={350}
          className="py-2 w-[300px]"
        />
      </div>
      <small className="h-14 flex items-center px-6 text-zinc-500 border-b border-zinc-700/60">
        User: {user?.email}
      </small>

      <nav className="px-4 py-6 space-y-1 text-sm">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          const currentCount = item.countStatus
            ? getCount(item.countStatus)
            : 0;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
              }}
              className={`w-full cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200  ${
                isActive
                  ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-sky-400 border border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} /> {item.label}
              </div>

              {currentCount > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    isActive ? "bg-blue-500/20" : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {currentCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pb-4 md:hidden">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-2">
          Quick Access
        </p>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveView("calendar")}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 text-zinc-300 hover:border-sky-600 hover:text-sky-300 transition"
          >
            <CalendarDays size={16} />
            <span className="text-[10px]">Calendar</span>
          </button>
          <button
            onClick={() => setActiveView("kanban")}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 text-zinc-300 hover:border-violet-600 hover:text-violet-300 transition"
          >
            <KanbanSquare size={16} />
            <span className="text-[10px]">Kanban</span>
          </button>
          <button
            onClick={() => setActiveView("weeklyReview")}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 text-zinc-300 hover:border-cyan-600 hover:text-cyan-300 transition"
          >
            <ClipboardCheck size={16} />
            <span className="text-[10px]">Review</span>
          </button>
          <button
            onClick={() => setActiveView("systemHealth")}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 text-zinc-300 hover:border-emerald-600 hover:text-emerald-300 transition"
          >
            <ActivitySquare size={16} />
            <span className="text-[10px]">Health</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
