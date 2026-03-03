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
import { WeeklyReview } from "@/components/WeeklyReview/WeeklyReview";
import { SystemHealth } from "@/components/SystemHealth/SystemHealth";
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
      setShowScrollTop(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  if (loading) return null;
  if (!user) return <AuthGate onLogin={login} />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans relative">
      <div className="hidden md:block">
        <Sidebar setActiveView={setActiveView} activeView={activeView} />
      </div>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-80 z-50 md:hidden bg-zinc-900">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-2 right-2 cursor-pointer text-zinc-400 hover:text-white transition"
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
          onOpenWeeklyReview={() => setActiveView("weeklyReview")}
          onOpenCalendar={() => setActiveView("calendar")}
          onOpenKanban={() => setActiveView("kanban")}
          onOpenSystemHealth={() => setActiveView("systemHealth")}
          onNavigateToView={setActiveView}
          onSearchSubmit={setSearchQuery}
        />

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
          {activeView === "notes" && <Notes />}
          {activeView === "kanban" && <Kanban searchQuery={searchQuery} />}
          {activeView === "projects" && <Projects />}
          {activeView === "weeklyReview" && <WeeklyReview />}
          {activeView === "systemHealth" && (
            <SystemHealth onNavigate={setActiveView} />
          )}
        </main>

        {showScrollTop && (
          <button
            onClick={() => {
              mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="fixed right-4 md:right-6 bottom-4 md:bottom-6 z-40 rounded-full border border-cyan-700/70 bg-zinc-900/90 p-1.5 text-cyan-300 shadow-lg hover:bg-cyan-950/40 hover:border-cyan-500 transition"
            title="Subir"
          >
            <ChevronUpCircle size={30} />
          </button>
        )}
      </div>
    </div>
  );
}
