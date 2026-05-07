import { useSongUpload } from "../hooks/onSongUpload";
import { FileUpload, Button } from "@chakra-ui/react";
import { LuUpload } from "react-icons/lu";

const SongUploader = () => {
  const { mutate: uploadSongs, isPending } = useSongUpload();

  return (
    <FileUpload.Root
      maxFiles={200}
      accept={{ "text/plain": [".chordpro", ".cho"] }}
      onFileAccept={({ files }) => uploadSongs(files)}
    >
      <FileUpload.HiddenInput />
      <FileUpload.Trigger asChild>
        <Button variant="outline" size="sm" loading={isPending}>
          <LuUpload />
          Subir canciones
        </Button>
      </FileUpload.Trigger>
    </FileUpload.Root>
  );
};

export default SongUploader;
