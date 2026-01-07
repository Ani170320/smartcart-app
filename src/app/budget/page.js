"use client";

import { useStore } from "../context/StoreContext";
import { useState } from "react";

export default function BudgetPage() {
  let { budget, totalSpent, setBudgetAmount } = useStore();
  let [value, setValue] = useState("");

  let remaining = budget - totalSpent;
  let spentPercent =
    budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  let remainingPercent =
    budget > 0 ? Math.max((remaining / budget) * 100, 0) : 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!value) return;
    setBudgetAmount(Number(value));
    setValue("");
  }

  return (
    <div className="page">
      <h1>Budget Management</h1>

      {/* SET BUDGET */}
      <div className="section budget-card">
        <h2>Set Monthly Budget</h2>

        <form className="budget-input-row" onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Enter budget amount"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button className="button">Save</button>
        </form>

        <div className="budget-stats">
          <div>
            <span className="muted">Budget</span>
            <strong>₹{budget}</strong>
          </div>
          <div>
            <span className="muted">Spent</span>
            <strong>₹{totalSpent}</strong>
          </div>
          <div>
            <span className="muted">Remaining</span>
            <strong>₹{remaining}</strong>
          </div>
        </div>
      </div>

      {/* WARNINGS */}
      {remaining < 0 && (
        <div className="alert">
          ❌ Budget exceeded. Please review expenses.
        </div>
      )}

      {remaining > 0 && remaining < budget * 0.2 && (
        <div className="alert">
          ⚠️ Budget below 20%. Spend carefully.
        </div>
      )}

      {/* VISUAL HISTOGRAM */}
      <div className="section">
        <h2>Budget Distribution</h2>

        <div className="budget-histogram">
          <div className="histogram-bar">
            <span>Spent</span>
            <div className="bar-track">
              <div
                className="bar-fill spent"
                style={{ width: `${spentPercent}%` }}
              />
            </div>
            <strong>₹{totalSpent}</strong>
          </div>

          <div className="histogram-bar">
            <span>Remaining</span>
            <div className="bar-track">
              <div
                className="bar-fill remaining"
                style={{ width: `${remainingPercent}%` }}
              />
            </div>
            <strong>₹{remaining}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
