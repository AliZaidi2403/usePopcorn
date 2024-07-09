import { useState, useEffect } from "react";
export function useLocalStorageState(initialState, key) {
  // the function that we pass inhere has to be a pure function which means it cant take any arguements
  // and just like values that we pass in use state this func will only run once on the initial render
  const [value, setValue] = useState(function () {
    const storedValue = localStorage.getItem(key) || initialState;
    return JSON.parse(storedValue);
  });
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  ); // here we synchronize our local storage with useeffect hook, so if watched changes there is a change
  //in oir local storage too
  return [value, setValue];
}
