import { useEffect, useRef, useState } from "react";

import { useMoviesState } from "./useMoviesState";
import WatchedMovie from "./watchedMovie";
import WatchedSummary from "./watchedSummary";
import MovieList from "./movieList";
import MovieDetails from "./movieDetails";
import Loader from "./Loader";
import { useLocalStorageState } from "./useLocalStorageState";

export default function App() {
  const [query, setQuery] = useState("");
  const { movies, isLoading, error } = useMoviesState(query, handleCloseMovie);

  const [selectedId, setSelectedId] = useState(null);

  //  const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(Movie) {
    setWatched((watched) => [...watched, Movie]);
    // localStorage.setItem("watched", watched); why wouldnt this work
    // the reason is updte above is happening in a asynchronous way and till now watched array hasnt been
    //updated yet
    //   localStorage.setItem("watched", JSON.stringify([...watched, Movie]));
    // in the local storage we can only store key val pair where val has to string
    // we can also do this in the useeffect function
  }
  function handleDeleteWatched(id) {
    setWatched(watched.filter((Movie) => Movie.imdbID !== id));
  }
  //here we dont need to update watched like above bcz this will only run when the usestate have already
  //updated the watched array

  //by this we are directly passing the prop to the component which needs it instead of sending it through tree
  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onClose={handleCloseMovie}
              onwatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched}></WatchedSummary>
              <WatchedMoviesList
                watched={watched}
                ondelete={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  ); // by this we can eliminate pop drilling using component composition
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === inputEl.current) return;

        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }

      document.addEventListener("keydown", callback);
      return () => document.removeEventListener("keydown", callback);
    },
    [setQuery]
  );
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setisOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setisOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function WatchedMoviesList({ watched, ondelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} ondelete={ondelete} />
      ))}
    </ul>
  );
}
