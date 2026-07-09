export interface ParsedAmount {
  value: number;
  unit: string;
  raw: string;
  isFixed: boolean;
}

const FIXED_AMOUNT = /適量|少許|隨意|適當/;

export function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}

export function parseAmount(amount: string): ParsedAmount | null {
  const trimmed = (amount ?? "").trim();
  if (!trimmed) return null;
  if (FIXED_AMOUNT.test(trimmed)) {
    return { value: 0, unit: "", raw: trimmed, isFixed: true };
  }

  const half = trimmed.match(/^半(.+)$/);
  if (half) {
    return { value: 0.5, unit: half[1].trim(), raw: trimmed, isFixed: false };
  }

  const numMatch = trimmed.match(/^([\d.]+)\s*(.*)$/);
  if (numMatch) {
    return {
      value: parseFloat(numMatch[1]),
      unit: numMatch[2].trim(),
      raw: trimmed,
      isFixed: false,
    };
  }

  return null;
}

export function formatParsedAmount(parsed: ParsedAmount): string {
  if (parsed.isFixed) return parsed.raw;
  const formatted = Number.isInteger(parsed.value)
    ? String(parsed.value)
    : parsed.value.toFixed(1).replace(/\.0$/, "");
  return parsed.unit ? `${formatted}${parsed.unit}` : formatted;
}

export function addParsedAmounts(a: ParsedAmount, b: ParsedAmount): ParsedAmount | null {
  if (a.isFixed || b.isFixed) return null;
  if (a.unit !== b.unit) return null;
  return { ...a, value: a.value + b.value };
}

export function mergeAmountStrings(amounts: string[]): string {
  const parsed = amounts.map(parseAmount).filter((p): p is ParsedAmount => p !== null);
  if (parsed.length === 0) return amounts[0] ?? "";
  if (parsed.some((p) => p.isFixed)) return parsed.find((p) => p.isFixed)?.raw ?? amounts[0];

  let merged: ParsedAmount | null = null;
  for (const p of parsed) {
    merged = merged ? addParsedAmounts(merged, p) : p;
    if (!merged) return amounts.join(" + ");
  }
  return merged ? formatParsedAmount(merged) : amounts[0];
}

export function subtractAmounts(
  required: string,
  inStock: string
): { need: string; hasEnough: boolean; unitMismatch?: boolean } {
  const pr = parseAmount(required);
  const ps = parseAmount(inStock);

  if (!pr) return { need: required, hasEnough: false };
  if (pr.isFixed) {
    if (inStock.trim()) return { need: "", hasEnough: true };
    return { need: required, hasEnough: false };
  }
  if (!ps || ps.isFixed) return { need: required, hasEnough: false };
  if (pr.unit !== ps.unit) {
    return { need: required, hasEnough: false, unitMismatch: true };
  }

  const diff = pr.value - ps.value;
  if (diff <= 0.0001) return { need: "", hasEnough: true };
  return {
    need: formatParsedAmount({ ...pr, value: diff }),
    hasEnough: false,
  };
}
