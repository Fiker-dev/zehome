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
    ...(fields.item_description
      ? { item_description: fields.item_description }
      : {}),
  }

  const passphrase = process.env.PAYFAST_PASSPHRASE ?? ''
  // merchant_key is sent in the form but excluded from signature per PayFast docs
  const { merchant_key: _mk, ...signatureData } = params
  params.signature = generateSignature(signatureData, passphrase)

  return {
    ...params,
    _endpoint: isSandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process',
  }
}
