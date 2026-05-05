import type { db } from "@/services/firebase";
import type { SongDTO } from "@/types/song";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, collection, writeBatch } from "firebase/firestore";



const useAddToBook = () => {
  const queryClient = useQueryClient();

  return useMutation<SongDTO>({
    
})
export default useAddToBook