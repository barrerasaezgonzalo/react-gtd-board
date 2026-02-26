"use client";
import Image from "next/image";
import { SidebarProps, userMenu } from "@/types";
import Link from "next/link";
import {
  Rocket,
  Logs,
  Loader,
  CheckCheck,
  StickyNote,
  ExternalLink,
} from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { useAuth } from "@/context/AuthContext";
import { getUserMenu } from "@/lib/menu";
import { useEffect, useState } from "react";

export function Sidebar({ setActiveView, activeView }: SidebarProps) {
  const [userMenu, setUserMenu] = useState<userMenu[] | null | undefined>(null);
  const { actions } = useActions();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const response = await getUserMenu(user.id);
      setUserMenu(response);
    };

    load();
  }, [user?.id]);

  const getCount = (status: string) => {
    return actions.filter((action) => action.status === status).length;
  };

  const navItems = [
    { id: "nextActions", label: "Next Actions", icon: Rocket },
    { id: "backLog", label: "Backlog", icon: Logs },
    { id: "waiting", label: "Waiting", icon: Loader },
    { id: "done", label: "Done", icon: CheckCheck },
    { id: "notes", label: "Notes", icon: StickyNote },
    { id: "calendar", label: "Calendar", icon: StickyNote },
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
          const currentCount = getCount(item.id);

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

      <nav className="px-4 py-6 space-y-1 text-sm">
        {userMenu &&
          userMenu.map((item) => {
            return (
              <Link
                key={item.id}
                href={item.url}
                target="_blank"
                className={`w-full cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200                 
                  text-zinc-400 hover:bg-zinc-800/50 hover:text-sky-400 border border-zinc-800
                }`}
              >
                <div className="flex items-center gap-3">
                  <ExternalLink size={18} /> {item.label}
                </div>
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
