import { Context, EnergyFilter, TitleProps } from "@/types";

export function Title({
  title,
  icon,
  accentTone = "neutral",
  selectedContext,
  setSelectedContext,
  selectedEnergy,
  setSelectedEnergy,
}: TitleProps) {
  const Icon = icon;
  const isContext = (value: string): value is Context =>
    value === "all" || value === "home" || value === "work";
  const isEnergy = (value: string): value is EnergyFilter =>
    value === "all" ||
    value === "low" ||
    value === "medium" ||
    value === "high";
  const toneClasses =
    accentTone === "next"
      ? { icon: "text-sky-400", focus: "focus:border-sky-500/50" }
      : accentTone === "waiting"
        ? { icon: "text-amber-400", focus: "focus:border-amber-500/50" }
        : accentTone === "backlog"
          ? { icon: "text-violet-400", focus: "focus:border-violet-500/50" }
          : accentTone === "someday"
            ? { icon: "text-fuchsia-400", focus: "focus:border-fuchsia-500/50" }
            : accentTone === "done"
              ? {
                  icon: "text-emerald-400",
                  focus: "focus:border-emerald-500/50",
                }
              : { icon: "text-blue-400", focus: "focus:border-blue-500/50" };

  return (
    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
      <h2 className="text-2xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
        <Icon size={25} className={toneClasses.icon} />
        {title}
      </h2>

      <div className="flex items-center gap-2">
        {setSelectedContext && (
          <div className="relative w-40">
            <select
              value={selectedContext}
              onChange={(e) => {
                const value = e.target.value;
                if (isContext(value)) {
                  setSelectedContext(value);
                }
              }}
              className={`w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none transition appearance-none cursor-pointer ${toneClasses.focus}`}
            >
              <option className="bg-zinc-800" value="all">
                All Context
              </option>
              <option className="bg-zinc-800" value="home">
                Home
              </option>
              <option className="bg-zinc-800" value="work">
                Work
              </option>
            </select>
          </div>
        )}
        {setSelectedEnergy && (
          <div className="relative w-36">
            <select
              value={selectedEnergy}
              onChange={(e) => {
                const value = e.target.value;
                if (isEnergy(value)) {
                  setSelectedEnergy(value);
                }
              }}
              className={`w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none transition appearance-none cursor-pointer ${toneClasses.focus}`}
            >
              <option className="bg-zinc-800" value="all">
                All Energy
              </option>
              <option className="bg-zinc-800" value="low">
                Low
              </option>
              <option className="bg-zinc-800" value="medium">
                Medium
              </option>
              <option className="bg-zinc-800" value="high">
                High
              </option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
