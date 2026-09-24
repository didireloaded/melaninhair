export type PricingType = "fixed" | "quantity";

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatMoney(amount: number, symbol = "N$"): string {
  const rounded = roundMoney(amount);
  const text = Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2);
  return `${symbol}${text}`;
}

export function addonLineTotal(pricingType: PricingType, unitPrice: number, quantity: number): number {
  const count = pricingType === "quantity" ? quantity : 1;
  return roundMoney(unitPrice * count);
}

export function specialApplies(
  special: { active: boolean; startDate: string; endDate: string },
  date: string,
): boolean {
  return special.active && special.startDate <= date && special.endDate >= date;
}

export function resolveServicePrice(
  listPrice: number,
  special: { active: boolean; startDate: string; endDate: string; specialPrice: number } | null,
  date: string,
): number {
  if (special && specialApplies(special, date)) return special.specialPrice;
  return listPrice;
}

export type PricedService = {
  price: number;
  durationMinutes: number;
  depositAmount: number | null;
  addons: { pricingType: PricingType; unitPrice: number; quantity: number }[];
};

export function calculateAppointment(items: PricedService[]): {
  total: number;
  duration: number;
  deposit: number;
} {
  let total = 0;
  let duration = 0;
  let deposit = 0;
  for (const item of items) {
    total += item.price;
    duration += item.durationMinutes;
    if (item.depositAmount) deposit += item.depositAmount;
    for (const addon of item.addons) {
      total += addonLineTotal(addon.pricingType, addon.unitPrice, addon.quantity);
    }
  }
  return {
    total: roundMoney(total),
    duration,
    deposit: roundMoney(deposit),
  };
}
