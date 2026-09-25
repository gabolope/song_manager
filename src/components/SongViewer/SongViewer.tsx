import { Badge } from "@chakra-ui/react";
import parse from "html-react-parser";
import {
  type MouseEvent,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import DirectorContext from "@/contexts/DirectorContext";
import PlayerContext from "@/contexts/PlayerContext";
import { useSession } from "@/contexts/SessionContext";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useUsers } from "@/hooks/useUsers";
import { formatSong, transposeKeyLabel } from "@/services/chordpro.service";
import { getDirectorColor } from "@/types/user";
import { fixChordCollisions } from "@/utils/chordLayout";
import LiveBar from "./LiveBar";
import NextSong from "./NextSong";
import ViewerControls from "./ViewerControls";
import "./SongViewer.css";

const SongViewer = () => {
  const {
    book,
    setIsLive,
    isCurrentLive,
    backToLive,
    nextSong,
    clearLiveSong,
    liveSong,
    setCueSection,
  } = useSession();

  const directorCtx = useContext(DirectorContext);
  const playerCtx = useContext(PlayerContext);
  // useMutation devuelve un objeto nuevo en cada render aunque nada haya
  // cambiado; sólo `.mutate` es estable. Depender del objeto completo hacía
  // que exitFullscreen (y por lo tanto el efecto de pantalla completa) se
  // recreara en cada snapshot de Firestore, disparando un segundo
  // requestFullscreen() sin gesto de usuario que el navegador rechaza y
  // termina saliendo de pantalla completa apenas se entra.
  const clearLiveSongMutate = clearLiveSong.mutate;

  const displayedSong = directorCtx?.currentSong ?? playerCtx?.displayedSong;
  // Si se está viendo una canción del repertorio general (no del book/sesión),
  // no tiene sentido mostrar "próxima canción": esa noción sólo existe dentro
  // del orden del book.
  const isFromRepertoire = directorCtx
    ? directorCtx.selectedListSong !== null
    : false;
  const onLeft = directorCtx?.onLeft ?? playerCtx?.onLeft ?? (() => {});
  const onRight = directorCtx?.onRight ?? playerCtx?.onRight ?? (() => {});
  // Pantalla completa es un estado por pestaña (Director y Player pueden estar
  // en dispositivos distintos), lo aporta el contexto de cada página.
  const fullscreen = directorCtx?.fullscreen ?? playerCtx?.fullscreen ?? false;
  // exitFullscreen sólo necesita estas dos piezas de directorCtx/playerCtx,
  // ambas estables (setFullscreen es un setter de useState, isDirector no
  // cambia en la vida de la página). Depender de los objetos de contexto
  // completos hacía que exitFullscreen se recreara cada vez que cambiaba
  // cualquier otro campo (p. ej. currentSong al navegar de canción), lo que
  // volvía a disparar requestFullscreen() sin gesto de usuario y el
  // navegador lo rechazaba, saliendo de pantalla completa apenas se entraba.
  const setFullscreenFn = directorCtx?.setFullscreen ?? playerCtx?.setFullscreen;
  const isDirector = !!directorCtx;

  const { isAdmin, isDemo } = useAuth();
  // Editar escribe en Firestore de verdad: en modo demo no hay cuenta real
  // detrás, así que se oculta (igual que subir canciones). Un admin puede
  // editar aunque haya elegido no dirigir.
  const canEdit = isAdmin && !isDemo;
  const [fontScale, setFontScale] = useState(1);

  const { viewerRef, exitFullscreen, usesFullscreenFallback } = useFullscreen(
    fullscreen,
    setFullscreenFn,
    isDirector,
    setIsLive,
    clearLiveSongMutate,
  );

  // Viaja pegada al objeto de la canción (ver DirectorPage y useLiveSong):
  // así el Player la recibe transparentemente a través de liveSong sin
  // necesitar su propio estado de sesión.
  const transpose = displayedSong?.transpose ?? 0;

  const html = useMemo(() => {
    if (!displayedSong) return "";
    return formatSong(displayedSong.content, transpose);
  }, [displayedSong, transpose]);

  // El ancho de cada acorde en píxeles depende de la fuente/tamaño real, así
  // que sólo se puede corregir colisiones entre acordes después de que el
  // navegador ya renderizó (ver fixChordCollisions). Se re-corre cuando
  // cambia el contenido, el tamaño de fuente, o el ancho disponible
  // (fullscreen, resize, sidebar), ya que todo eso puede mover los acordes.
  const songContentRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = songContentRef.current;
    if (!el) return;
    fixChordCollisions(el);
    const observer = new ResizeObserver(() => fixChordCollisions(el));
    observer.observe(el);
    return () => observer.disconnect();
  }, [html, fontScale]);

  // Sección marcada por el director ("vamos para acá"). Se lee siempre de
  // liveSong (el director ve currentSong del book, que no la trae) y solo se
  // muestra sobre la canción que está en vivo.
  const isShowingLive = !!displayedSong && isCurrentLive(displayedSong);
  const cueSection = isShowingLive ? (liveSong.data?.cueSection ?? null) : null;
  const canCue = isDirector && isShowingLive;

  // Los bloques vienen de parse(html), así que se marcan por DOM (mismo
  // criterio que fixChordCollisions) usando su índice entre los .paragraph.
  useLayoutEffect(() => {
    const el = songContentRef.current;
    if (!el) return;
    el.querySelectorAll(".paragraph").forEach((p, i) =>
      p.classList.toggle("cuedSection", i === cueSection),
    );
  }, [html, cueSection]);

  const onContentClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!canCue) return;
    const paragraph = (e.target as Element).closest(".paragraph");
    if (!paragraph) return;
    const index = Array.from(
      e.currentTarget.querySelectorAll(".paragraph"),
    ).indexOf(paragraph);
    // Tocar la sección ya marcada la desmarca.
    setCueSection.mutate(index === cueSection ? null : index);
  };

  // Tonos particulares de cada director (ver EditSongDialog): se muestran
  // tanto en el repertorio general como dentro de una sesión, para que cada
  // director vea su tono de referencia aunque el tono efectivo (vía
  // transpose) sea otro.
  const { data: users } = useUsers();
  const directorKeys = useMemo(() => {
    if (!displayedSong?.keysByDirector || !users) return [];
    const original = displayedSong.key?.trim().toLowerCase() ?? "";
    return users
      .filter((u) => u.role === "admin")
      .map((u) => ({
        name: u.displayName,
        key: displayedSong.keysByDirector?.[u.uid]?.trim(),
        color: getDirectorColor(u.uid),
      }))
      .filter(
        (
          d,
        ): d is {
          name: string;
          key: string;
          color: ReturnType<typeof getDirectorColor>;
        } => !!d.key && d.key.toLowerCase() !== original,
      );
  }, [displayedSong, users]);

  // Número de la canción dentro de la sesión (book), no del repertorio
  // general: es lo que tiene sentido mirar para saber "qué número toca".
  const bookIndex = useMemo(() => {
    if (!displayedSong || !book) return null;
    const index = book.findIndex((song) => song.id === displayedSong.id);
    return index === -1 ? null : index + 1;
  }, [book, displayedSong]);

  if (!displayedSong) {
    return (
      <div className="songViewerContainer songViewerEmpty">
        Seleccioná una canción para empezar
      </div>
    );
  }

  return (
    <div
      className={[
        "songViewerContainer",
        isCurrentLive(displayedSong) && "isLive",
        usesFullscreenFallback && "songViewerFullscreenFallback",
      ]
        .filter(Boolean)
        .join(" ")}
      ref={viewerRef}
    >
      <ViewerControls
        song={displayedSong}
        canEdit={canEdit}
        fullscreen={fullscreen}
        onFontScaleChange={setFontScale}
        transpose={transpose}
        onTransposeChange={
          directorCtx?.onTransposeChange ?? playerCtx?.onTransposeChange
        }
      />
      <div className="songTitle">
        {!isFromRepertoire && bookIndex !== null && (
          <span className="songIndex">{bookIndex}. </span>
        )}
        {displayedSong.title}
      </div>
      <div className="tono">
        Tono: {transposeKeyLabel(displayedSong.key, transpose) ?? "-"}
        {transpose !== 0 && (
          <span className="transposeBadge">
            {" "}
            ({displayedSong.key ?? "-"} {transpose > 0 ? "+" : ""}
            {transpose})
          </span>
        )}
        {directorKeys.map((d) => (
          <Badge
            key={d.name}
            colorPalette={d.color}
            variant="subtle"
            className="directorKeyBadge"
          >
            {d.name}: {d.key}
          </Badge>
        ))}
      </div>
      <div
        className={canCue ? "songContent canCue" : "songContent"}
        style={{ fontSize: `${fontScale}rem` }}
        ref={songContentRef}
        onClick={onContentClick}
      >
        {parse(html)}
      </div>
      {!isFromRepertoire && <NextSong nextSong={nextSong} />}
      <LiveBar
        songId={displayedSong.id}
        isLive={fullscreen}
        viewerRef={viewerRef}
        onLiveChange={exitFullscreen}
        onLeft={onLeft}
        onRight={onRight}
        isCurrentLive={isCurrentLive(displayedSong)}
        onBackToLive={backToLive}
        hasLiveSession={!!liveSong.data}
        isDirector={isDirector}
      />
    </div>
  );
};

export default SongViewer;
