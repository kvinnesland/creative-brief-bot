"use client";
// CR-006: SSR-safe hook — initialises to 0 so mobile users never see a desktop flash.
import { useState, useEffect } from "react";

export function useWindowWidth(): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function update() {
      clearTimeout(timer);
      timer = setTimeout(() => setWidth(window.innerWidth), 100);
    }
    setWidth(window.innerWidth);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", update);
    };
  }, []);

  return width;
}
