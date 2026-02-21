import { TitleProps } from "@/types";

export function Title({ title, icon }: TitleProps) {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
      <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
        <Icon size={16} className="text-blue-400" />
        {title}
      </h2>
      <span className="text-xs text-zinc-600">Sorted by date</span>
    </div>
  );
}
