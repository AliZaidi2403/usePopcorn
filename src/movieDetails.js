import { useRef, useEffect, useState } from "react";
import StarRating from "./starRating";
import Loader from "./Loader";
const key = "a21aafcd";
export default function MovieDetails({
  selectedId,
  onClose,
  onwatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  //we want a property to know how many times user changed ratings but we dont want to show it ui,
  //so basically do not wnt tpo rerender hence ref is best in this situation
  const countRef = useRef(0);
  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current + 1;
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onClose();
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback); //this is neccesary because each time we opened a movie a new
        //event handler get attached to the document so when we press esc all those event listeners get closed
        //which we obv do not want so we clean up
      };
    },
    [onClose]
  );
  function handleAdd() {
    const newWatched = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: runtime.split(" ").at(0),
      userRating: userRating,
      countRatingDecisions: countRef.current,
    };
    onwatched(newWatched);
    onClose();
  }
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  console.log(movie);
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  useEffect(
    function () {
      document.title = `Movie | ${title}`;
      //cleanUp function functions after each rendering too
      return function () {
        document.title = "UsePopcorn";
        console.log(`Clean up effect for movie ${title}`);
        // now if we think closely then cl should show movie undef because useffect be called after the
        // component got destroyed (pressing back button) but it still shows title and that is because of
        // closure that is function will always remember all the function and variables present at the
        // the time when it is created
      };
    },
    [title] // if we didnt put title in here then it will show undefined, now that is because our title only
    //get changed when fetch get completed on the movie, now we know fetching took time so rendering already
    // happened at that time, and that time the value of title is undefind
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onClose}>
              &larr;
            </button>
            <img src={poster} alt={title} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull;{runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating}
              </p>
            </div>
          </header>
          <section>
            <div className="rating" ref={countRef}>
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={25}
                    onSetRating={setUserRating}
                  />
                  {userRating && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list{" "}
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You have already rated this movie {watchedUserRating}{" "}
                  <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>{" "}
            </p>
            <p>Starring : {actors}</p>
            <p>Directed by : {director}</p>
          </section>{" "}
        </>
      )}
    </div>
  );
}
