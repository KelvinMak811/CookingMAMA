"use client";

import type { ChartSlice } from "@/lib/expenses";
import { formatCurrency } from "@/lib/utils";

interface ExpensePieChartProps {
  title: string;
  slices: ChartSlice[];
  emptyText?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export function ExpensePieChart({
  title,
  slices,
  emptyText = "暫時冇數據",
}: ExpensePieChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = 80;
  const cy = 80;
  const r = 70;

  let angle = 0;
  const arcs = slices.map((slice) => {
    const sliceAngle = total > 0 ? (slice.value / total) * 360 : 0;
    const start = angle;
    const end = angle + sliceAngle;
    angle = end;
    return { ...slice, path: describeArc(cx, cy, r, start, end) };
  });

  return (
    <div className="border-0 shadow-sm card h-100">
      <div className="card-body">
        <h6 className="fw-bold mb-3">{title}</h6>
        {total <= 0 ? (
          <p className="text-secondary small text-center py-4 mb-0">{emptyText}</p>
        ) : (
          <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
            <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden>
              {arcs.map((arc) => (
                <path key={arc.label} d={arc.path} fill={arc.color} />
              ))}
            </svg>
            <ul className="list-unstyled small mb-0 flex-grow-1 w-100">
              {slices.map((slice) => (
                <li key={slice.label} className="d-flex align-items-center gap-2 mb-2">
                  <span
                    className="rounded-circle flex-shrink-0"
                    style={{ width: 10, height: 10, backgroundColor: slice.color }}
                  />
                  <span className="text-truncate flex-grow-1">{slice.label}</span>
                  <span className="text-secondary">
                    {formatCurrency(slice.value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
