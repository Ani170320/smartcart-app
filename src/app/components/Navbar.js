"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  let pathname = usePathname();
  let [theme, setTheme] = useState("light");

  useEffect(() => {
    let t = localStorage.getItem("theme") || "light";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  function toggleTheme() {
    let t = theme === "light" ? "dark" : "light";
    setTheme(t);
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }

  function cls(path) {
    return pathname === path ? "nav-link active" : "nav-link";
  }

  return (
    <nav className="navbar">
      <div className="navbar-title">SmartCart</div>

      <div className="navbar-center">
        <Link href="/" className={cls("/")}>Dashboard</Link>
        <Link href="/budget" className={cls("/budget")}>Budget</Link>
        <Link href="/items" className={cls("/items")}>Items</Link>
      </div>

      <div className="navbar-right">
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </nav>
  );
}
