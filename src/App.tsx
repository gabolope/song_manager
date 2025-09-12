import "./App.css";
import ChordSheetJS from "chordsheetjs";
import { useEffect, useState } from "react";
import type { Song } from "chordsheetjs";
import SongViewer from "./components/SongViewer";
import SongList from "./components/SongList";
import BookList from "./components/BookList";

import chordpro1 from "./songs/alquemecine.chordpro?raw";
import chordpro2 from "./songs/danzarecantare.chordpro?raw";
import chordpro3 from "./songs/entunombrecristo.chordpro?raw";

let songString = [chordpro1, chordpro2, chordpro3];

// Parseo canciones a formato Song:
const parser = new ChordSheetJS.ChordProParser();
const songList: Song[] = songString.map((song) => parser.parse(song));

const App = () => {
  const [currentSong, setCurrentSong] = useState<Song>(songList[0]);
  const [selectedListSong, setSelectedListSong] = useState<number | null>(0);
  const [selectedBookSong, setSelectedBookSong] = useState<number | null>(null);
  const [book, setBook] = useState<Song[]>([]);
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    setCurrentSong(book[displayIndex]);
  }, [displayIndex]);

  // Manejo de click en lista:
  const changeListClicked = (index: number) => {
    setSelectedListSong(index);
    setCurrentSong(songList[index]);
    setSelectedBookSong(null); //quita la selección de book
  };

  // Manejo de click en book:
  const changeBookClicked = (index: number) => {
    setSelectedBookSong(index);
    setDisplayIndex(index);
    setSelectedListSong(null); //quita la selección de list
  };

  // Añadir canción a book:
  const addCurrentSongToBook = () => {
    if (book.includes(currentSong))
      return alert(`${currentSong.title} ya se encuentra en la lista`);
    setBook([...book, currentSong]);
    console.log(book);
  };

  // Quitar canción a book:
  const deleteCurrentSongFromBook = () => {
    setBook(book.filter((song) => song !== currentSong));
    setSelectedBookSong(null);
  };

  // Manejo de cambio a izquierda y derecha
  const bookLeft = () => {
    setDisplayIndex(displayIndex - 1);
    setSelectedBookSong(displayIndex);
  };

  const bookRight = () => {
    setDisplayIndex(displayIndex + 1);
    setSelectedBookSong(displayIndex);
  };
  return (
    <>
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
        selectedSong={selectedBookSong}
      />
      <SongViewer
        displayedSong={currentSong}
        onLeft={bookLeft}
        onRight={bookRight}
      />
    </>
  );
};

export default App;
