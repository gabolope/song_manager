import "./App.css";
import ChordSheetJS from "chordsheetjs";
import { useEffect, useState } from "react";
import type { Song } from "chordsheetjs";
import SongViewer from "./components/SongViewer";
import SongList from "./components/SongList";
import BookList from "./components/BookList";

// Importar todos los archivos de la carpeta como texto.
const rawSongs = import.meta.glob("./songs/*.chordpro", {
  eager: true, // hace que la operación se sincrónica
  as: "raw", // indica a Vite que importe contenido como string (equivalente a ?raw)
});

// Obtener un array de strings a partir del objeto modules
const songString = Object.values(rawSongs) as string[];

// Creo un tipo de Song para TS, que tiene un id agregado:
type MySong = Song & { id: number };

// Parseo canciones a formato Song:
const parser = new ChordSheetJS.ChordProParser();
const songList: MySong[] = songString.map((song, i) => {
  const parsed = parser.parse(song) as MySong;
  parsed.id = i;
  return parsed;
});

const App = () => {
  const [currentSong, setCurrentSong] = useState<MySong>(songList[0]);
  const [selectedListSong, setSelectedListSong] = useState<number | null>(null);
  const [book, setBook] = useState<MySong[]>([]);
  const [displayIndex, setDisplayIndex] = useState<number | null>(null);

  useEffect(() => {
    if (displayIndex !== null && book[displayIndex]) {
      setCurrentSong(book[displayIndex]);
    }
  }, [displayIndex, book]);

  // Manejo de click en lista:
  const changeListClicked = (index: number) => {
    setSelectedListSong(index);
    setCurrentSong(songList[index]);
    setDisplayIndex(null); //quita la selección de book
  };

  // Manejo de click en book:
  const changeBookClicked = (index: number) => {
    setDisplayIndex(index);
    setSelectedListSong(null); //quita la selección de list
  };

  // Añadir canción a book:
  const addCurrentSongToBook = () => {
    if (book.some((song) => song.id === currentSong.id))
      return alert(`${currentSong.title} ya se encuentra en la lista`);
    setBook([...book, currentSong]);
  };

  // Quitar canción a book:
  const deleteCurrentSongFromBook = () => {
    setBook(book.filter((song) => song !== currentSong));
    setDisplayIndex(null);
  };

  // Manejo de cambio a izquierda y derecha
  const bookLeft = () => {
    // este if pone el límite izquierdo de la lista.
    if (displayIndex !== null && displayIndex > 0) {
      setDisplayIndex(displayIndex - 1);
    } else {
      console.log("limite izquierda");
    }
  };

  const bookRight = () => {
    // este if pone el límite derecho de la lista.
    if (displayIndex !== null && displayIndex < book.length - 1) {
      setDisplayIndex(displayIndex + 1);
    } else {
      console.log("limite derecha");
    }
  };
  return (
    <>
      <div className="mainFrame">
        <div className="listContainer">
          <SongList
            items={songList}
            onClick={changeListClicked}
            selectedSong={selectedListSong}
            onAdd={addCurrentSongToBook}
          />
          <BookList
            items={book}
            onClick={changeBookClicked}
            onDelete={deleteCurrentSongFromBook}
            selectedSong={displayIndex}
          />
        </div>
        <SongViewer
          displayedSong={currentSong}
          onLeft={bookLeft}
          onRight={bookRight}
        />
      </div>
    </>
  );
};

export default App;
