interface Props {
  clickedSong: number;
  items: string[];
  onClick: () => void;
}

const SongList = ({ items, clickedSong = 0, onClick }: Props) => {
  return (
    <>
      <h1>Lista de canciones</h1>
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className={clickedSong === index ? "active" : ""}
            onClick={() => onClick()}
          >
            {item}
          </li>
        ))}
      </ul>
    </>
  );
};

export default SongList;
