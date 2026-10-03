import Tooltip from "@mui/material/Tooltip";
import { BarChart3, Timer, TrendingDown, TrendingUp, Zap } from "lucide-react";

// =====================================================
// TEMP DUMMY DATA - replace with the machine production API response.
// =====================================================
const DUMMY_REPORT = {
  machineName: "5 FACE DCMC VISION WIDE",
  period: "Q1 2026",
  summary: {
    utilization: { value: 83.47, change: 2.1 },
    efficiency: { value: 56.99, change: -0.8 },
    productivity: { value: 47.43, change: 1.4 },
  },
  months: [
    { label: "JAN-26", utilization: 85.24, efficiency: 55.2, productivity: 47.05 },
    { label: "FEB-26", utilization: 76.14, efficiency: 60.78, productivity: 46.28 },
    { label: "MAR-26", utilization: 89.02, efficiency: 55.01, productivity: 48.97 },
  ],
};

// One fixed colour per metric, used by the tiles, the legend and the bars
const METRICS = [
  {
    key: "utilization",
    label: "Utilization",
    tileTitle: "Quarterly Utilization",
    color: "#E57200",
    icon: Zap,
  },
  {
    key: "efficiency",
    label: "Efficiency",
    tileTitle: "Quarterly Efficiency",
    color: "#9B2226",
    icon: Timer,
  },
  {
    key: "productivity",
    label: "Productivity",
    tileTitle: "Overall Productivity",
    color: "#3F9DC0",
    icon: BarChart3,
  },
];

const Y_TICKS = [0, 20, 40, 60, 80, 100];

const formatPercent = (value) => `${Number(value).toFixed(2)}%`;

// =====================================================
// KPI TILE
// =====================================================
function KpiTile({ metric, value, change }) {
  const Icon = metric.icon;
  const up = change >= 0;
  const TrendIcon = up ? TrendingUp : TrendingDown;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5">
      {/* Decorative watermark */}
      <Icon
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -top-3 size-20 text-muted-foreground/10 sm:size-24"
      />

      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {metric.tileTitle}
      </p>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl"
          style={{ color: metric.color }}
        >
          {formatPercent(value)}
        </span>
        <span
          className={
            up
              ? "inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"
              : "inline-flex items-center gap-1 text-xs font-semibold text-destructive"
          }
        >
          <TrendIcon className="size-3.5" />
          <span className="sr-only">{up ? "Up" : "Down"}</span>
          {Math.abs(change)}%
        </span>
      </div>

      <div
        className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={metric.tileTitle}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            backgroundColor: metric.color,
          }}
        />
      </div>
    </div>
  );
}

// =====================================================
// MACHINE PRODUCTION REPORT
// =====================================================
function MachineProduction() {
  const report = DUMMY_REPORT;
  const columns = { gridTemplateColumns: `repeat(${report.months.length}, minmax(0, 1fr))` };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* ================= KPI TILES ================= */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-6">
        {METRICS.map((metric) => (
          <KpiTile
            key={metric.key}
            metric={metric}
            value={report.summary[metric.key].value}
            change={report.summary[metric.key].change}
          />
        ))}
      </div>

      {/* ================= CHART CARD ================= */}
      <div className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight sm:text-lg">
              {report.machineName} - {report.period}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Comparative analysis of key performance indicators by month
            </p>
          </div>

          {/* LEGEND */}
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {METRICS.map((metric) => (
              <li
                key={metric.key}
                className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                <span
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: metric.color }}
                />
                {metric.label}
              </li>
            ))}
          </ul>
        </div>

        {/* PLOT (scrolls sideways if the screen is very narrow) */}
        <div className="mt-6 overflow-x-auto">
          <div className="flex min-w-[20rem]">
            {/* Y AXIS LABELS */}
            <div className="relative h-56 w-10 shrink-0 sm:h-72 lg:h-80">
              <div className="absolute inset-x-0 bottom-0 top-6">
                {Y_TICKS.map((tick) => (
                  <span
                    key={tick}
                    className="absolute right-2 translate-y-1/2 text-[11px] tabular-nums text-muted-foreground"
                    style={{ bottom: `${tick}%` }}
                  >
                    {tick}%
                  </span>
                ))}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="relative h-56 border-b border-l border-border sm:h-72 lg:h-80">
                {/* 100% of the scale sits 24px below the top so labels fit */}
                <div className="absolute inset-x-0 bottom-0 top-6">
                  {/* GRID LINES */}
                  {Y_TICKS.filter((tick) => tick > 0).map((tick) => (
                    <div
                      key={tick}
                      className="absolute inset-x-0 border-t border-border/50"
                      style={{ bottom: `${tick}%` }}
                    />
                  ))}

                  {/* BARS */}
                  <div className="absolute inset-0 grid" style={columns}>
                    {report.months.map((month) => (
                      <div
                        key={month.label}
                        className="flex h-full items-end justify-center gap-1 px-1 sm:gap-2"
                      >
                        {METRICS.map((metric) => (
                          <Tooltip
                            key={metric.key}
                            arrow
                            placement="top"
                            title={`${month.label} · ${metric.label}: ${formatPercent(month[metric.key])}`}
                          >
                            <div
                              tabIndex={0}
                              aria-label={`${month.label} ${metric.label} ${formatPercent(month[metric.key])}`}
                              className="relative w-7 max-w-[28%] rounded-t transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-11 lg:w-14"
                              style={{
                                height: `${Math.min(100, Math.max(0, month[metric.key]))}%`,
                                backgroundColor: metric.color,
                              }}
                            >
                              <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold tabular-nums text-foreground sm:text-xs">
                                {formatPercent(month[metric.key])}
                              </span>
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* X AXIS LABELS */}
              <div className="mt-2 grid" style={columns}>
                {report.months.map((month) => (
                  <span
                    key={month.label}
                    className="text-center text-[11px] font-semibold tracking-wide text-foreground sm:text-xs"
                  >
                    {month.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MachineProduction;
