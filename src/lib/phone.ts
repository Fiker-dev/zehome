// South African mobile number in local 10-digit form (0XX XXX XXXX), or null.
// Accepts the ways people type it: 071 027 8563, +27 71 027 8563, 27710278563.
export function saMobile(input: string): string | null {
  let digits = input.replace(/[^\d+]/g, '')
  if (digits.startsWith('+27')) digits = '0' + digits.slice(3)
  else if (digits.startsWith('27') && digits.length === 11) digits = '0' + digits.slice(2)
  return /^0[6-8]\d{8}$/.test(digits) ? digits : null
}
