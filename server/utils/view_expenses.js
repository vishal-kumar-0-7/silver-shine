export function transformExpenses(rows) {
  return rows.map(row => ({
    id: row[0],
    date: row[1],
    timestamp: row[2],
    type: row[3],
    itemName: row[4],
    expense: parseFloat(row[5]) || 0,
    profit: parseFloat(row[6]) || 0,
    notes: row[7] || ''
  }));
}
