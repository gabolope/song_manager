import type { CSSProperties } from "react";
import "./Waves.css";

interface Props {
  color?: string;
}

export const label = "Olas";

const Waves = ({ color }: Props) => {
  return (
    <div
      className="waves-bg"
      style={color ? ({ "--wave-color": color } as CSSProperties) : undefined}
    >
      <span />
      <span />
      <span />
    </div>
  );
};

export default Waves;
