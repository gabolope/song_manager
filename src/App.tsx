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

let songList = songString.map(song => parser.parse(song))

console.log(songList[1])

const App = () => {
  const [currentSong, setCurrentSong] = useState(songList[1]);
  const [clickedSong, setClickedSong] = useState(0);


  function changeClicked(index: number) {
    setClickedSong(index)
    
    console.log(clickedSong)
  }

  return (
    <>
      <SongList items={songList} onClick={changeClicked} clickedSong={clickedSong} />
       
    </>
  );
};

export default App;
