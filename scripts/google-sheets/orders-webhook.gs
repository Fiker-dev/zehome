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
 * Install: Extensions > Apps Script > replace Code.gs with this file > Save >
 * Deploy > Manage deployments > (pencil) > Version: New version > Deploy.
 * Editing the existing deployment keeps the same URL, so Vercel needs no change.
 */

var SHEET_NAME = 'Orders'

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
    return reply({ ok: true, row: row === -1 ? sheet.getLastRow() : row })
  } finally {
    lock.releaseLock()
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
