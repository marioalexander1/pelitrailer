import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const API_URL = 'https://api.themoviedb.org/3';
  const API_key = '3e7a743a3b725651e2640aaa34de3972';
  const IMAGE_PATH = 'https://image.tmdb.org/t/p/original';
  
  const [movies, setMovies] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [trailer, setTrailer] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [noTrailerMsg, setNoTrailerMsg] = useState(false);

  const fetchMovies = async (search) => {
    const type = search ? 'search' : 'discover';
    const { data: { results } } = await axios.get(`${API_URL}/${type}/movie`, {
      params: {
        api_key: API_key,
        query: search,
      },
    });
    setMovies(results);
  };

  const fetchMovieTrailer = async (movieId) => {
    setNoTrailerMsg(false); // Reset mensaje
    const { data } = await axios.get(`${API_URL}/movie/${movieId}/videos`, {
      params: { api_key: API_key },
    });

    const trailer = data.results.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );

    if (trailer) {
      setTrailer(trailer.key);
      setPlaying(true);
    } else {
      setNoTrailerMsg(true);
      setPlaying(true);
      setTrailer(null);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchMovies(searchKey);
  };

  // Cerrar modal con ESC
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        setPlaying(false);
        setTrailer(null);
        setNoTrailerMsg(false);
      }
    },
    []
  );

  useEffect(() => {
    if (playing) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playing, handleKeyDown]);

  return (
    <div>
      {/* Barra de búsqueda */}
      <div className="container mt-4">
        <form onSubmit={handleSubmit} className="form-inline mb-4 d-flex">
          <input
            type="text"
            placeholder="Buscar película..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="form-control flex-grow-1 mr-2"
          />
          <button type="submit" className="btn btn-primary">
            Buscar
          </button>
        </form>
      </div>

      {/* Modal tráiler */}
      {playing && (
        <div className="video-player">
          <div
            className="video-overlay"
            onClick={() => {
              setPlaying(false);
              setTrailer(null);
              setNoTrailerMsg(false);
            }}
          ></div>
          <div className="video-container">
            {trailer ? (
              <iframe
                width="100%"
                height="480"
                src={`https://www.youtube.com/embed/${trailer}?autoplay=1`}
                title="Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="no-trailer-message">
                <p>emm error no existe.</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => setPlaying(false)}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de películas */}
      <div className="container">
        <div className="row">
          {movies.map(
            (movie) =>
              movie.poster_path && (
                <div
                  key={movie.id}
                  className="col-md-4 mb-4 movie-card text-center"
                >
                  <img
                    src={`${IMAGE_PATH}${movie.poster_path}`}
                    alt={movie.title}
                    className="movie-image mb-2"
                    style={{ width: '100%', height: 'auto' }}
                  />
                  <h5>{movie.title}</h5>
                  <button
                    className="btn btn-sm btn-outline-primary mt-2"
                    onClick={() => fetchMovieTrailer(movie.id)}
                  >
                    Ver tráiler
                  </button>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
