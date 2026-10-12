/**
 * Ze Home Finds — order sheet webhook (Google Apps Script, bound to the
 * "zehome finds orders" spreadsheet). The store POSTs JSON here
 * (GOOGLE_SHEETS_WEBHOOK_URL) when a checkout starts, is paid or cancelled.
 *
 * One row per order: the first message adds the row, later messages for the
 * same Order ID update it (Pending payment -> Paid -> ...). Columns are matched
 * by header name, so you can reorder columns or add your own (e.g. Notes).
 * Tracking Number and anything you type yourself is never overwritten.
 *
 * When an order becomes Paid it emails NOTIFY_EMAIL once with the customer's
 * details and the Perfect Dealz shopping list (sent from the account that
 * owns this script, via MailApp; first deploy asks you to Allow email).
 *
 * Install: open the existing script project (from the sheet: Extensions >
 * Apps Script, or the project in Drive) > replace Code.gs with this file > Save >
 * Deploy > Manage deployments > (pencil) > Version: New version > Deploy.
 * Editing the existing deployment keeps the same URL, so Vercel needs no change.
 *
 * Shared secret: the web app is open to "Anyone", so every POST must carry
 * "secret" equal to the Script property WEBHOOK_SECRET (Project Settings >
 * Script properties). The store sends it from the Vercel env var
 * GOOGLE_SHEETS_WEBHOOK_SECRET. Without the property set, posts are refused.
 */

var SHEET_NAME = 'Orders'
// The "zehome finds orders" spreadsheet, so this works whether the script is
// attached to the sheet (Extensions > Apps Script) or a separate project.
var SPREADSHEET_ID = '1rb3iaJNuWmpGmW7p0cDGz3GXfsRx371oE0esil-KW1I'
var NOTIFY_EMAIL = 'fikerzabate16@gmail.com'

// Sheet header -> field in the store's JSON (or a function of it)
var COLUMNS = {
  'Order ID': 'orderId',
  'Date': 'date',
  'Name': function (d) { return [d.firstName, d.lastName].filter(Boolean).join(' ') },
  'Email': 'email',
  'Phone': 'phone',
  'Address': 'address',
  'City': 'city',
  'Province': 'province',
  'Postal Code': 'postalCode',
  'Product': 'product',
  'Amount': 'amount',
  'Payment Status': 'paymentStatus',
  'Dispatch status': 'dispatchStatus',
  'Reminder': 'reminder',
}
var KEEP_FIRST = { 'Date': true }                 // keep when the order was placed
var AS_TEXT = { 'Phone': true, 'Postal Code': true } // keep leading zeros

function doPost(e) {
  var lock = LockService.getScriptLock()
  lock.waitLock(15000) // PayFast can notify twice at once; avoid duplicate rows
  try {
    var data = JSON.parse(e.postData.contents)
    var expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET')
    if (!expected || data.secret !== expected) return reply({ ok: false, error: 'unauthorized' })
    delete data.secret // never stored or emailed
    if (!data.orderId) return reply({ ok: false, error: 'orderId required' })
    var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID)
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0]
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map(function (h) { return String(h).trim() })

    var incoming = headers.map(function (h) {
      var field = COLUMNS[h]
      if (!field) return null
      var v = typeof field === 'function' ? field(data) : data[field]
      if (v === undefined || v === null || v === '') return null
      v = String(v)
      if (AS_TEXT[h] && v.charAt(0) !== "'") v = "'" + v
      return v
    })

    var idCol = headers.indexOf('Order ID')
    var row = findRow(sheet, idCol, String(data.orderId))
    var statusCol = headers.indexOf('Payment Status')
    var previousStatus = row === -1 || statusCol < 0 ? '' : String(sheet.getRange(row, statusCol + 1).getValue())
    if (row === -1) {
      sheet.appendRow(incoming.map(function (v) { return v === null ? '' : v }))
    } else {
      var range = sheet.getRange(row, 1, 1, headers.length)
      var current = range.getValues()[0]
      var merged = current.map(function (cur, i) {
        if (KEEP_FIRST[headers[i]] && cur !== '') return cur
        if (incoming[i] !== null) return incoming[i]
        // Kept as-is; re-mark text columns so writing back keeps leading zeros
        if (AS_TEXT[headers[i]] && cur !== '') return "'" + String(cur).replace(/^'/, '')
        return cur
      })
      range.setValues([merged])
    }
    // Email once, when the order first reaches a Paid status
    var status = String(data.paymentStatus || '')
    if (/^Paid/.test(status) && !/^Paid/.test(previousStatus)) notifyPaid(data, ss)
    return reply({ ok: true, row: row === -1 ? sheet.getLastRow() : row })
  } finally {
    lock.releaseLock()
  }
}

function notifyPaid(raw, ss) {
  // The store prefixes ' to keep text as text in the sheet; drop it for email
  var d = {}
  Object.keys(raw).forEach(function (k) { d[k] = String(raw[k] == null ? '' : raw[k]).replace(/^'/, '') })
  var problem = /match|DO NOT/i.test(String(d.paymentStatus) + ' ' + String(d.dispatchStatus))
  var name = [d.firstName, d.lastName].filter(Boolean).join(' ')
  var buy = String(d.reminder || '').split(' · ').filter(function (p) { return /^BUY/.test(p) })[0] || ''
  var parts = buy.split(' | ')
  var carts = parts.filter(function (p) { return /^1-CLICK CART/.test(p) })
    .map(function (p) { return p.replace(/^1-CLICK CART → ([^:]+): /, '👉 BUY NOW at $1 (opens checkout with the items and delivery address filled in — check, then pay):\n') })
  var itemLines = parts.filter(function (p) { return !/^1-CLICK CART/.test(p) }).join('\n')
  var noEmail = !/@/.test(d.email)
  // Receipt the owner can send to the customer on WhatsApp in one tap (only
  // for good payments; a mismatched payment must be checked first)
  var waLink = problem ? '' : whatsappReceiptLink(d)
  var subject = (problem ? '⚠️ DO NOT DISPATCH — check payment ' : '🛒 New paid order R') +
    (problem ? d.orderId : d.amount + ' — ' + d.product) +
    (!problem && noEmail ? (waLink ? ' — 📱 no email, send receipt on WhatsApp' : ' — 📱 no email, check phone number') : '')
  var receiptLine = waLink
    ? (noEmail ? '📱 NO EMAIL GIVEN — send the customer their receipt on WhatsApp:\n' : '📱 Send the customer their receipt on WhatsApp:\n') + waLink + '\n'
    : (!problem && noEmail ? '📱 No email given and the phone number could not be read — contact the customer by phone.\n' : '')
  var body = [
    problem ? 'PayFast says this was paid, but the amount or items do not match the order. Check it in the PayFast dashboard before buying anything.\n' : 'You have a new paid order.\n\n' + receiptLine + '\n' + carts.join('\n\n') + '\n',
    'Order: ' + d.orderId,
    'Amount: R' + d.amount,
    'Items: ' + d.product,
    '',
    'Customer: ' + name,
    'Phone: ' + d.phone,
    'Email: ' + (noEmail ? '(none given)' : d.email),
    'Address: ' + [d.address, d.city, d.province, d.postalCode].filter(Boolean).join(', '),
    '',
    'Items to buy (if the link does not work):',
    itemLines.replace(/; /g, '\n  '),
    '',
    'Then add the tracking number in the sheet: ' + ss.getUrl(),
  ].join('\n')
  try {
    // The button replaces the long raw link in the formatted email
    var html = escapeHtml(waLink ? body.replace(receiptLine, '') : body).replace(/\n/g, '<br>')
    if (waLink) {
      var button = '<p><a href="' + escapeHtml(waLink) + '" style="display:inline-block;background:#25D366;color:#ffffff;' +
        'padding:12px 20px;border-radius:24px;text-decoration:none;font-weight:bold">Send receipt on WhatsApp</a></p>'
      html = (noEmail ? '<p><b>📱 No email given — WhatsApp is the only way to send this customer a receipt.</b></p>' : '') + button + html
    }
    MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, body: body, htmlBody: html, name: 'Ze Home Finds orders' })
  } catch (err) {
    console.error('Order email failed: ' + err) // the sheet row is still written
  }
}

// South African number as WhatsApp wants it (27XXXXXXXXX), or '' if unreadable
function waNumber(phone) {
  var digits = String(phone || '').replace(/\D/g, '')
  if (/^0\d{9}$/.test(digits)) digits = '27' + digits.slice(1)
  return /^27\d{9}$/.test(digits) ? digits : ''
}

// wa.me link that opens a chat with the customer, receipt text filled in
function whatsappReceiptLink(d) {
  var number = waNumber(d.phone)
  if (!number) return ''
  var ref = (String(d.reminder || '').match(/PayFast ref: (\S+)/) || [])[1]
  var text = [
    'Hi ' + (d.firstName || 'there') + ', thank you for your Ze Home Finds order! 🧾',
    '',
    'Receipt',
    'Order: ' + d.orderId,
    'Items: ' + d.product,
    'Total paid: R' + d.amount + ' (PayFast' + (ref ? ' ref ' + ref : '') + ')',
    'Delivery: free, to ' + [d.address, d.city, d.postalCode].filter(Boolean).join(', '),
    '',
    'We will send your tracking number here as soon as it ships.',
  ].join('\n')
  return 'https://wa.me/' + number + '?text=' + encodeURIComponent(text)
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function findRow(sheet, idCol, orderId) {
  var last = sheet.getLastRow()
  if (idCol < 0 || last < 2) return -1
  var ids = sheet.getRange(2, idCol + 1, last - 1, 1).getValues()
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === orderId) return i + 2
  }
  return -1
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
