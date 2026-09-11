import { IconButton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IoPencil } from "react-icons/io5";
import { useAuth } from "@/contexts/AuthContext";
import { useSongFontSize } from "@/hooks/useSongFontSize";
import type { SongDTO } from "@/types/song";
import EditSongDialog from "./EditSongDialog";
import FontSizeControls from "./FontSizeControls";
import TransposeControls from "./TransposeControls";

interface Props {
  song: SongDTO;
  canEdit: boolean;
  fullscreen: boolean;
  onFontScaleChange: (scale: number) => void;
  transpose: number;
  // Ausente para el Player: sólo el Director puede transportar (ver
  // DirectorContext.onTransposeChange).
  onTransposeChange?: (delta: number) => void;
}

// Agrupa los controles flotantes del SongViewer (tamaño de letra + tono +
// editar) junto con la lógica que los sostiene, para no inflar SongViewer
// con estado que le es ajeno al render de la canción en sí.
const ViewerControls = ({
  song,
  canEdit,
  fullscreen,
  onFontScaleChange,
  transpose,
  onTransposeChange,
}: Props) => {
  const { user } = useAuth();
  const [editingSong, setEditingSong] = useState<SongDTO | null>(null);

  // Preferencia de lectura por dispositivo (no se sincroniza entre usuarios
  // ni pantallas), disponible tanto para directores como para músicos.
  const {
    scale: fontScale,
    increase: increaseFontSize,
    decrease: decreaseFontSize,
    canIncrease: canIncreaseFontSize,
    canDecrease: canDecreaseFontSize,
  } = useSongFontSize(user?.uid);

  // El tamaño de letra se aplica sobre el contenido de la canción, que vive
  // en SongViewer, no acá: se reporta hacia arriba en vez de duplicarlo.
  useEffect(() => {
    onFontScaleChange(fontScale);
  }, [fontScale, onFontScaleChange]);

  return (
    <>
      <div className="viewerTopControls">
        {canEdit && !fullscreen && (
          <IconButton
            onClick={() => setEditingSong(song)}
            variant="solid"
            size="md"
            borderRadius="md"
            // Fijo (no cambia con el tema): el mismo oscuro que usa el
            // fondo general de la app en modo oscuro (--bg).
            bg="#101218"
            color="#e9ebf1"
            _hover={{ bg: "#1c2029" }}
            aria-label="Editar canción"
          >
            <IoPencil />
          </IconButton>
        )}
        <FontSizeControls
          onIncrease={increaseFontSize}
          onDecrease={decreaseFontSize}
          canIncrease={canIncreaseFontSize}
          canDecrease={canDecreaseFontSize}
        />
        {onTransposeChange && (
          <TransposeControls
            transpose={transpose}
            onChange={onTransposeChange}
          />
        )}
      </div>
      {canEdit && (
        <EditSongDialog
          song={editingSong}
          onOpenChange={(open) => !open && setEditingSong(null)}
        />
      )}
    </>
  );
};

export default ViewerControls;
