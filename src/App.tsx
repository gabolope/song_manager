import "./App.css";
import { useState } from "react";
import SongViewer from "./components/SongViewer";
import SongList from "./components/SongList";

import chordpro1 from "./songs/alquemecine.chordpro?raw";
import chordpro2 from "./songs/danzarecantare.chordpro?raw";
import chordpro3 from "./songs/entunombrecristo.chordpro?raw";

let songList = [chordpro1, chordpro2, chordpro3];

const App = () => {
  const [currentSong, setCurrentSong] = useState(chordpro3);
  const [clickedSong, setClickedSong] = useState(0);

  function changeSong() {
    setCurrentSong(chordpro2);
  }

  function changeClicked() {
    setClickedSong();
  }

  return (
    <>
      <SongList items={songList} onClick={changeClicked}></SongList>
      <SongViewer song={currentSong} onClick={changeSong} />
    </>
  );
};

export default App;
