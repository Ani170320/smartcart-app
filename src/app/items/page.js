"use client";

import { useStore } from "../context/StoreContext";
import { useState } from "react";

export default function ItemsPage() {
  let {
    items,
    addItem,
    deleteItem,
    updateItem,
    budget,
    totalSpent,
  } = useStore();

  let [name, setName] = useState("");
  let [price, setPrice] = useState("");
  let [category, setCategory] = useState("General");

  let [editingId, setEditingId] = useState(null);
  let [editName, setEditName] = useState("");
  let [editPrice, setEditPrice] = useState("");

  let [deletedItem, setDeletedItem] = useState(null);

  let remaining = budget - totalSpent;

  /* =====================
     ADD ITEM
     ===================== */
  function handleAdd(e) {
    e.preventDefault();
    if (!name || !price) return;

    addItem({
      id: Date.now(),
      name,
      price: Number(price),
      category,
      essential: false,
    });

    setName("");
    setPrice("");
    setCategory("General");
  }

  /* =====================
     DELETE + UNDO
     ===================== */
  function handleDelete(item) {
    setDeletedItem(item);
    deleteItem(item.id);

    setTimeout(() => {
      setDeletedItem(null);
    }, 4000);
  }

  function undoDelete() {
    addItem(deletedItem);
    setDeletedItem(null);
  }

  /* =====================
     EDIT
     ===================== */
  function startEdit(item) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price);
  }

  function saveEdit(id) {
    updateItem(id, {
      name: editName,
      price: Number(editPrice),
    });
    setEditingId(null);
  }

  /* =====================
     ESSENTIAL
     ===================== */
  function toggleEssential(item) {
    updateItem(item.id, {
      essential: !item.essential,
    });
  }

  /* =====================
     CATEGORY TOTALS
     ===================== */
  let categoryTotals = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.price;
    return acc;
  }, {});

  let maxCategoryValue = Math.max(
    ...Object.values(categoryTotals),
    1
  );

  /* =====================
     PIE DATA
     ===================== */
  let colors = [
    "#2563eb",
    "#9333ea",
    "#ec4899",
    "#22c55e",
    "#f59e0b",
  ];

  let pieGradient = "";
  let current = 0;
  let totalAmount = Object.values(categoryTotals).reduce(
    (a, b) => a + b,
    0
  );

  Object.entries(categoryTotals).forEach(
    ([_, value], index) => {
      let percent = (value / totalAmount) * 100;
      pieGradient += `${colors[index % colors.length]} ${current}% ${
        current + percent
      }%, `;
      current += percent;
    }
  );

  return (
    <div className="page">
      <h1>Items Management</h1>

      {remaining < budget * 0.2 && (
        <div className="alert">
          ⚠️ Budget is below 20%. Spend carefully.
        </div>
      )}

      {/* ADD ITEM */}
      <div className="section">
        <h2>Add Item</h2>

        <form onSubmit={handleAdd}>
          <input
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>General</option>
            <option>Groceries</option>
            <option>Electronics</option>
            <option>Clothing</option>
          </select>

          <button className="button">Add Item</button>
        </form>
      </div>

      {/* CATEGORY CARDS */}
      <div className="section">
        <h2>Categories Overview</h2>

        <div className="category-cards">
          {[
            { name: "Groceries", icon: "🛒", color: "#22c55e" },
            { name: "Electronics", icon: "💻", color: "#2563eb" },
            { name: "Clothing", icon: "👕", color: "#ec4899" },
            { name: "General", icon: "📦", color: "#9333ea" },
          ].map((cat) => {
            let total = items
              .filter((i) => i.category === cat.name)
              .reduce((s, i) => s + i.price, 0);

            return (
              <div
                key={cat.name}
                className="category-card"
                style={{
                  background: `linear-gradient(135deg, ${cat.color}, #00000030)`,
                }}
              >
                <div className="category-icon">{cat.icon}</div>
                <div>
                  <h3>{cat.name}</h3>
                  <p>₹{total}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CATEGORY HISTOGRAM */}
      <div className="section">
        <h2>Spending by Category</h2>

        {items.length === 0 ? (
          <div className="empty-visual">
            🛒
            <p>Add items to see insights</p>
          </div>
        ) : (
          <div className="category-histogram">
            {Object.entries(categoryTotals).map(
              ([cat, value]) => (
                <div key={cat} className="category-row">
                  <span>{cat}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${
                          (value / maxCategoryValue) * 100
                        }%`,
                        background:
                          "linear-gradient(90deg, var(--primary), #9333ea)",
                      }}
                    />
                  </div>
                  <strong>₹{value}</strong>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* PIE CHART */}
      <div className="section">
        <h2>Category Distribution</h2>

        {items.length === 0 ? (
          <div className="empty-visual">
            📊
            <p>Add items to see distribution</p>
          </div>
        ) : (
          <div className="pie-wrapper">
            <div
              className="pie"
              style={{
                background: `conic-gradient(${pieGradient.slice(
                  0,
                  -2
                )})`,
              }}
            />
            <ul className="pie-legend">
              {Object.entries(categoryTotals).map(
                ([cat, value], index) => (
                  <li key={cat}>
                    <span
                      className="legend-dot"
                      style={{
                        backgroundColor:
                          colors[index % colors.length],
                      }}
                    />
                    {cat} – ₹{value}
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ITEMS LIST */}
      <div className="section">
        <h2>Items List</h2>

        {items.length === 0 ? (
          <p className="muted">No items added yet</p>
        ) : (
          <ul className="list">
            {items.map((item) => (
              <li
                key={item.id}
                className={`list-item ${
                  item.essential ? "essential-item" : ""
                }`}
              >
                {editingId === item.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) =>
                        setEditName(e.target.value)
                      }
                    />
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) =>
                        setEditPrice(e.target.value)
                      }
                    />
                    <button
                      className="button"
                      onClick={() => saveEdit(item.id)}
                    >
                      Save
                    </button>
                    <button
                      className="link-danger"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <strong>
                        {item.essential && (
                          <span className="badge">
                            Essential
                          </span>
                        )}
                        {item.name}
                      </strong>
                      <div className="muted">
                        {item.category}
                      </div>
                    </div>

                    <div>
                      ₹{item.price}
                      <button
                        className="link-danger"
                        onClick={() =>
                          handleDelete(item)
                        }
                      >
                        Delete
                      </button>
                      <button
                        className="link-danger"
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="link-danger"
                        onClick={() =>
                          toggleEssential(item)
                        }
                      >
                        {item.essential
                          ? "Unmark"
                          : "Essential"}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* UNDO TOAST */}
      {deletedItem && (
        <div className="toast">
          Item deleted
          <button onClick={undoDelete}>Undo</button>
        </div>
      )}
    </div>
  );
}
