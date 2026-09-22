import "./Blobs.css";

// Deterministic pseudo-random generator (seeded), como en Fireflies.
const seededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const rand = seededRandom(20260922);

// Port de @mixin dots($count): 4 capas de 40 puntos vía text-shadow.
const LAYERS = [
  { duration: 44, delay: -27 },
  { duration: 43, delay: -32 },
  { duration: 42, delay: -23 },
  { duration: 41, delay: -19 },
].map((anim) => ({
  ...anim,
  dots: Array.from({ length: 41 }, () => ({
    x: ((rand() - 0.5) * 3).toFixed(2),
    y: ((rand() - 0.5) * 3).toFixed(2),
    hue: Math.floor(rand() * 360),
  })),
}));

export const label = "Manchas";
export const usesColor = false;

// Ignora `color`: siempre multicolor, que es la gracia del fondo.
const Blobs = () => (
  <div className="blobs-bg">
    {LAYERS.map((layer, i) => (
      <span
        key={i}
        className="blob-layer"
        style={{
          animationDuration: `${layer.duration}s`,
          animationDelay: `${layer.delay}s`,
          textShadow: layer.dots
            .map((d) => `${d.x}em ${d.y}em 7px hsla(${d.hue}, 100%, 50%, .9)`)
            .join(", "),
        }}
      >
        .
      </span>
    ))}
  </div>
);

export default Blobs;
