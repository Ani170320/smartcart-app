export function exportToCSV(items, budget, totalSpent) {
  let headers = ["Item Name", "Category", "Price", "Essential"];
  let rows = items.map((item) => [
    item.name,
    item.category,
    item.price,
    item.essential ? "Yes" : "No",
  ]);

  let summary = [
    [],
    ["Budget", budget],
    ["Total Spent", totalSpent],
    ["Remaining", budget - totalSpent],
  ];

  let csvContent =
    headers.join(",") +
    "\n" +
    rows.map((r) => r.join(",")).join("\n") +
    "\n\n" +
    summary.map((r) => r.join(",")).join("\n");

  let blob = new Blob([csvContent], { type: "text/csv" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "smartcart-report.csv";
  a.click();

  URL.revokeObjectURL(url);
}
