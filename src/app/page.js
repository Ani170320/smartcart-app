"use client";

import Footer from "./components/Footer";
import { useStore } from "./context/StoreContext";
import { exportToCSV } from "./utils/exportCSV";
import { useEffect, useState } from "react";
import CountUp from "./components/CountUp";

export default function Home() {
  let {
    budgets,
    activeBudget,
    setActiveBudget,
    budget,
    items,
    totalSpent,
    history,
    resetData,
  } = useStore();

  /* =====================
     NOTIFICATION TOAST
     ===================== */
  let [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    let t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* =====================
     BASIC CALCULATIONS
     ===================== */
  let remaining = budget - totalSpent;
  let usagePercent = Math.min(
    Math.round((totalSpent / budget) * 100) || 0,
    100
  );

  useEffect(() => {
    if (totalSpent > budget) {
      setToast({
        type: "error",
        icon: "⛔",
        text: "Budget exceeded! Reduce spending.",
      });
    } else if (remaining < budget * 0.2) {
      setToast({
        type: "warn",
        icon: "⚠️",
        text: "Budget below 20%. Spend carefully.",
      });
    } else {
      setToast({
        type: "success",
        icon: "✅",
        text: "Spending is under control.",
      });
    }
  }, [totalSpent, budget]);

  /* =====================
     CATEGORY TOTALS
     ===================== */
  let categoryTotals = {};
  items.forEach((item) => {
    categoryTotals[item.category] =
      (categoryTotals[item.category] || 0) + item.price;
  });

  let maxCategoryValue = Math.max(
    ...Object.values(categoryTotals),
    1
  );

  /* =====================
     TOP ITEMS
     ===================== */
  let topItems = [...items]
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);

  /* =====================
     DAILY SAFE SPEND
     ===================== */
  let today = new Date();
  let lastDay = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  );
  let remainingDays =
    lastDay.getDate() - today.getDate() + 1;

  let dailyLimit =
    remaining > 0 && remainingDays > 0
      ? Math.round(remaining / remainingDays)
      : 0;

  /* =====================
     1️⃣ PREDICTION (ADD-ON)
     ===================== */
  let daysPassed = today.getDate();
  let avgDailySpend =
    daysPassed > 0
      ? Math.round(totalSpent / daysPassed)
      : 0;

  let predictedNextMonth =
    avgDailySpend * lastDay.getDate();

  /* =====================
     2️⃣ SAVINGS STATUS
     ===================== */
  let savings = budgets.savings;
  let savingsSpent = savings.items.reduce(
    (s, i) => s + i.price,
    0
  );

  let savingsProgress = savings.goal
    ? Math.round((savingsSpent / savings.goal) * 100)
    : 0;

  let savingsAchieved =
    savings.goal && savingsSpent >= savings.goal;

  return (
    <div className="page">
      {/* HERO */}
      <div className="hero">
        <h1>SmartCart Dashboard</h1>
        <p>
          Track, compare, and control your budgets intelligently.
        </p>
      </div>

      {/* BUDGET TYPE */}
      <div className="section">
        <h2>Budget Type</h2>
        <div className="budget-actions">
          {["personal", "travel", "emergency", "savings"].map(
            (type) => (
              <button
                key={type}
                className="button"
                onClick={() => setActiveBudget(type)}
              >
                {type.toUpperCase()}
              </button>
            )
          )}
        </div>
        <p className="muted">Current: {activeBudget}</p>
      </div>

      {/* BUDGET COMPARISON */}
      <div className="section">
        <h2>Budget Comparison</h2>

        <div className="analytics-grid">
          {Object.entries(budgets).map(([key, data]) => {
            let spent = data.items.reduce(
              (sum, i) => sum + i.price,
              0
            );

            let percent =
              data.amount === 0
                ? 0
                : Math.min(
                    Math.round((spent / data.amount) * 100),
                    100
                  );

            let savingsProgress =
              key === "savings" && data.goal
                ? Math.min(
                    Math.round((spent / data.goal) * 100),
                    100
                  )
                : 0;

            return (
              <div key={key} className="analytics-card">
                <h3>{key.toUpperCase()}</h3>

                <div
                  className="mini-ring"
                  style={{
                    background: `conic-gradient(
                      var(--primary) ${
                        key === "savings"
                          ? savingsProgress
                          : percent
                      }%,
                      var(--border) 0
                    )`,
                  }}
                >
                  <span>
                    {key === "savings"
                      ? `${savingsProgress}%`
                      : `${percent}%`}
                  </span>
                </div>

                <p className="muted">Budget</p>
                <strong>
                  ₹<CountUp value={data.amount} />
                </strong>

                <p className="muted">Spent</p>
                <strong>
                  ₹<CountUp value={spent} />
                </strong>

                <p className="muted">Remaining</p>
                <strong>
                  ₹<CountUp value={data.amount - spent} />
                </strong>

                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {key === "savings" && (
                  <p className="badge">🔒 Goal Based Savings</p>
                )}

                {key === "emergency" && (
                  <p className="badge">🚨 Emergency Only</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CORE METRICS */}
      <div className="card-grid">
        <div className="card">
          <p>Budget</p>
          <div className="card-value">
            ₹<CountUp value={budget} />
          </div>
        </div>

        <div className="card">
          <p>Spent</p>
          <div className="card-value">
            ₹<CountUp value={totalSpent} />
          </div>
        </div>

        <div className="card">
          <p>Remaining</p>
          <div className="card-value">
            ₹<CountUp value={remaining} />
          </div>
          <div className="progress">
            <div
              className="progress-fill"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* SMART INSIGHTS */}
      <div className="section">
        <h2>Smart Insights</h2>

        <p className="insight">
          • Predicted next month spend: ₹
          <CountUp value={predictedNextMonth} />
        </p>

        {savingsAchieved ? (
          <p className="insight">
            🎉 Savings goal achieved! Great job.
          </p>
        ) : (
          <p className="insight">
            • Savings progress:{" "}
            <strong>{savingsProgress}%</strong> of goal
          </p>
        )}
      </div>

      {/* EXPORT */}
      <div className="section">
        <h2>Export & Reports</h2>
        <button
          className="button"
          onClick={() =>
            exportToCSV(items, budget, totalSpent)
          }
        >
          Export CSV
        </button>
      </div>

      <button className="button" onClick={resetData}>
        Reset SmartCart
      </button>

      {/* TOAST */}
      {toast && (
        <div className={`notify-toast notify-${toast.type}`}>
          <span className="notify-icon">{toast.icon}</span>
          {toast.text}
        </div>
      )}

      {/* ✅ FOOTER ADDED */}
      <Footer />
    </div>
  );
}
