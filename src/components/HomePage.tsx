import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-wrap">
      <div className="home-heading">
        <img src="/musica.png" alt="" aria-hidden="true" className="home-logo" />
        <p className="home-title">Song Manager</p>
        <p className="home-subtitle">Seleccioná tu rol para empezar</p>
      </div>

      <div className="role-grid">
        <Link to="/director" className="role-card accent">
          <div className="role-icon director">
            <img
              src="/director.svg"
              alt="Director"
              aria-hidden="true"
              width={100}
              height={100}
            />
          </div>
          <div className="role-text-container">
            <p className="role-label">Director</p>
            <p className="role-desc">Controlá el libro y guiá al equipo</p>
          </div>
        </Link>

        <Link to="/player" className="role-card">
          <div className="role-icon player">
            <img
              src="/player.svg"
              alt="Músico"
              aria-hidden="true"
              width={100}
              height={100}
            />
          </div>
          <div className="role-text-container">
            <p className="role-label">Músico</p>
            <p className="role-desc">Seguí la canción en vivo del director</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
