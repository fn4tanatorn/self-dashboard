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
            stroke="#e5e5e5"
            strokeWidth={1}
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
            stroke="#e5e5e5"
            strokeWidth={1}
          />
        );
      })}

      <polygon points={polygonPoints} fill="#171717" fillOpacity={0.12} stroke="#171717" strokeWidth={1.5} />

      {values.map((v, i) => {
        const [x, y] = pointFor(i, count, Math.max(0, Math.min(1, v / max)));
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#171717" />;
      })}

      {labels.map((label, i) => {
        const [x, y] = pointFor(i, count, 1.15);
        return (
          <text
            key={label}
            x={x}
            y={y}
            fontSize={9}
            fill="#737373"
            textAnchor={anchorFor(i, count)}
            dominantBaseline="middle"
            className="capitalize"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
