"use client";

import { createContext, useContext, useEffect, useState } from "react";

const StoreContext = createContext();

/* =========================
   HELPERS
   ========================= */
const getCurrentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
};

/* =========================
   DEFAULT BUDGETS
   ========================= */
const DEFAULT_BUDGETS = {
  personal: {
    amount: 0,
    items: [],
    lastReset: getCurrentMonth(),
  },
  travel: {
    amount: 0,
    items: [],
    lastReset: getCurrentMonth(),
  },
  emergency: {
    amount: 0,
    items: [],
    lastReset: getCurrentMonth(),
    locked: true,
  },
  savings: {
    amount: 0,
    goal: 100000,
    items: [],
    lastReset: getCurrentMonth(),
    locked: true, // ✅ ADD-ON: lock savings
  },
};

export function StoreProvider({ children }) {
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [activeBudget, setActiveBudget] = useState("personal");
  const [history, setHistory] = useState([]);

  /* =========================
     LOAD FROM STORAGE
     ========================= */
  useEffect(() => {
    const b = localStorage.getItem("budgets");
    const a = localStorage.getItem("activeBudget");
    const h = localStorage.getItem("history");

    if (b) setBudgets(JSON.parse(b));
    if (a) setActiveBudget(a);
    if (h) setHistory(JSON.parse(h));
  }, []);

  /* =========================
     MONTHLY RESET
     ========================= */
  useEffect(() => {
    const currentMonth = getCurrentMonth();

    setBudgets((prev) => {
      const updated = { ...prev };
      const historyUpdates = [];

      Object.keys(updated).forEach((key) => {
        const budget = updated[key];

        if (budget.lastReset !== currentMonth) {
          const spent = budget.items.reduce(
            (s, i) => s + i.price,
            0
          );

          if (budget.items.length > 0) {
            historyUpdates.push({
              month: budget.lastReset,
              budgetType: key,
              spent,
              itemCount: budget.items.length,
            });
          }

          /* =========================
             ADD-ON: AUTO SAVE TO SAVINGS
             ========================= */
          if (key === "personal") {
            const leftover = budget.amount - spent;
            if (leftover > 0) {
              updated.savings.amount += leftover;
            }
          }

          updated[key] = {
            ...budget,
            items: [],
            lastReset: currentMonth,
          };
        }
      });

      if (historyUpdates.length > 0) {
        setHistory((prev) => [...prev, ...historyUpdates]);
      }

      return updated;
    });
  }, []);

  /* =========================
     SAVE TO STORAGE
     ========================= */
  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("activeBudget", activeBudget);
  }, [activeBudget]);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  /* =========================
     DERIVED VALUES
     ========================= */
  const current = budgets[activeBudget];

  const totalSpent = current.items.reduce(
    (sum, item) => sum + item.price,
    0
  );

  /* =========================
     ACTIONS
     ========================= */
  function setBudgetAmount(amount) {
    setBudgets((prev) => ({
      ...prev,
      [activeBudget]: {
        ...prev[activeBudget],
        amount,
      },
    }));
  }

  function setSavingsGoal(goal) {
    setBudgets((prev) => ({
      ...prev,
      savings: {
        ...prev.savings,
        goal,
      },
    }));
  }

  function addItem(item) {
    // 🔒 Emergency lock (existing)
    if (
      activeBudget === "emergency" &&
      current.locked &&
      totalSpent + item.price > current.amount
    ) {
      throw new Error(
        "Emergency budget is locked. Cannot overspend."
      );
    }

    // 🔒 ADD-ON: Savings lock
    if (activeBudget === "savings" && current.locked) {
      throw new Error(
        "Savings is locked. You cannot spend from savings."
      );
    }

    setBudgets((prev) => ({
      ...prev,
      [activeBudget]: {
        ...prev[activeBudget],
        items: [...prev[activeBudget].items, item],
      },
    }));
  }

  function deleteItem(id) {
    setBudgets((prev) => ({
      ...prev,
      [activeBudget]: {
        ...prev[activeBudget],
        items: prev[activeBudget].items.filter(
          (i) => i.id !== id
        ),
      },
    }));
  }

  function updateItem(id, updates) {
    setBudgets((prev) => ({
      ...prev,
      [activeBudget]: {
        ...prev[activeBudget],
        items: prev[activeBudget].items.map((i) =>
          i.id === id ? { ...i, ...updates } : i
        ),
      },
    }));
  }

  function resetData() {
    setBudgets(DEFAULT_BUDGETS);
    setActiveBudget("personal");
    setHistory([]);
    localStorage.clear();
  }

  /* =========================
     PROVIDER
     ========================= */
  return (
    <StoreContext.Provider
      value={{
        budgets,
        activeBudget,
        setActiveBudget,

        budget: current.amount,
        items: current.items,
        totalSpent,

        setBudgetAmount,
        setSavingsGoal,
        addItem,
        deleteItem,
        updateItem,

        history,
        resetData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
