import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ActionProvider } from "@/context/ActionContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotesProvider } from "@/context/NotesContext";
import { ProjectsProvider } from "@/context/ProjectsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GTD Board",
  description:
    "Personal GTD board to capture, organize, and execute tasks with views for next actions, backlog, waiting, calendar, kanban, notes, and projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {" "}
        <AuthProvider>
          <ProjectsProvider>
            <ActionProvider>
              <NotesProvider>{children}</NotesProvider>
            </ActionProvider>
          </ProjectsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
