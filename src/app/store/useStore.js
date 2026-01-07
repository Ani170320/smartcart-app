"use client";

import { useState } from "react";

export function useStore() {
  let [budget, setBudget] = useState(5000);
  let [items, setItems] = useState([]);

  let totalSpent = items.reduce((sum, item) => sum + item.price, 0);

  return {
    budget,
    setBudget,
    items,
    setItems,
    totalSpent,
  };
}
