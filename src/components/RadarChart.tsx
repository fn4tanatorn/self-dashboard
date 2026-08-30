const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 80;

function angleFor(index: number, count: number) {
  return -Math.PI / 2 + (index * 2 * Math.PI) / count;
}

function pointFor(index: number, count: number, ratio: number) {
  const angle = angleFor(index, count);
  const r = RADIUS * ratio;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)] as const;
}

// Anchor labels away from the chart edge so long words never clip the viewBox:
// left-side labels grow rightward, right-side labels grow leftward.
function anchorFor(index: number, count: number): "start" | "middle" | "end" {
  const cos = Math.cos(angleFor(index, count));
  if (cos > 0.3) return "end";
  if (cos < -0.3) return "start";
  return "middle";
}

export function RadarChart({
  labels,
  values,
  max = 10,
}: {
  labels: string[];
  values: number[];
  max?: number;
}) {
  const count = labels.length;
  const rings = [0.25, 0.5, 0.75, 1];

  const polygonPoints = values
    .map((v, i) => pointFor(i, count, Math.max(0, Math.min(1, v / max))))
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE + 20}`} className="mx-auto w-full max-w-xs">
      {rings.map((ring) => {
        const pts = Array.from({ length: count }, (_, i) => pointFor(i, count, ring))
          .map(([x, y]) => `${x},${y}`)
          .join(" ");
        return (
          <polygon
            key={ring}
            points={pts}
            fill="none"
            strokeWidth={1}
            className="stroke-neutral-200 dark:stroke-neutral-700"
          />
        );
      })}

      {labels.map((_, i) => {
        const [x, y] = pointFor(i, count, 1);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            strokeWidth={1}
            className="stroke-neutral-200 dark:stroke-neutral-700"
          />
        );
      })}

      <polygon
        points={polygonPoints}
        fillOpacity={0.12}
        strokeWidth={1.5}
        className="fill-neutral-900 stroke-neutral-900 dark:fill-neutral-100 dark:stroke-neutral-100"
      />

      {values.map((v, i) => {
        const [x, y] = pointFor(i, count, Math.max(0, Math.min(1, v / max)));
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={2.5}
            className="fill-neutral-900 dark:fill-neutral-100"
          />
        );
      })}

      {labels.map((label, i) => {
        const [x, y] = pointFor(i, count, 1.15);
        return (
          <text
            key={label}
            x={x}
            y={y}
            fontSize={9}
            textAnchor={anchorFor(i, count)}
            dominantBaseline="middle"
            className="capitalize fill-neutral-500 dark:fill-neutral-400"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
