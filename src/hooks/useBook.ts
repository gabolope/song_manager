import { fetchBook } from "../services/book.service";
import type { SongDTO } from "../types/song";
import { useQuery } from "@tanstack/react-query";

const useBook = () => {
  return useQuery<SongDTO[], Error>({
    queryKey: ["book"],
    queryFn: fetchBook,
    staleTime: 0,
  });
};

export default useBook;
