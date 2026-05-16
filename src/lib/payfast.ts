import crypto from 'crypto'

export interface PayFastParams {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  name_first: string
  name_last: string
  email_address: string
  m_payment_id: string
  amount: string
  item_name: string
  item_description?: string
  // Delivery address passed through PayFast custom fields
  custom_str1?: string // phone
  custom_str2?: string // street address
  custom_str3?: string // city
  custom_str4?: string // province
  custom_str5?: string // postal code
}

export function generateSignature(
  data: Record<string, string>,
  passphrase = ''
): string {
  const pfEncode = (v: string) =>
    encodeURIComponent(v).replace(/%20/g, '+')

  // Sort all data fields alphabetically, skip empty values
  let str = Object.keys(data)
    .sort()
    .filter((k) => data[k] !== '')
    .map((k) => `${k}=${pfEncode(data[k])}`)
    .join('&')

  // Passphrase is appended at the END — not sorted with the other fields
  if (passphrase) {
    str += `&passphrase=${pfEncode(passphrase)}`
  }

  return crypto.createHash('md5').update(str).digest('hex')
}

export function buildPayFastParams(fields: PayFastParams): Record<string, string> {
  const isSandbox = process.env.PAYFAST_SANDBOX === 'true'

  const params: Record<string, string> = {
    merchant_id: fields.merchant_id,
    merchant_key: fields.merchant_key,
    return_url: fields.return_url,
    cancel_url: fields.cancel_url,
    notify_url: fields.notify_url,
    name_first: fields.name_first,
    name_last: fields.name_last,
    email_address: fields.email_address,
    m_payment_id: fields.m_payment_id,
    amount: fields.amount,
    item_name: fields.item_name,
    ...(fields.item_description ? { item_description: fields.item_description } : {}),
    ...(fields.custom_str1 ? { custom_str1: fields.custom_str1 } : {}),
    ...(fields.custom_str2 ? { custom_str2: fields.custom_str2 } : {}),
    ...(fields.custom_str3 ? { custom_str3: fields.custom_str3 } : {}),
    ...(fields.custom_str4 ? { custom_str4: fields.custom_str4 } : {}),
    ...(fields.custom_str5 ? { custom_str5: fields.custom_str5 } : {}),
  }

  return {
    ...params,
    _endpoint: isSandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process',
  }
}
