export const PRODUCTS = ['Beer', 'Shots', 'Mixed drinks', 'Soda', 'Water', 'Chips'];

export function monthRange(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Choose a valid month.');
  const [year, number] = month.split('-').map(Number);
  return {start: `${month}-01`, end: `${number === 12 ? year + 1 : year}-${String(number === 12 ? 1 : number + 1).padStart(2, '0')}-01`};
}

export function summarizeConsumption(members, entries) {
  const rows = members.map(member => ({...member, counts: Object.fromEntries(PRODUCTS.map(p => [p, 0])), total: 0}));
  const byId = new Map(rows.map(row => [row.id, row]));
  const totals = Object.fromEntries(PRODUCTS.map(p => [p, 0]));
  let total = 0;
  for (const entry of entries) {
    const row = byId.get(entry.member_id);
    if (entry.voided_at || !row || !PRODUCTS.includes(entry.product)) continue;
    const quantity = Number(entry.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) continue;
    row.counts[entry.product] += quantity;
    row.total += quantity;
    totals[entry.product] += quantity;
    total += quantity;
  }
  return {rows, totals, total};
}

export function validateConsumption(draft, today) {
  if (!draft.member_id) return 'Choose a member.';
  if (!PRODUCTS.includes(draft.product)) return 'Choose a product.';
  const quantity = Number(draft.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) return 'Quantity must be a whole number from 1 to 999.';
  const date = new Date(`${draft.used_on}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.used_on) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== draft.used_on) return 'Choose a valid date.';
  if (draft.used_on < '2020-01-01' || draft.used_on > today) return 'Choose a usage date between January 2020 and today.';
  return '';
}
