import "./App.css";
import { useState } from "react";
import SongViewer from "./components/SongViewer";
import SongList from "./components/SongList";

import ChordSheetJS from "chordsheetjs";


import chordpro1 from "./songs/alquemecine.chordpro?raw";
import chordpro2 from "./songs/danzarecantare.chordpro?raw";
import chordpro3 from "./songs/entunombrecristo.chordpro?raw";

let songString = [chordpro1, chordpro2, chordpro3];

const parser = new ChordSheetJS.ChordProParser();

let songList = songString.map(song => parser.parse(song))

console.log(songList)

const App = () => {
  const [currentSong, setCurrentSong] = useState(chordpro3);
  const [clickedSong, setClickedSong] = useState(0);

  function changeSong() {
    setCurrentSong(chordpro2);
  }

  function changeClicked() {
    setClickedSong(1)
  }

  return (
    <>
      <SongList songList={songList} onClick={changeClicked} clickedSong={clickedSong}></SongList>
      <SongViewer song={currentSong} onClick={changeSong} />
    </>
  );
};

export default App;
