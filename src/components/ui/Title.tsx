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
  const selectBaseClass =
    "w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-100";
  const isContext = (value: string): value is Context =>
    value === "all" || value === "home" || value === "work";
  const isEnergy = (value: string): value is EnergyFilter =>
    value === "all" ||
    value === "low" ||
    value === "medium" ||
    value === "high";
  const toneClasses =
    accentTone === "next"
      ? { icon: "text-sky-500", focus: "focus:border-sky-400/70" }
      : accentTone === "waiting"
        ? { icon: "text-rose-400", focus: "focus:border-rose-300/70" }
        : accentTone === "backlog"
          ? { icon: "text-amber-500", focus: "focus:border-amber-300/70" }
          : accentTone === "someday"
            ? { icon: "text-cyan-600", focus: "focus:border-cyan-300/70" }
            : accentTone === "done"
              ? {
                  icon: "text-emerald-500",
                  focus: "focus:border-emerald-300/70",
                }
              : { icon: "text-sky-500", focus: "focus:border-sky-400/70" };

  return (
    <div className="flex flex-col items-start gap-3 pb-2 border-b border-slate-200 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
        <Icon size={25} className={toneClasses.icon} />
        {title}
      </h2>

      <div className="w-full flex flex-col gap-2 sm:w-auto sm:flex-row sm:items-end sm:gap-3">
        {setSelectedContext && (
          <div className="w-full sm:w-40">
            <p className="mb-1 pl-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Context
            </p>
            <select
              value={selectedContext}
              onChange={(e) => {
                const value = e.target.value;
                if (isContext(value)) {
                  setSelectedContext(value);
                }
              }}
              className={`${selectBaseClass} ${toneClasses.focus}`}
            >
              <option className="bg-white" value="all">
                All
              </option>
              <option className="bg-white" value="home">
                Home
              </option>
              <option className="bg-white" value="work">
                Work
              </option>
            </select>
          </div>
        )}
        {setSelectedEnergy && (
          <div className="w-full sm:w-36">
            <p className="mb-1 pl-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Energy
            </p>
            <select
              value={selectedEnergy}
              onChange={(e) => {
                const value = e.target.value;
                if (isEnergy(value)) {
                  setSelectedEnergy(value);
                }
              }}
              className={`${selectBaseClass} ${toneClasses.focus}`}
            >
              <option className="bg-white" value="all">
                All
              </option>
              <option className="bg-white" value="low">
                Low
              </option>
              <option className="bg-white" value="medium">
                Medium
              </option>
              <option className="bg-white" value="high">
                High
              </option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
