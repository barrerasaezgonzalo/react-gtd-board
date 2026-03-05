"use client";

import { useEffect, useState, useRef } from "react";
import { AuthGate } from "@/components/ui/AuthGate";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { Header } from "../components/Header/Header";
import { NextActions } from "../components/NextActions/NextActions";
import { BackLog } from "../components/BackLog/BackLog";
import { Waiting } from "../components/Waiting/Waiting";
import { Done } from "../components/Done/Done";
import { Someday } from "../components/Someday/Someday";
import { useAuth } from "@/context/AuthContext";
import { Calendar } from "@/components/Calendar/Calendar";
import { Notes } from "@/components/Notes/Notes";
import { Kanban } from "@/components/Kanban/Kanban";
import { Projects } from "@/components/Projects/Projects";
import { ActiveView } from "@/types";
import { ChevronUpCircle } from "lucide-react";

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>("nextActions");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { user, loading, login } = useAuth();

  useEffect(() => {
    const handleWindowScroll = () => {
      const mainScroll = mainRef.current?.scrollTop ?? 0;
      setShowScrollTop(window.scrollY > 120 || mainScroll > 120);
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  if (loading) return null;
  if (!user) return <AuthGate onLogin={login} />;

  return (
    <div className="min-h-screen text-slate-900 flex font-sans relative">
      <div className="hidden md:block">
        <Sidebar setActiveView={setActiveView} activeView={activeView} />
      </div>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/35 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-80 z-50 md:hidden bg-white/95 backdrop-blur-md">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-2 right-2 cursor-pointer text-slate-500 hover:text-slate-700 transition"
            >
              X
            </button>

            <Sidebar
              setActiveView={(view) => {
                setActiveView(view);
                setSidebarOpen(false);
              }}
              activeView={activeView}
            />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col">
        <Header
          openSidebar={() => setSidebarOpen(true)}
          onOpenCalendar={() => setActiveView("calendar")}
          onOpenKanban={() => setActiveView("kanban")}
          onNavigateToView={setActiveView}
          onSearchSubmit={setSearchQuery}
          searchQuery={searchQuery}
        />
        {searchQuery.trim().length > 0 && (
          <div className="border-b border-sky-200 bg-sky-50/80 px-4 py-2 md:px-8">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
              <p className="text-xs text-sky-800">
                Showing results for{" "}
                <span className="font-semibold">
                  &quot;{searchQuery.trim()}&quot;
                </span>
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="cursor-pointer rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-xs font-medium text-sky-700 hover:border-sky-400 hover:bg-sky-100 transition"
              >
                Clean search
              </button>
            </div>
          </div>
        )}

        <main
          ref={mainRef}
          onScroll={(e) => {
            const target = e.currentTarget;
            setShowScrollTop(target.scrollTop > 120);
          }}
          className="flex-1 p-4 md:p-8 overflow-auto"
        >
          {activeView === "nextActions" && (
            <NextActions searchQuery={searchQuery} />
          )}
          {activeView === "backLog" && <BackLog searchQuery={searchQuery} />}
          {activeView === "waiting" && <Waiting searchQuery={searchQuery} />}
          {activeView === "done" && <Done searchQuery={searchQuery} />}
          {activeView === "someday" && <Someday searchQuery={searchQuery} />}
          {activeView === "calendar" && <Calendar searchQuery={searchQuery} />}
          {activeView === "notes" && <Notes searchQuery={searchQuery} />}
          {activeView === "kanban" && <Kanban searchQuery={searchQuery} />}
          {activeView === "projects" && <Projects searchQuery={searchQuery} />}
        </main>

        {showScrollTop && (
          <button
            onClick={() => {
              mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="cursor-pointer fixed right-4 md:right-6 bottom-4 md:bottom-6 z-40 rounded-full border border-sky-300 bg-white/95 p-1.5 text-sky-500 shadow-lg hover:bg-sky-50 hover:border-sky-400 transition"
            title="Subir"
          >
            <ChevronUpCircle size={30} />
          </button>
        )}
      </div>
    </div>
  );
}
