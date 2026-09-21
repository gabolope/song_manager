import type { CSSProperties } from "react";
import "./Leaves.css";

type Leaf = {
  x: string;
  y: string;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  rotate: number;
  opacity: number;
};

type LeafStyle = CSSProperties & {
  "--x"?: string;
  "--y"?: string;
  "--size"?: string;
  "--duration"?: string;
  "--delay"?: string;
  "--sway"?: string;
  "--rotate"?: string;
  "--o"?: number;
};

const LEAF_COUNT = 80;

// Deterministic pseudo-random generator (seeded) — keeps SSR and client
// output identical while still spreading leaves out organically.
const seededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const rand = seededRandom(20260903);

// Push horizontal placement away from the center and toward the edges:
// values near 0.5 get spread outward, so leaves thin out in the middle
// of the viewport and cluster more toward the sides.
const EDGE_BIAS = 0.55;
const biasTowardEdges = (u: number) => {
  const t = u * 2 - 1;
  const t2 = Math.sign(t) * Math.abs(t) ** EDGE_BIAS;
  return (t2 + 1) / 2;
};

const LEAVES: Leaf[] = Array.from({ length: LEAF_COUNT }, (_, i) => {
  const u = (i + rand()) / LEAF_COUNT;
  const x = biasTowardEdges(u) * 96 + 2;
  const y = rand() * 92 + 4;
  const size = 7 + rand() * 10;
  const duration = 20 + rand() * 22;
  const delay = -rand() * duration;
  const sway = (rand() - 0.5) * 64;
  const rotate = rand() * 360;
  const opacity = 0.25 + rand() * 0.25;

  return {
    x: `${x.toFixed(1)}%`,
    y: `${y.toFixed(1)}%`,
    size: Number(size.toFixed(1)),
    duration: Number(duration.toFixed(1)),
    delay: Number(delay.toFixed(1)),
    sway: Number(sway.toFixed(1)),
    rotate: Number(rotate.toFixed(0)),
    opacity: Number(opacity.toFixed(2)),
  };
});

interface Props {
  color?: string;
}

export const label = "Hojas";

const Leaves = ({ color }: Props) => {
  return (
    <div
      className="leaves-bg"
      style={color ? ({ "--leaf-color": color } as CSSProperties) : undefined}
    >
      {LEAVES.map((leaf, i) => {
        const style: LeafStyle = {
          "--x": leaf.x,
          "--y": leaf.y,
          "--size": `${leaf.size}px`,
          "--duration": `${leaf.duration}s`,
          "--delay": `${leaf.delay}s`,
          "--sway": `${leaf.sway}px`,
          "--rotate": `${leaf.rotate}deg`,
          "--o": leaf.opacity,
        };
        return <span key={i} className="leaf" style={style} />;
      })}
    </div>
  );
};

export default Leaves;
