import parse from "html-react-parser";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import FontSizeControls from "@/components/SongViewer/FontSizeControls";
import "@/components/SongViewer/SongViewer.css";
import { useSongFontSize } from "@/hooks/useSongFontSize";
import { formatSong, transposeKeyLabel } from "@/services/chordpro.service";
import { teamDoc } from "@/services/firebase";
import type { SongDTO } from "@/types/song";
import { fixChordCollisions } from "@/utils/chordLayout";

// Vista pública (link/QR que comparte el director): sin cuenta, solo la
// canción en vivo del equipo. No reusa SongViewer porque ese depende de la
// sesión, el book y los contextos de Director/Player; acá no hay nada de eso.
// Las reglas dejan leer sin auth únicamente teams/{teamId}/liveSong/current.
const LivePage = () => {
  const { teamId = null } = useParams();
  // undefined = conectando, null = no hay canción en vivo.
  const [song, setSong] = useState<SongDTO | null | undefined>(undefined);
  const [error, setError] = useState(false);
  const fontSize = useSongFontSize();

  useEffect(() => {
    if (!teamId) return;
    return onSnapshot(
      teamDoc(teamId, "liveSong", "current"),
      (snapshot) => {
        setError(false);
        setSong(snapshot.exists() ? (snapshot.data() as SongDTO) : null);
      },
      (err) => {
        console.error("Error escuchando la canción en vivo:", err);
        setError(true);
      },
    );
  }, [teamId]);

  const transpose = song?.transpose ?? 0;
  const html = useMemo(
    () => (song ? formatSong(song.content, transpose) : ""),
    [song, transpose],
  );

  // Mismo ajuste post-render que SongViewer (ver fixChordCollisions).
  const contentRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    fixChordCollisions(el);
    const observer = new ResizeObserver(() => fixChordCollisions(el));
    observer.observe(el);
    return () => observer.disconnect();
  }, [html, fontSize.scale]);

  const cueSection = song?.cueSection ?? null;
  useLayoutEffect(() => {
    contentRef.current
      ?.querySelectorAll(".paragraph")
      .forEach((p, i) => p.classList.toggle("cuedSection", i === cueSection));
  }, [html, cueSection]);

  if (!song) {
    return (
      <div
        className="songViewerContainer songViewerEmpty"
        style={{ height: "100vh" }}
      >
        {error
          ? "No se pudo conectar a la sesión. Revisá el link y recargá."
          : song === null
            ? "Sin sesión en vivo"
            : "Conectando…"}
      </div>
    );
  }

  return (
    <div className="songViewerContainer" style={{ height: "100vh" }}>
      <div className="viewerTopControls">
        <FontSizeControls
          onIncrease={fontSize.increase}
          onDecrease={fontSize.decrease}
          canIncrease={fontSize.canIncrease}
          canDecrease={fontSize.canDecrease}
        />
      </div>
      <div className="songTitle">{song.title}</div>
      <div className="tono">
        Tono: {transposeKeyLabel(song.key, transpose) ?? "-"}
      </div>
      <div
        className="songContent"
        style={{ fontSize: `${fontSize.scale}rem` }}
        ref={contentRef}
      >
        {parse(html)}
      </div>
    </div>
  );
};

export default LivePage;
