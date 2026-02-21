import { Rocket } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-zinc-800/50 rounded-2xl bg-zinc-900/20">
      <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
        <Rocket size={32} className="text-zinc-600" />
      </div>
      <h3 className="text-zinc-300 font-medium text-lg">Nothing here yet</h3>
      <p className="text-zinc-500 text-sm mt-1 text-center max-w-xs">
        Your list is empty. Start by capturing a new action or moving items to
        this view.
      </p>
    </div>
  );
}
