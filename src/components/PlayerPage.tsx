import { Button } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { MdFullscreen } from "react-icons/md";
import SongViewer from "../components/SongViewer";
import PlayerContext from "../contexts/PlayerContext";
import { useSession } from "../contexts/SessionContext";
import { useBookNavigation } from "../hooks/useBookNavigation";

const PlayerPage = () => {
  const { book, liveSong, setSelectedBookSong, localSong, setLocalSong } =
    useSession();

  // Pantalla completa es local a esta pestaña, no se comparte con Director.
  const [fullscreen, setFullscreen] = useState(false);

  const displayedSong = localSong ?? liveSong.data;

  const onBookNavigate = useCallback(
    (index: number) => {
      setSelectedBookSong(index);
      if (book) setLocalSong(book[index]);
    },
    [book, setSelectedBookSong, setLocalSong],
  );

  const { onLeft, onRight } = useBookNavigation(
    book,
    false,
    displayedSong,
    onBookNavigate,
  );

  // Memoizado por la misma razón que en DirectorPage: un objeto nuevo en
  // cada render rompe la estabilidad de exitFullscreen en SongViewer y hace
  // que el pedido de pantalla completa se repita sin gesto de usuario.
  const playerContextValue = useMemo(
    () => ({ displayedSong, onLeft, onRight, fullscreen, setFullscreen }),
    [displayedSong, onLeft, onRight, fullscreen],
  );

  return (
    <PlayerContext.Provider value={playerContextValue}>
      <div
        style={{
          height: "100vh",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button
          onClick={() => setFullscreen(!fullscreen)}
          variant="outline"
          size="sm"
          alignSelf="flex-start"
          mb="10px"
        >
          <MdFullscreen />
          Pantalla completa
        </Button>
        <SongViewer />
      </div>
    </PlayerContext.Provider>
  );
};

export default PlayerPage;
