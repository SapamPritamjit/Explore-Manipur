export function normalizeTerm(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function isImphalLabel(label: string): boolean {
  return normalizeTerm(label)
    .split(" ")
    .some((word) => word === "imphal");
}

export function toRupees(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}