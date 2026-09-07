import ContentLoader from "react-content-loader";

const ROW_HEIGHT = 48;

interface Props {
  rows?: number;
}

// Mismo alto de fila que .song (SongList.css) para que no salte el layout
// cuando termina de cargar y se reemplaza por la lista real.
const ListSkeleton = ({ rows = 6 }: Props) => (
  <div className="songList" aria-hidden="true">
    {Array.from({ length: rows }).map((_, i) => (
      <ContentLoader
        key={i}
        speed={1.5}
        width="100%"
        height={ROW_HEIGHT}
        viewBox={`0 0 400 ${ROW_HEIGHT}`}
        preserveAspectRatio="none"
        backgroundColor="var(--bg-hover)"
        foregroundColor="var(--border)"
        title="Cargando..."
      >
        <rect x="0" y="9" rx="6" ry="6" width="100%" height="30" />
      </ContentLoader>
    ))}
  </div>
);

export default ListSkeleton;
