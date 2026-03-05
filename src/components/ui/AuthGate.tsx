"use client";
import Image from "next/image";
import type { AuthGateProps } from "@/types";

export function AuthGate({ onLogin }: AuthGateProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl text-center">
        {/* Title */}
        <Image
          src="/logo.jpg"
          alt="Logo"
          width={350}
          height={350}
          className="mx-auto p-2 w-[300px]"
        />

        {/* Description */}
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          A focused productivity board designed to manage your tasks using a
          structured GTD workflow.
        </p>

        {/* Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium px-4 py-2 rounded-lg mb-6">
          You must be signed in to access your board.
        </div>

        {/* Login Button */}
        <button
          onClick={onLogin}
          className=" cursor-pointer w-full flex items-center justify-center gap-3 bg-blue-500 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
