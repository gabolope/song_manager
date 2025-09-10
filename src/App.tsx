import "./App.css";

import { useState } from "react";
import SongViewer from "./components/SongViewer";
import SongList from "./components/SongList";
import type { Song } from "chordsheetjs";

import ChordSheetJS from "chordsheetjs";

import chordpro1 from "./songs/alquemecine.chordpro?raw";
import chordpro2 from "./songs/danzarecantare.chordpro?raw";
import chordpro3 from "./songs/entunombrecristo.chordpro?raw";

let songString = [chordpro1, chordpro2, chordpro3];

const parser = new ChordSheetJS.ChordProParser();

const songList: Song[] = songString.map((song) => parser.parse(song));

const App = () => {
  const [currentSong, setCurrentSong] = useState<Song>();
  const [clickedSong, setClickedSong] = useState(0);

  function changeClicked(index: number) {
    setClickedSong(index);
    setCurrentSong(songList[index]);
  }

  return (
    <>
      <SongList
        items={songList}
        onClick={changeClicked}
        selectedSong={clickedSong}
        onAdd={() => console.log(currentSong)}
      />
      <SongViewer displayedSong={currentSong} />
    </>
  );
};

export default App;
