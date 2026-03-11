"use client";

/** Single stat value in a circle - shared by character list, popup, and creation form */
export function StatBadge({
  label,
  value,
  large,
  dark,
}: {
  label: string;
  value: number | string;
  large?: boolean;
  /** Use light text for labels (when on dark background) */
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex shrink-0 items-center justify-center rounded-full border-2 border-neutral-800 bg-white font-bold text-neutral-900 ${
          large ? "h-12 w-12 text-base" : "h-8 w-8 text-xs"
        }`}
      >
        {value}
      </div>
      <span
        className={`mt-0.5 font-medium uppercase ${
          dark ? "text-neutral-300" : "text-neutral-600"
        } ${large ? "text-sm" : "text-[10px]"}`}
      >
        {label}
      </span>
    </div>
  );
}

/** Stat badge with Roll button - shows final (class-modified) value as primary */
export function StatBadgeWithRoll({
  label,
  value,
  modifierValue,
  onRoll,
  large = true,
  dark,
}: {
  label: string;
  value: number | string;
  /** Final value after class modifiers; when present and different from value, shown as primary in circle */
  modifierValue?: number;
  onRoll: () => void;
  large?: boolean;
  /** Use light text and dark-friendly button (when on dark background) */
  dark?: boolean;
}) {
  const hasModifier =
    modifierValue !== undefined && modifierValue !== value && typeof value === "number";
  const displayValue = hasModifier ? modifierValue : value;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5">
        <StatBadge label={label} value={displayValue} large={large} dark={dark} />
        <button
          type="button"
          onClick={onRoll}
          className={`rounded px-1.5 py-0.5 text-[10px] ${
            dark
              ? "border border-neutral-500 text-neutral-300 hover:bg-neutral-600 hover:text-white"
              : "border border-neutral-400 hover:bg-neutral-100"
          }`}
        >
          Roll
        </button>
      </div>
      {hasModifier && (
        <span className={`text-[10px] ${dark ? "text-neutral-300" : "text-neutral-500"}`}>
          base {value}
        </span>
      )}
    </div>
  );
}

/** Health/Wounds (cur/max) or Stress (cur/min) display - shared pattern */
export function ValueOverMaxBadge({
  current,
  max,
  label,
  secondLabel = "Max",
  large = true,
  dark,
}: {
  current: number;
  max: number;
  label: string;
  /** Label for second value: "Max" for Health/Wounds, "Min" for Stress */
  secondLabel?: "Max" | "Min";
  large?: boolean;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex items-center justify-center gap-1 rounded-full border-2 border-neutral-800 bg-white font-bold text-neutral-900 ${
          large ? "px-4 py-2 text-lg" : "px-2 py-0.5 text-xs"
        }`}
      >
        <span>{current}</span>
        <span className="text-neutral-400">/</span>
        <span>{max}</span>
      </div>
      <span className={`mt-0.5 ${dark ? "text-neutral-300" : "text-neutral-600"} ${large ? "text-sm" : "text-[9px]"}`}>
        {label}
      </span>
      <div className={`mt-0.5 flex justify-between gap-4 ${large ? "text-sm" : "text-[9px]"} ${dark ? "text-neutral-300" : "text-neutral-500"}`}>
        <span>Current</span>
        <span>{secondLabel === "Min" ? "Min" : "Max"}</span>
      </div>
    </div>
  );
}

/** Health badge with Roll button - for character creation */
export function HealthBadgeWithRoll({
  value,
  onRoll,
  large = true,
  dark,
}: {
  value: number | null;
  onRoll: () => void;
  large?: boolean;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5">
        <div className="flex flex-col items-center">
          <div
            className={`flex items-center justify-center gap-1 rounded-full border-2 border-neutral-800 bg-white font-bold text-neutral-900 ${
              large ? "px-4 py-2 text-lg" : "px-2 py-0.5 text-xs"
            }`}
          >
            {value != null ? (
              <>
                <span>{value}</span>
                <span className="text-neutral-400">/</span>
                <span>{value}</span>
              </>
            ) : (
              <span>—</span>
            )}
          </div>
          <span className={`mt-0.5 ${dark ? "text-neutral-300" : "text-neutral-600"} ${large ? "text-sm" : "text-[9px]"}`}>
            Health
          </span>
        </div>
        <button
          type="button"
          onClick={onRoll}
          className={`rounded px-1.5 py-0.5 text-[10px] ${
            dark
              ? "border border-neutral-500 text-neutral-300 hover:bg-neutral-600 hover:text-white"
              : "border border-neutral-400 hover:bg-neutral-100"
          }`}
        >
          Roll
        </button>
      </div>
    </div>
  );
}
