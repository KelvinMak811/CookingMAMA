"use client";

import type { BmiHistoryEntry } from "@/lib/fitnessStorage";
import { bmiLabel } from "@/lib/workoutPlanner";

interface BmiHistoryChartProps {
  history: BmiHistoryEntry[];
}

function formatShortDate(isoDate: string): string {
  const [, m, d] = isoDate.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export function BmiHistoryChart({ history }: BmiHistoryChartProps) {
  const points = history.slice(-14);
  const width = 320;
  const height = 160;
  const padX = 28;
  const padY = 18;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const latest = points[points.length - 1];
  const values = points.map((p) => p.bmi);
  const minY = values.length ? Math.min(16, ...values) - 1 : 16;
  const maxY = values.length ? Math.max(30, ...values) + 1 : 30;
  const spanY = Math.max(0.1, maxY - minY);

  const bandLines = [
    { value: 18.5, label: "18.5" },
    { value: 24, label: "24" },
    { value: 27, label: "27" },
  ];

  function xAt(i: number): number {
    if (points.length <= 1) return padX + plotW / 2;
    return padX + (i / (points.length - 1)) * plotW;
  }

  function yAt(bmi: number): number {
    return padY + plotH - ((bmi - minY) / spanY) * plotH;
  }

  const polyline =
    points.length > 0
      ? points.map((p, i) => `${xAt(i)},${yAt(p.bmi)}`).join(" ")
      : "";

  return (
    <section className="planner-output-card">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
        <div>
          <h2 className="h5 fw-bold mb-1">BMI 走勢</h2>
          <p className="small text-secondary mb-0">
            每次儲存計劃會記錄當日 BMI，方便下次對比。
          </p>
        </div>
        {latest ? (
          <span className="badge text-bg-light">
            {latest.bmi.toFixed(1)} · {bmiLabel(latest.bmi)}
          </span>
        ) : null}
      </div>

      {points.length === 0 ? (
        <div className="planner-empty-state">
          <p className="small text-secondary mb-0">
            填好身高體重並生成計劃後，呢度會顯示 BMI 折線圖。
          </p>
        </div>
      ) : (
        <>
          <svg
            className="bmi-chart-svg"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="BMI 歷史折線圖"
          >
            {bandLines.map((band) => {
              if (band.value < minY || band.value > maxY) return null;
              const y = yAt(band.value);
              return (
                <g key={band.value}>
                  <line
                    x1={padX}
                    y1={y}
                    x2={width - padX}
                    y2={y}
                    className="bmi-chart-band"
                  />
                  <text x={4} y={y + 3} className="bmi-chart-band-label">
                    {band.label}
                  </text>
                </g>
              );
            })}
            {points.length > 1 ? (
              <polyline
                points={polyline}
                fill="none"
                className="bmi-chart-line"
              />
            ) : null}
            {points.map((p, i) => (
              <circle
                key={`${p.date}-${i}`}
                cx={xAt(i)}
                cy={yAt(p.bmi)}
                r={points.length === 1 ? 5 : 3.5}
                className="bmi-chart-dot"
              />
            ))}
            {points.length > 0 ? (
              <text
                x={xAt(0)}
                y={height - 2}
                textAnchor={points.length === 1 ? "middle" : "start"}
                className="bmi-chart-axis"
              >
                {formatShortDate(points[0].date)}
              </text>
            ) : null}
            {points.length > 1 ? (
              <text
                x={xAt(points.length - 1)}
                y={height - 2}
                textAnchor="end"
                className="bmi-chart-axis"
              >
                {formatShortDate(points[points.length - 1].date)}
              </text>
            ) : null}
          </svg>
          <ul className="list-unstyled small text-secondary mb-0 mt-2 bmi-history-list">
            {points
              .slice()
              .reverse()
              .slice(0, 5)
              .map((entry) => (
                <li key={entry.date} className="d-flex justify-content-between gap-2">
                  <span>{entry.date}</span>
                  <span>
                    {entry.weightKg} kg · BMI {entry.bmi.toFixed(1)}（
                    {bmiLabel(entry.bmi)}）
                  </span>
                </li>
              ))}
          </ul>
        </>
      )}
    </section>
  );
}
