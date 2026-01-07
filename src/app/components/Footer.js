"use client";

import { useStore } from "../context/StoreContext";
import { useEffect, useState } from "react";

export default function Footer() {
  const { activeBudget, budget, totalSpent } = useStore();
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const savedTime = localStorage.getItem("lastSavedTime");
    if (savedTime) {
      setLastSaved(savedTime);
    }
  }, []);

  useEffect(() => {
    const now = new Date().toLocaleTimeString();
    localStorage.setItem("lastSavedTime", now);
    setLastSaved(now);
  }, [budget, totalSpent, activeBudget]);

  let remaining = budget - totalSpent;

  return (
    <footer
      style={{
        marginTop: "40px",
        padding: "28px 0",
        background:
          "linear-gradient(120deg, rgba(37,99,235,0.15), rgba(236,72,153,0.15))",
        borderTop: "1px solid var(--border)",
        textAlign: "center",
      }}
    >
      {/* APP INFO */}
      <strong style={{ fontSize: "18px" }}>
        SmartCart
      </strong>
      <p className="muted">
        Smart budgeting made simple
      </p>

      {/* LAST SAVED */}
      {lastSaved && (
        <p className="muted">
          Last saved at {lastSaved}
        </p>
      )}

      {/* SIGNATURE */}
      <p
        style={{
          marginTop: "14px",
          fontSize: "16px",
          fontFamily: "'Segoe Script', 'Lucida Handwriting', cursive",
          color: "var(--primary)",
        }}
      >
        — By Anirudh Gadgikar
      </p>

      {/* COPYRIGHT */}
      <p
        className="muted"
        style={{ marginTop: "8px" }}
      >
        © {new Date().getFullYear()} SmartCart
      </p>
    </footer>
  );
}
