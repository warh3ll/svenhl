// Inline proportional bar (goals/assists, or a goalie's wins) scaled against the best row in its table.
// The number and detail are visual; screen readers get srLabel instead.
// The detail shows from md up, or at every width with alwaysShowDetail.
const StatBar = ({
  total,
  max,
  segments,
  label,
  detail,
  srLabel,
  alwaysShowDetail = false,
}: {
  total: number;
  max: number;
  segments: { value: number; className: string }[];
  label?: string;
  detail?: string;
  srLabel: string;
  alwaysShowDetail?: boolean;
}) => (
  <div className="flex items-center gap-3">
    {label !== undefined && <span aria-hidden="true" className="w-7 shrink-0 text-right font-semibold">{label}</span>}
    <div aria-hidden="true" className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
      <div className="flex gap-px" style={{ width: `${(total / max) * 100}%` }}>
        {segments.filter((s) => s.value > 0).map((s, i) => (
          <div key={i} className={s.className} style={{ flexGrow: s.value }} />
        ))}
      </div>
    </div>
    {detail && (
      <span
        aria-hidden="true"
        className={`w-20 shrink-0 text-xs font-normal text-muted-foreground ${alwaysShowDetail ? '' : 'hidden md:inline'}`}
      >
        {detail}
      </span>
    )}
    <span className="sr-only">{srLabel}</span>
  </div>
);

export default StatBar;
