import { Button } from "@chakra-ui/react";
import { MdFullscreen } from "react-icons/md";
import SongViewer from "../components/SongViewer";
import { useBookNavigation } from "../hooks/useBookNavigation";
import { useSessionState } from "../hooks/useSessionState";

const PlayerPage = () => {
  const {
    book,
    liveSong,
    setSelectedBookSong,
    isLive,
    setIsLive,
    localSong,
    setLocalSong,
    isCurrentLive,
    backToLive,
    nextSong,
  } = useSessionState();

  const displayedSong = localSong ?? liveSong.data;

  const { onLeft, onRight } = useBookNavigation(
    book,
    false, // nunca es director
    displayedSong,
    (index) => {
      setSelectedBookSong(index);
      if (book) setLocalSong(book[index]);
    },
  );

  return (
    <div style={{ height: "100vh", padding: "10px" }}>
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
      <SongViewer
        displayedSong={displayedSong}
        isCurrentLive={isCurrentLive(displayedSong)}
        isLive={isLive}
        isDirector={false}
        nextSong={nextSong}
        onBackToLive={backToLive}
        onLiveChange={setIsLive}
        onLeft={onLeft}
        onRight={onRight}
      />
    </div>
  );
};

export default PlayerPage;
