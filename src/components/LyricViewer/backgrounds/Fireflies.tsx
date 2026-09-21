import type { CSSProperties } from "react";
import "./Fireflies.css";

type Firefly = {
  x: string;
  y: string;
  size: number;
  duration: number;
  delay: number;
  flashDuration: number;
  flashDelay: number;
  waypoints: [string, string, string, string, string, string, string, string];
};

type FireflyStyle = CSSProperties & {
  "--x"?: string;
  "--y"?: string;
  "--size"?: string;
  "--duration"?: string;
  "--delay"?: string;
  "--flash-duration"?: string;
  "--flash-delay"?: string;
  "--tx1"?: string;
  "--ty1"?: string;
  "--tx2"?: string;
  "--ty2"?: string;
  "--tx3"?: string;
  "--ty3"?: string;
  "--tx4"?: string;
  "--ty4"?: string;
};

const FIREFLY_COUNT = 50;

// Deterministic pseudo-random generator (seeded) — keeps SSR and client
// output identical while still spreading fireflies out organically.
const seededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const rand = seededRandom(20260921);

const FIREFLIES: Firefly[] = Array.from({ length: FIREFLY_COUNT }, () => {
  const waypoints = Array.from({ length: 4 }, () => [
    `${((rand() - 0.5) * 30).toFixed(1)}vw`,
    `${((rand() - 0.5) * 30).toFixed(1)}vh`,
  ]).flat() as Firefly["waypoints"];

  return {
    x: `${(rand() * 92 + 4).toFixed(1)}%`,
    y: `${(rand() * 92 + 4).toFixed(1)}%`,
    size: Number((2 + rand() * 2.5).toFixed(1)),
    duration: Number((14 + rand() * 20).toFixed(1)),
    delay: Number((-rand() * 20).toFixed(1)),
    flashDuration: Number((3 + rand() * 6).toFixed(1)),
    flashDelay: Number((rand() * 8).toFixed(1)),
    waypoints,
  };
});

interface Props {
  color?: string;
}

export const label = "Luciérnagas";

const Fireflies = ({ color }: Props) => {
  return (
    <div
      className="fireflies-bg"
      style={
        color ? ({ "--firefly-color": color } as CSSProperties) : undefined
      }
    >
      {FIREFLIES.map((firefly, i) => {
        const [tx1, ty1, tx2, ty2, tx3, ty3, tx4, ty4] = firefly.waypoints;
        const style: FireflyStyle = {
          "--x": firefly.x,
          "--y": firefly.y,
          "--size": `${firefly.size}px`,
          "--duration": `${firefly.duration}s`,
          "--delay": `${firefly.delay}s`,
          "--flash-duration": `${firefly.flashDuration}s`,
          "--flash-delay": `${firefly.flashDelay}s`,
          "--tx1": tx1,
          "--ty1": ty1,
          "--tx2": tx2,
          "--ty2": ty2,
          "--tx3": tx3,
          "--ty3": ty3,
          "--tx4": tx4,
          "--ty4": ty4,
        };
        return <span key={i} className="firefly" style={style} />;
      })}
    </div>
  );
};

export default Fireflies;
