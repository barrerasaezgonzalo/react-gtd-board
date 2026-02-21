"use client";

import { SidebarProps } from "@/types";
import { Rocket, Logs, Loader, CheckCheck } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { useAuth } from "@/context/AuthContext";

export function Sidebar({ setActiveView, activeView }: SidebarProps) {
  const { actions } = useActions();
  const { user } = useAuth();
  const getCount = (status: string) => {
    return actions.filter((action) => action.status === status).length;
  };

  const navItems = [
    { id: "nextActions", label: "Next Actions", icon: Rocket },
    { id: "backLog", label: "Backlog", icon: Logs },
    { id: "waiting", label: "Waiting", icon: Loader },
    { id: "done", label: "Done", icon: CheckCheck },
  ];

  return (
    <aside className="w-64 h-screen bg-zinc-900/50 border-r border-zinc-800/60 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800/60">
        <span className="text-lg font-bold">GTD BOARD</span>
      </div>
      <small className="h-8 flex items-center px-6 border-b border-zinc-700/60">
        {user?.email}
      </small>

      <nav className="flex-1 px-4 py-6 space-y-1 text-sm">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          const currentCount = getCount(item.id);

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-sky-400 border border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} /> {item.label}
              </div>

              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  isActive ? "bg-blue-500/20" : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {currentCount}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
