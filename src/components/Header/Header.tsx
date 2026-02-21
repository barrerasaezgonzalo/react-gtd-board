import { HeaderProps } from "@/types";
import { useActions } from "@/context/ActionContext";
import { Zap, LogOut, Menu } from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function Header({ setActiveView, openSidebar }: HeaderProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { actions } = useActions();
  const getCount = (status: string) => {
    return actions.filter((action) => action.status === status).length;
  };

  const stats = useMemo(() => {
    const total = actions.length;
    if (total === 0) return 0;
    const doneCount = actions.filter((a) => a.status === "done").length;
    return Math.round((doneCount / total) * 100);
  }, [actions]);

  const { logout } = useAuth();

  return (
    <>
      <header className="h-16 bg-zinc-950/40 backdrop-blur-md border-b border-zinc-800/60 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-8">
          {openSidebar && (
            <button
              onClick={openSidebar}
              className="md:hidden text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <Menu size={22} />
            </button>
          )}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-bold leading-none">
                Backlog
              </span>
              <span className="text-sm font-semibold text-zinc-300">
                {getCount("backLog")} Tasks
              </span>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="flex flex-col">
              <div className="py-4 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-tight text-zinc-500">
                    Progress
                  </span>
                  <span className="text-xs font-semibold text-blue-400 pl-2">
                    {" "}
                    {stats} %{" "}
                  </span>
                </div>

                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${stats}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView("backLog")}
            className="flex cursor-pointer items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-lg shadow-blue-500/10"
          >
            <Zap size={16} fill="currentColor" />
            Process Backlog
          </button>
          <div className="h-8 w-px bg-zinc-800 mx-2" />
          <button onClick={() => setConfirmOpen(true)}>
            <LogOut
              size={20}
              className="text-zinc-500 hover:text-rose-500 cursor-pointer transition"
            />
          </button>
        </div>
      </header>
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          logout();
        }}
        title="Sign out"
        message="Are you sure you want to log out?"
        variant="danger"
      />
    </>
  );
}
