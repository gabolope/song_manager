import type { Song } from "chordsheetjs";
import ContentLoader from "react-content-loader";
import "./SongList.css";

interface Props {
  isLoading?: boolean;
  items: Song[];
  onAdd: () => void;
  onClick: (id: number) => void;
  selectedSong: number | null;
}

const BulletList = () => (
  <ContentLoader viewBox="0 0 400 150" height={130} width={400}>
    <circle cx="10" cy="20" r="8" />
    <rect x="25" y="15" rx="5" ry="5" width="220" height="10" />
    <circle cx="10" cy="50" r="8" />
    <rect x="25" y="45" rx="5" ry="5" width="220" height="10" />
    <circle cx="10" cy="80" r="8" />
    <rect x="25" y="75" rx="5" ry="5" width="220" height="10" />
    <circle cx="10" cy="110" r="8" />
    <rect x="25" y="105" rx="5" ry="5" width="220" height="10" />
  </ContentLoader>
);

const SongList = ({
  isLoading,
  items,
  selectedSong = 0,
  onAdd,
  onClick,
}: Props) => {
  return (
    <div className="list-group songListContainer">
      {isLoading && <BulletList />}
      {items.map((item, index) => (
        <div
          key={index}
          className={
            selectedSong === index
              ? "listItem list-group-item list-group-item-action active"
              : " listItem list-group-item list-group-item-action"
          }
          onClick={() => onClick(index)}
        >
          <div className="songName">
            <div className="songTitle">{item.title}</div>
            <div className="songKey">
              {" "}
              Tono: <span>{item.tone}</span>
            </div>
          </div>
          <div>
            {selectedSong === index ? (
              <button className="btn btn-outline-light" onClick={() => onAdd()}>
                Agregar
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SongList;
