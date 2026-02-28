import { useState, useEffect, useRef, useMemo } from "react";
import { DAY_LABELS } from "../data/statistics.data";

// ─── Animated Counter ────────────────────────────────────────────────────────

/**
 * Animates a number from 0 to the target value.
 * @param {number} target - final value
 * @param {number} duration - animation ms
 * @returns {number} animated value
 */
export const useCountUp = (target, duration = 1000) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === undefined || target === null) return;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

/**
 * Pulse skeleton placeholder.
 * @param {string} className - Tailwind size classes
 */
export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

/**
 * Reusable Recharts custom tooltip with Uzbek-friendly styling.
 * @param {boolean} active
 * @param {Array} payload
 * @param {string} label
 */
export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-xl shadow-lg px-4 py-3 text-sm">
      {label && <p className="font-semibold text-gray-700 mb-2">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-gray-600">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>
            {entry.name}: <strong>{entry.value?.toLocaleString()}</strong>
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Heatmap ─────────────────────────────────────────────────────────────────

/**
 * Custom SVG heatmap (7 days × 24 hours).
 * @param {Array<{day: number, hour: number, count: number}>} data
 */
export const HeatmapChart = ({ data }) => {
  const cellSize = 28;
  const gap = 3;
  const paddingLeft = 36;
  const paddingTop = 24;
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const countMap = useMemo(() => {
    const m = {};
    data?.forEach(({ day, hour, count }) => {
      m[`${day}-${hour}`] = count;
    });
    return m;
  }, [data]);

  const maxCount = useMemo(
    () => Math.max(1, ...(data?.map((d) => d.count) || [1])),
    [data],
  );

  const getColor = (count) => {
    if (!count) return "#F3F4F6";
    const intensity = Math.sqrt(count / maxCount);
    const r = Math.round(219 - intensity * (219 - 37));
    const g = Math.round(234 - intensity * (234 - 99));
    const b = Math.round(254 - intensity * (254 - 235));
    return `rgb(${r},${g},${b})`;
  };

  const width = paddingLeft + 24 * (cellSize + gap);
  const height = paddingTop + 7 * (cellSize + gap);

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="min-w-0">
        {hours.map(
          (h) =>
            h % 3 === 0 && (
              <text
                key={h}
                x={paddingLeft + h * (cellSize + gap) + cellSize / 2}
                y={14}
                textAnchor="middle"
                fontSize={10}
                fill="#9CA3AF"
              >
                {h}:00
              </text>
            ),
        )}
        {DAY_LABELS.map((dayLabel, d) => (
          <g key={d}>
            <text
              x={paddingLeft - 6}
              y={paddingTop + d * (cellSize + gap) + cellSize / 2 + 4}
              textAnchor="end"
              fontSize={10}
              fill="#9CA3AF"
            >
              {dayLabel}
            </text>
            {hours.map((h) => {
              const count = countMap[`${d}-${h}`] || 0;
              return (
                <rect
                  key={h}
                  x={paddingLeft + h * (cellSize + gap)}
                  y={paddingTop + d * (cellSize + gap)}
                  width={cellSize}
                  height={cellSize}
                  rx={5}
                  fill={getColor(count)}
                >
                  <title>{`${dayLabel} ${h}:00 — ${count} ta`}</title>
                </rect>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
};
