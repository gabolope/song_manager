const SongListFilter = () => {
  return (
    <select
      className="form-select songListFilter"
      aria-label="Default select example"
    >
      <option selected>Todos los tonos</option>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
      <option value="E">E</option>
      <option value="F">F</option>
      <option value="G">G</option>
    </select>
  );
};

export default SongListFilter;
