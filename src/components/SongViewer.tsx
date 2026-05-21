import { ActionBar, Button, Portal } from "@chakra-ui/react";
import parse from "html-react-parser";
import { useEffect, useMemo, useRef } from "react";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { IoIosExit } from "react-icons/io";
import { formatSong } from "../services/chordpro.service";
import type { SongDTO } from "../types/song";
import "./SongViewer.css";

interface Props {
  displayedSong?: SongDTO | null;
  isCurrentLive: boolean;
  isLive: boolean;
  isDirector: boolean;
  nextSong: SongDTO | undefined;
  onBackToLive: () => void;
  onLiveChange: (value: boolean) => void;
  onLeft: (id: string) => void;
  onRight: (id: string) => void;
}

const SongViewer = ({
  displayedSong,
  isCurrentLive,
  isLive,
  nextSong,
  onBackToLive,
  onLiveChange,
  onLeft,
  onRight,
}: Props) => {
  const html = useMemo(() => {
    if (!displayedSong) return "";
    return formatSong(displayedSong.content);
  }, [displayedSong]);

  // Manejo de fullscreen
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLive) {
      viewerRef.current?.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [isLive]);

  // Manejo de salida manual del fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onLiveChange(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [onLiveChange]);

  if (!displayedSong) {
    return <div className="songViewerContainer">Seleccioná una canción</div>;
  }

  return (
    <>
      <div
        className={
          isCurrentLive ? "songViewerContainer isLive" : "songViewerContainer"
        }
        ref={viewerRef}
      >
        <div className="songTitle">{displayedSong.title}</div>
        <div className="tono">Tono: {displayedSong.key ?? "-"}</div>
        <div>{parse(html)}</div>
        <div className="nextSong">
          {nextSong?.title ? (
            <>
              <p>Próxima canción:</p> <p>{nextSong?.title}</p>
            </>
          ) : (
            "Fin de la lista."
          )}
        </div>
        <ActionBar.Root open={isLive}>
          <Portal container={viewerRef}>
            <ActionBar.Positioner>
              <ActionBar.Content>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLeft(displayedSong.id)}
                >
                  <FaAngleDoubleLeft />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLiveChange(false)}
                >
                  <IoIosExit />
                  Salir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRight(displayedSong.id)}
                >
                  <FaAngleDoubleRight />
                </Button>
              </ActionBar.Content>
            </ActionBar.Positioner>
          </Portal>
        </ActionBar.Root>
        <Button
          onClick={onBackToLive}
          colorPalette="red"
          className="backToLive"
          visibility={!isCurrentLive && isLive ? "visible" : "hidden"}
        >
          Volver al Vivo
        </Button>
      </div>
    </>
  );
};

export default SongViewer;
