"use client";

import { useState } from "react";
import { AuthGate } from "@/components/ui/AuthGate";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { Header } from "../components/Header/Header";
import { NextActions } from "../components/NextActions/NextActions";
import { BackLog } from "../components/BackLog/BackLog";
import { Waiting } from "../components/Waiting/Waiting";
import { Done } from "../components/Done/Done";
import { useAuth } from "@/context/AuthContext";
import { Calendar } from "@/components/Calendar/Calendar";
import { Notes } from "@/components/Notes/Notes";

export default function Home() {
  const [activeView, setActiveView] = useState("nextActions");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, login } = useAuth();

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
              ✕
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
        <Header openSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {activeView === "nextActions" && <NextActions />}
          {activeView === "backLog" && <BackLog />}
          {activeView === "waiting" && <Waiting />}
          {activeView === "done" && <Done />}
          {activeView === "calendar" && <Calendar />}
          {activeView === "notes" && <Notes />}
        </main>
      </div>
    </div>
  );
}
