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
  FolderKanban,
  Archive,
  CircleUserRound,
} from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { useAuth } from "@/context/AuthContext";

export function Sidebar({ setActiveView, activeView }: SidebarProps) {
  const { actions } = useActions();
  const { user } = useAuth();
  const userHandle = (user?.email?.split("@")[0] ?? "user").slice(0, 18);

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
    <aside className="w-80 h-full bg-white/75 backdrop-blur-md border-r border-slate-200/80 flex flex-col">
      <div className="flex items-center px-6 border-b border-slate-200/80">
        <Image
          src="/logo.webp"
          alt="Logo"
          width={350}
          height={350}
          className="py-2 w-[300px]"
        />
      </div>
      <small className="h-14 flex items-center gap-2 px-6 text-slate-500 border-b border-slate-200/80">
        <CircleUserRound size={15} className="text-slate-400" />@{userHandle}
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
                  ? "bg-sky-100 text-sky-700 font-semibold border border-sky-300"
                  : "text-slate-600 hover:bg-sky-50 hover:text-slate-800 border border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} /> {item.label}
              </div>

              {currentCount > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-sky-200/80 text-sky-700"
                      : "bg-slate-100 text-slate-600"
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
        <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">
          Quick Access
        </p>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveView("calendar")}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-sky-200 bg-white/80 py-2 text-sky-700 hover:border-sky-400 hover:text-sky-800 transition"
          >
            <CalendarDays size={16} />
            <span className="text-[10px]">Calendar</span>
          </button>
          <button
            onClick={() => setActiveView("kanban")}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-amber-200 bg-white/80 py-2 text-amber-700 hover:border-amber-400 hover:text-amber-800 transition"
          >
            <KanbanSquare size={16} />
            <span className="text-[10px]">Kanban</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
