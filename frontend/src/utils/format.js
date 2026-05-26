export function formatAmount(amount) {
  return Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2);
}
