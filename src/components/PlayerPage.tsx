import { Button } from "@chakra-ui/react";
import { MdFullscreen } from "react-icons/md";
import SongViewer from "../components/SongViewer";
import PlayerContext from "../contexts/PlayerContext";
import { useSession } from "../contexts/SessionContext";
import { useBookNavigation } from "../hooks/useBookNavigation";

const PlayerPage = () => {
  const {
    book,
    liveSong,
    setSelectedBookSong,
    isLive,
    setIsLive,
    localSong,
    setLocalSong,
  } = useSession();

  const displayedSong = localSong ?? liveSong.data;

  const { onLeft, onRight } = useBookNavigation(
    book,
    false,
    displayedSong,
    (index) => {
      setSelectedBookSong(index);
      if (book) setLocalSong(book[index]);
    },
  );

  return (
    <PlayerContext.Provider value={{ displayedSong, onLeft, onRight }}>
      <div
        style={{
          height: "100vh",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button
          onClick={() => setIsLive(!isLive)}
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
