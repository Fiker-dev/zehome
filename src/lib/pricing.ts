// Pricing + margin rules. Every product price must clear these after
// PayFast fees, the supplier's per-item cost and the delivery we pay for.
//
// Kept free of '@/' imports and non-erasable TS syntax so scripts/margins.ts
// can run it directly with Node.

// PayFast standard rates (payfast.io/fees), excl. VAT. Confirm against the
// merchant dashboard — negotiated or newer rates override these.
export const PAYFAST_FEES = {
  card: { pct: 0.032, fixed: 2, min: 0 },
  eft: { pct: 0.02, fixed: 0, min: 2 },
}
export const VAT_RATE = 0.15

export type PaymentMethod = keyof typeof PAYFAST_FEES

export const PRICING_RULES = {
  minProfit: 100, // rand per order, after all costs
  minMarginPct: 0.25, // profit / selling price
  // Price for the most expensive method, since the customer picks it
  method: 'card' as PaymentMethod,
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function payfastFee(amount: number, method: PaymentMethod = 'card'): number {
  const rate = PAYFAST_FEES[method]
  const exVat = Math.max(amount * rate.pct + rate.fixed, rate.min)
  return round2(exVat * (1 + VAT_RATE))
}

export interface CostInputs {
  supplierCost: number // what the supplier charges us per item
  deliveryCost: number // what we pay to get it to the customer (we offer free delivery)
}

export interface MarginBreakdown {
  price: number
  payfastFee: number
  supplierCost: number
  deliveryCost: number
  profit: number
  marginPct: number
  passes: boolean
}

export function orderMargin(
  price: number,
  costs: CostInputs,
  rules = PRICING_RULES
): MarginBreakdown {
  const fee = payfastFee(price, rules.method)
  const profit = round2(price - fee - costs.supplierCost - costs.deliveryCost)
  const marginPct = price > 0 ? profit / price : 0
  return {
    price,
    payfastFee: fee,
    supplierCost: costs.supplierCost,
    deliveryCost: costs.deliveryCost,
    profit,
    marginPct,
    passes: profit >= rules.minProfit && marginPct >= rules.minMarginPct,
  }
}

// Lowest shop-style price (…49 / …99) that clears the pricing rules.
export function suggestPrice(costs: CostInputs, rules = PRICING_RULES): MarginBreakdown {
  for (let price = 99; price <= 100_000; price += 50) {
    const m = orderMargin(price, costs, rules)
    if (m.passes) return m
  }
  throw new Error('No price under R100 000 clears the pricing rules')
}
