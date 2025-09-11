import "./App.css";
import ChordSheetJS from "chordsheetjs";
import { useState } from "react";
import type { Song } from "chordsheetjs";
import SongViewer from "./components/SongViewer";
import SongList from "./components/SongList";
import BookList from "./components/BookList";

import chordpro1 from "./songs/alquemecine.chordpro?raw";
import chordpro2 from "./songs/danzarecantare.chordpro?raw";
import chordpro3 from "./songs/entunombrecristo.chordpro?raw";

let songString = [chordpro1, chordpro2, chordpro3];

const parser = new ChordSheetJS.ChordProParser();

const songList: Song[] = songString.map((song) => parser.parse(song));

const App = () => {
  const [currentSong, setCurrentSong] = useState<Song>(songList[0]);
  const [clickedSong, setClickedSong] = useState(0);
  const [book, setBook] = useState<Song[]>([]);

  function changeClicked(index: number) {
    setClickedSong(index);
    setCurrentSong(songList[index]);
  }

  const addCurrentSongToBook = () => {
    if (book.includes(currentSong))
      return alert(`${currentSong.title} ya se encuentra en la lista`);
    setBook([...book, currentSong]);
    console.log(book);
  };

  const deleteCurrentSongFromBook = () => {
    setBook(book.filter((song) => song !== currentSong));
  };

  return (
    <>
      <SongList
        items={songList}
        onClick={changeClicked}
        selectedSong={clickedSong}
        onAdd={addCurrentSongToBook}
      />
      <BookList
        items={book}
        onClick={changeClicked}
        onDelete={deleteCurrentSongFromBook}
        selectedSong={clickedSong}
      />
      <SongViewer displayedSong={currentSong} />
    </>
  );
};

export default App;
