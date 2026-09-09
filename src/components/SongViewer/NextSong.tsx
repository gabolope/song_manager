import type { SongDTO } from "@/types/song";
import { Separator } from "@chakra-ui/react";

interface Props {
  nextSong?: SongDTO;
}

const NextSong = ({ nextSong }: Props) => {
  return (
    <div style={{ marginTop: "1.5rem" }}>
      <Separator size="lg" />
      <div style={{ marginTop: "0.75rem" }}>
        {nextSong?.title ? (
          <>
            <p
              style={{
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Próxima canción
            </p>
            <p
              style={{
                fontWeight: 600,
                fontSize: "1.1rem",
                margin: "0.2rem 0 0",
              }}
            >
              {nextSong?.title}
            </p>
            <p style={{ fontSize: ".9rem" }}>Tono: {nextSong?.key}</p>
          </>
        ) : (
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Fin de la lista.
          </p>
        )}
      </div>
    </div>
  );
};

export default NextSong;
