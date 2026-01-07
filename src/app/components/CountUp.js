"use client";

import { useEffect, useState } from "react";

export default function CountUp({ value }) {
  let [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    let end = Number(value) || 0;
    let duration = 600;
    let stepTime = 16;
    let steps = duration / stepTime;
    let increment = end / steps;

    let timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{display}</span>;
}
