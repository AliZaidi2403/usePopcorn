import { useEffect, useState } from "react";
const key = "a21aafcd";
export function useMoviesState(query, callback) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [movies, setMovies] = useState([]);

  //setState are asynchronous
  // we will create a local storage on browser like each time there is an update in the data of watched
  //movie, so each time when the application loads we will read thay data feom local storage and we will
  //store it in the watched state

  //if we fetch our data like this then every second our app will send multiple fetch
  //request to this api and this is because setting the state in render logic will immediatley cause the
  //component to render again and as the component is rerendered the function is executed again
  // which we cause fetching again this goes over and over
  /* fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=${key}&s=interstellar`)
    .then((res) => res.json())
    .then((data) => setMovies(data.Search)); */

  //useeffect come to the resue

  useEffect(
    function () {
      callback?.();
      //cleaning up after fetching
      // this controller just like fetch is browser api and has nothing to do wth react
      const controller = new AbortController();
      //now each time there a new key stroke in query component get rerendered and fetching is happening
      //again and again, now by this each time a new re rendered happen our controller would abort
      //the current fetch request by calling the clean up function now this is nessary for better
      //performance or in case if the request of complete query takes more time than half queries then
      //it will show the unwanted result and each time a fetch is cancelled js sees it as a error but that is
      //the error which is not technical
      async function fetchMovies() {
        /*    useEffect(function () {
            console.log("After every render");
          });
    
          useEffect(function () {
            console.log("after initial render");
          }, []);
    
          console.log("During Render");
          
          useEffect(function(){
            console.log("after initial render and after every change in the state of query ")
          },[query])
          */

        // what do you think is the order in which they print ?
        //Ans C->A->B c print first because effects only run after the browser paint while the render logic
        // run during the rendering, A print first because A appear first in the code

        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?i=tt3896198&apikey=${key}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("Something went wrong! Try again later");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie Not Found");
          setMovies(data.Search);
          setError("");
        } catch (err) {
          console.log(err);
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      if (!query.length) {
        setMovies([]);
        setError("");
        return;
      }
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  //  second arguement is the dependency array, passing an empty array means that the effect will only
  //run on the mount or when the app componet is renders for the very first time
  // reacting to error is not built in the fetch function so we need to do that manually

  return { movies, error, isLoading };
}
