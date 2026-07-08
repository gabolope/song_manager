import type { SongDTO } from "@/types/song";
import { Separator } from "@chakra-ui/react";

interface Props {
  nextSong?: SongDTO;
}

const NextSong = ({ nextSong }: Props) => {
  return (
    <>
      <Separator size="lg" />
      {nextSong?.title ? (
        <>
          <p style={{ fontStyle: "italic" }}>Próxima canción:</p>
          <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            {nextSong?.title}
          </p>
        </>
      ) : (
        "Fin de la lista."
      )}
    </>
  );
};

export default NextSong;
