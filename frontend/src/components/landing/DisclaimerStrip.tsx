export function DisclaimerStrip() {
  return (
    <aside
      aria-label="Medical Disclaimer"
      className="w-full border-y border-hairline bg-panel/60 py-2.5 min-[861px]:py-3"
    >
      <div className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px] flex items-center justify-center gap-2.5 text-center">
        <span
          className="w-1.5 h-1.5 rounded-full bg-red flex-shrink-0"
          aria-hidden="true"
        />
        <p className="font-sans text-xs sm:text-[13px] tracking-wide text-text-muted">
          Not a diagnosis — a clearer starting point before you see a doctor.
        </p>
      </div>
    </aside>
  );
}

export default DisclaimerStrip;
