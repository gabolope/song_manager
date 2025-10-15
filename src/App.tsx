import ChordSheetJS from "chordsheetjs";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  writeBatch,
  doc,
  QuerySnapshot,
  setDoc
} from "firebase/firestore";
import type { Song } from "chordsheetjs";
import SongViewer from "./components/SongViewer";
import SongList from "./components/SongList";
import BookList from "./components/BookList";
import "./App.css";

// Manejo de Firebase:
const firebaseConfig = {
  apiKey: "AIzaSyCrDtz6GBIbxyXIVpeJg863xtZAXoZMASA",
  authDomain: "song-manager-5b3bb.firebaseapp.com",
  projectId: "song-manager-5b3bb",
  storageBucket: "song-manager-5b3bb.firebasestorage.app",
  messagingSenderId: "325687043031",
  appId: "1:325687043031:web:8f83a5918c42df69f7a192",
  measurementId: "G-WXQQQV23PV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

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
  const [uploadedSongs, setUploadedSongs] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Obtener canciones de Firebase:
  useEffect(() => {
    async function fetchSongs() {
      const querySnapshot: QuerySnapshot = await getDocs(
        collection(db, "songs")
      );
      const songs: any[] = [];
      querySnapshot.forEach((doc) => {
        songs.push({ id: doc.id, ...doc.data() });
      });
      setUploadedSongs(songs);
      setIsLoading(false);
      console.log(songs);
    }
    fetchSongs();
  }, []);

  // Agregar canciones a Firebase:
  /* async function uploadSong(list) {
    const docRef = await addDoc(collection(db, "songs"), {
      titulo: "solo tu",
      key: "A",
    });
    console.log("nuevo documento:", docRef.id);
  } */
  // uploadSong();

  async function uploadSongs(list: Song[]) {
    const batch = writeBatch(db);

    list.forEach((song) => {
      if (uploadedSongs.includes(song)) return;
      const ref = doc(collection(db, "songs"));
      batch.set(ref, {
        title: song.title,
        tone: song.key,
      });
    });

    await batch.commit();
    console.log(list.length, "canciones agregadas. ");
  }

  //uploadSongs(songList);

  // Subir lista completa a Firebase:
  async function uploadBook(list: MySong[]){
    await setDoc(doc(db, 'live', 'book'),{
      songs: list.map(song => ({
        title: song.title,
        tone: song.key,
        id: song.id
      }))
    })
 }
  // Cambiar canción compartida en Firebase:
  async function changeSharedSong(song: MySong) {
    await setDoc(doc(db, 'live', 'current'),{
      song: song.title,
      tone: song.key,
      id: song.id
    })
  }

  useEffect(() => {
    if (displayIndex !== null && book[displayIndex]) {
      setCurrentSong(book[displayIndex]);
    }
    uploadBook(book); // sube el book a firebase cada vez que cambia
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
    changeSharedSong(book[index]);
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
      const newIndex = displayIndex - 1;
      setDisplayIndex(newIndex);
      changeSharedSong(book[newIndex]);
    }
  };

  const bookRight = () => {
    // este if pone el límite derecho de la lista.
    if (displayIndex !== null && displayIndex < book.length - 1) {
      const newIndex = displayIndex + 1;
      setDisplayIndex(newIndex);
      changeSharedSong(book[newIndex]);
    }
  };

  // Manejo de teclas y swipe
  useEffect(() => {
    // Teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        bookLeft();
      }
      if (e.key === "ArrowRight") {
        bookRight();
      }
    };

    // Tactil
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;

      if (touchEndX < touchStartX - 50) {
        bookRight();
      }
      if (touchEndX > touchStartX + 50) {
        bookLeft();
      }
    };

    // listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    // cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [bookLeft, bookRight]);

  return (
    <>
      <div className="mainFrame">
        <div className="listContainer">
          <SongList
            items={uploadedSongs}
            onClick={changeListClicked}
            selectedSong={selectedListSong}
            onAdd={addCurrentSongToBook}
            isLoading={isLoading}
          />
          <hr />
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
