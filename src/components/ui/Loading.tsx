import { Rocket } from "lucide-react";

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-sky-200 rounded-2xl bg-white/60">
      <div className="bg-sky-100/70 p-4 rounded-full mb-4">
        <Rocket size={32} className="text-sky-500/80" />
      </div>
      <h3 className="text-slate-700 font-medium text-lg">Loading...</h3>
    </div>
  );
}
