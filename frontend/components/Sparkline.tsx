"use client";

interface SparklineProps {
  data: number[];
  color?: string;
  fillOpacity?: number;
  height?: number;
  width?: number;
  strokeWidth?: number;
}

function buildPath(data: number[], width: number, height: number, pad = 4) {
  if (data.length === 0) return { line: "", area: "" };
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = (width - pad * 2) / (data.length - 1 || 1);

  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (height - pad * 2) * (1 - (v - min) / range);
    return [x, y];
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(2)},${height} L${points[0][0].toFixed(2)},${height} Z`;

  return { line, area };
}

/** Small trend sparkline used inside stat cards. */
export function Sparkline({
  data,
  color = "#4f46e5",
  fillOpacity = 0.15,
  height = 60,
  width = 240,
  strokeWidth = 2,
}: SparklineProps) {
  const { line, area } = buildPath(data, width, height);
  const gradientId = `sparkline-gradient-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} stroke="none" />
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface MultiLineChartProps {
  series: { label: string; color: string; data: number[] }[];
  labels: string[];
  height?: number;
  width?: number;
  highlightIndex?: number;
}

/** Larger multi-series line chart used on the AI Insights performance trend. */
export function MultiLineChart({ series, labels, height = 260, width = 900, highlightIndex }: MultiLineChartProps) {
  const pad = 28;
  const allValues = series.flatMap((s) => s.data);
  const max = Math.max(...allValues);
  const niceMax = Math.ceil(max / 200000) * 200000 || max;
  const gridLines = 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = pad + ((height - pad * 2) / gridLines) * i;
        return (
          <line
            key={i}
            x1={pad}
            y1={y}
            x2={width - pad}
            y2={y}
            stroke="currentColor"
            className="text-slate-800"
            strokeWidth={1}
          />
        );
      })}

      {series.map((s) => {
        const step = (width - pad * 2) / (s.data.length - 1 || 1);
        const points = s.data.map((v, i) => {
          const x = pad + i * step;
          const y = pad + (height - pad * 2) * (1 - v / niceMax);
          return [x, y];
        });
        const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
        const area = `${line} L${points[points.length - 1][0].toFixed(2)},${height - pad} L${points[0][0].toFixed(2)},${height - pad} Z`;
        const gradientId = `mline-${s.label.replace(/\s+/g, "")}`;

        return (
          <g key={s.label}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradientId})`} stroke="none" />
            <path d={line} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {typeof highlightIndex === "number" && points[highlightIndex] && (
              <circle cx={points[highlightIndex][0]} cy={points[highlightIndex][1]} r={4.5} fill={s.color} stroke="#0b1120" strokeWidth={2} />
            )}
          </g>
        );
      })}

      {typeof highlightIndex === "number" && (
        <line
          x1={pad + ((width - pad * 2) / (labels.length - 1 || 1)) * highlightIndex}
          y1={pad}
          x2={pad + ((width - pad * 2) / (labels.length - 1 || 1)) * highlightIndex}
          y2={height - pad}
          stroke="currentColor"
          className="text-slate-700"
          strokeDasharray="4 4"
        />
      )}

      {labels.map((l, i) => {
        const step = (width - pad * 2) / (labels.length - 1 || 1);
        return (
          <text key={l} x={pad + step * i} y={height - 6} textAnchor="middle" fontSize="11" className="fill-slate-500">
            {l}
          </text>
        );
      })}
    </svg>
  );
}
