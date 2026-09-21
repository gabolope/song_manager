interface Props {
  color?: string;
}

export const label = "Sólido";

const Solid = ({ color }: Props) => (
  <div
    className="fixed inset-0 -z-10 pointer-events-none"
    style={{ background: color ?? "var(--accent)" }}
  />
);

export default Solid;
