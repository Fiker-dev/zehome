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
 * Install: Extensions > Apps Script > replace Code.gs with this file > Save >
 * Deploy > Manage deployments > (pencil) > Version: New version > Deploy.
 * Editing the existing deployment keeps the same URL, so Vercel needs no change.
 */

var SHEET_NAME = 'Orders'
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
    if (!data.orderId) return reply({ ok: false, error: 'orderId required' })
    var ss = SpreadsheetApp.getActiveSpreadsheet()
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
  var subject = (problem ? '⚠️ DO NOT DISPATCH — check payment ' : '🛒 New paid order R') +
    (problem ? d.orderId : d.amount + ' — ' + d.product)
  var body = [
    problem ? 'PayFast says this was paid, but the amount or items do not match the order. Check it in the PayFast dashboard before buying anything.\n' : 'You have a new paid order.\n\n' + carts.join('\n\n') + '\n',
    'Order: ' + d.orderId,
    'Amount: R' + d.amount,
    'Items: ' + d.product,
    '',
    'Customer: ' + name,
    'Phone: ' + d.phone,
    'Email: ' + d.email,
    'Address: ' + [d.address, d.city, d.province, d.postalCode].filter(Boolean).join(', '),
    '',
    'Items to buy (if the link does not work):',
    itemLines.replace(/; /g, '\n  '),
    '',
    'Then add the tracking number in the sheet: ' + ss.getUrl(),
  ].join('\n')
  try {
    MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, body: body, name: 'Ze Home Finds orders' })
  } catch (err) {
    console.error('Order email failed: ' + err) // the sheet row is still written
  }
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
