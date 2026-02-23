"use client";
import Image from "next/image";
import { SidebarProps } from "@/types";
import Link from "next/link";
import {
  Rocket,
  Logs,
  Loader,
  CheckCheck,
  StickyNote,
  Sparkles,
  Wallet,
  Mail,
  MessageCircleMore,
  Guitar,
  Landmark,
  LifeBuoy,
} from "lucide-react";
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
    { id: "notes", label: "Notes", icon: StickyNote },
    { id: "calendar", label: "Calendar", icon: StickyNote },
  ];
  // TODO: Refactor
  const extraNavItems =
    user?.email === "barrerasaezgonzalo@gmail.com"
      ? [
          {
            id: "gmail",
            label: "Gmail",
            icon: Mail,
            url: "https://mail.google.com/mail/u/0/#inbox",
          },
          {
            id: "whatsapp",
            label: "whatsApp",
            icon: MessageCircleMore,
            url: "https://web.whatsapp.com/",
          },
          {
            id: "music",
            label: "Music",
            icon: Guitar,
            url: "https://music.youtube.com/",
          },
          {
            id: "prompt",
            label: "Prompt Improve",
            icon: Sparkles,
            url: "https://react-prompt-improver.vercel.app/",
          },
          {
            id: "finciafe",
            label: "Finance",
            icon: Wallet,
            url: "https://docs.google.com/spreadsheets/d/1ucvfrbESoqER0GMNAGjBXg3oKEXSudG4AFkRs8-OAPo/edit?gid=1061369826#gid=1061369826",
          },
          {
            id: "banco",
            label: "Banco Estado",
            icon: Landmark,
            url: "https://www.bancoestado.cl/content/bancoestado-public/cl/es/home/home.html#/login",
          },
          {
            id: "fintual",
            label: "Fincual",
            icon: LifeBuoy,
            url: "https://fintual.cl/app/goals",
          },
        ]
      : [];

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
        {extraNavItems.map((item) => {
          const Icon = item.icon;

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
                <Icon size={18} /> {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
