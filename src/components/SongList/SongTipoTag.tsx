import type { SongTipo } from "@/types/song";
import { TIPO_LABEL } from "@/utils/song";

interface Props {
  tipo: SongTipo;
}

const SongTipoTag = ({ tipo }: Props) => (
  <span className={`songTipoTag songTipoTag--${tipo}`}>{TIPO_LABEL[tipo]}</span>
);

export default SongTipoTag;
