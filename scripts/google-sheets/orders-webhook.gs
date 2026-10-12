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
 *
 * Unpaid reminders: remindUnpaid() runs every 15 minutes (install once by
 * running installReminderTrigger from the editor). For each order still
 * "Pending payment" 1-48 hours after checkout it sends the customer ONE
 * reminder email (if they gave one, with a one-click opt-out) and emails the
 * owner a WhatsApp button per order. The "Cart reminder" column records what
 * was sent, so nothing is sent twice. installReminderTrigger also saves this
 * web app's /exec URL as Script property WEBAPP_URL for the opt-out link.
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

var STORE_URL = 'https://www.zehomefinds.co.za'
var STORE_WHATSAPP = '27710278563'
var REMIND_AFTER_MS = 60 * 60 * 1000       // 1 hour after checkout
var REMIND_UNTIL_MS = 48 * 60 * 60 * 1000  // never chase orders older than 2 days
var REMINDER_COL = 'Cart reminder'

// Run once from the editor: installs the 15-minute reminder check
function installReminderTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'remindUnpaid') ScriptApp.deleteTrigger(t)
  })
  ScriptApp.newTrigger('remindUnpaid').timeBased().everyMinutes(15).create()
  // The opt-out link points at this web app; remember its /exec URL
  var props = PropertiesService.getScriptProperties()
  var url = ScriptApp.getService().getUrl()
  // Only the public /exec URL works for customers (the editor reports /dev)
  if (url && /\/exec$/.test(url)) props.setProperty('WEBAPP_URL', url)
  console.log('Reminder trigger installed; opt-out links use ' + (props.getProperty('WEBAPP_URL') || '(no web app URL!)'))
}

function remindUnpaid() {
  var lock = LockService.getScriptLock()
  if (!lock.tryLock(10000)) return // a webhook is writing; try next run
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID)
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0]
    var lastCol = sheet.getLastColumn()
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h).trim() })
    var remCol = headers.indexOf(REMINDER_COL)
    if (remCol < 0) {
      remCol = lastCol
      sheet.getRange(1, remCol + 1).setValue(REMINDER_COL)
      headers.push(REMINDER_COL)
    }
    var last = sheet.getLastRow()
    if (last < 2) return
    var rows = sheet.getRange(2, 1, last - 1, headers.length).getValues()
    var col = function (name) { return headers.indexOf(name) }
    var get = function (r, name) { var i = col(name); return i < 0 ? '' : String(r[i] == null ? '' : r[i]).replace(/^'/, '').trim() }
    var optedOut = optOutList()
    // Customers who have a paid order: never chase them for an older cart
    var paid = {}
    rows.forEach(function (r) {
      if (/^Paid/.test(get(r, 'Payment Status'))) {
        if (get(r, 'Email')) paid[get(r, 'Email').toLowerCase()] = true
        if (waNumber(get(r, 'Phone'))) paid[waNumber(get(r, 'Phone'))] = true
      }
    })
    var now = Date.now()
    var forOwner = []
    rows.forEach(function (r, i) {
      if (get(r, 'Payment Status') !== 'Pending payment' || get(r, REMINDER_COL)) return
      var placed = r[col('Date')] instanceof Date ? r[col('Date')].getTime() : Date.parse(get(r, 'Date'))
      if (!placed || now - placed < REMIND_AFTER_MS || now - placed > REMIND_UNTIL_MS) return
      var d = {
        orderId: get(r, 'Order ID'), name: get(r, 'Name'), email: get(r, 'Email'), phone: get(r, 'Phone'),
        product: get(r, 'Product'), amount: get(r, 'Amount'),
      }
      if (!d.orderId || /^TEST/i.test(d.orderId)) return
      var email = d.email.toLowerCase()
      var wa = waNumber(d.phone)
      if (paid[email] || (wa && paid[wa])) {
        sheet.getRange(i + 2, remCol + 1).setValue('Skipped: customer has a paid order')
        return
      }
      var sent = []
      if (/@/.test(email) && !optedOut[email] && !(wa && optedOut[wa])) {
        // Customers must never get mail from the owner's personal Gmail: only
        // send once Script property CUSTOMER_EMAIL_FROM (the store address) is set
        if (!PropertiesService.getScriptProperties().getProperty('CUSTOMER_EMAIL_FROM')) {
          sent.push('customer email held (store address not set up yet)')
        } else {
          try {
            sendCustomerReminder(d)
            sent.push('email to customer')
          } catch (err) {
            console.error('Reminder email failed for ' + d.orderId + ': ' + err)
          }
        }
      }
      d.waLink = wa && !optedOut[wa] && !optedOut[email] ? whatsappReminderLink(d, wa) : ''
      if (d.waLink) forOwner.push(d)
      sent.push(d.waLink ? 'WhatsApp button to owner' : 'no WhatsApp (number unreadable or opted out)')
      sheet.getRange(i + 2, remCol + 1).setValue(Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM-dd HH:mm') + ' — ' + sent.join(', '))
    })
    if (forOwner.length) sendOwnerReminderDigest(forOwner, ss)
  } finally {
    lock.releaseLock()
  }
}

function firstName(name) { return String(name || '').split(' ')[0] || 'there' }

function sendCustomerReminder(d) {
  var optOut = optOutLink(d.email)
  var text = [
    'Hi ' + firstName(d.name) + ',',
    '',
    'You started an order at Ze Home Finds but the payment did not go through:',
    '  ' + d.product + ' — R' + d.amount,
    '',
    'If you still want it, you can complete your order here: ' + STORE_URL + '/checkout',
    '(open it on the same phone or computer you used, or add the items again from the shop).',
    'Questions or trouble paying? WhatsApp us: https://wa.me/' + STORE_WHATSAPP,
    '',
    'This is the only reminder we will send about this order.',
    optOut ? 'Don\'t want reminders? ' + optOut : '',
    '',
    'Ze Home Finds',
  ].join('\n')
  var html = '<div style="font-family:Arial,sans-serif;font-size:15px;color:#222;max-width:520px">' +
    '<p>Hi ' + escapeHtml(firstName(d.name)) + ',</p>' +
    '<p>You started an order at Ze Home Finds but the payment did not go through:<br><b>' +
    escapeHtml(d.product) + ' — R' + escapeHtml(d.amount) + '</b></p>' +
    '<p><a href="' + STORE_URL + '/checkout" style="display:inline-block;background:#1f1f1f;color:#fff;padding:12px 22px;' +
    'border-radius:24px;text-decoration:none;font-weight:bold">Complete my order</a></p>' +
    '<p style="font-size:13px;color:#555">Open it on the same phone or computer you used, or add the items again from the ' +
    '<a href="' + STORE_URL + '">shop</a>. Questions or trouble paying? ' +
    '<a href="https://wa.me/' + STORE_WHATSAPP + '">WhatsApp us</a>.</p>' +
    '<p style="font-size:12px;color:#777">This is the only reminder we will send about this order.' +
    (optOut ? ' <a href="' + escapeHtml(optOut) + '" style="color:#777">Don\'t want reminders? Opt out</a>.' : '') + '</p>' +
    '<p>Ze Home Finds</p></div>'
  MailApp.sendEmail({ to: d.email, subject: 'Your Ze Home Finds order is waiting', body: text, htmlBody: html, name: 'Ze Home Finds' })
}

function whatsappReminderLink(d, number) {
  var text = 'Hi ' + firstName(d.name) + ', this is Ze Home Finds. Your order (' + d.product + ', R' + d.amount +
    ') was not paid yet. Can we help you complete it? Reply STOP if you would rather not hear from us.'
  return 'https://wa.me/' + number + '?text=' + encodeURIComponent(text)
}

function sendOwnerReminderDigest(list, ss) {
  var body = ['Unpaid orders from 1+ hour ago. Tap to send a WhatsApp reminder:', '']
  var html = '<div style="font-family:Arial,sans-serif;font-size:14px"><p>Unpaid orders from 1+ hour ago. Tap to send a WhatsApp reminder:</p>'
  list.forEach(function (d) {
    body.push(d.name + ' — ' + d.product + ' — R' + d.amount + ' (' + d.orderId + ')', d.waLink, '')
    html += '<p>' + escapeHtml(d.name) + ' — ' + escapeHtml(d.product) + ' — R' + escapeHtml(d.amount) +
      '<br><span style="color:#777;font-size:12px">' + escapeHtml(d.orderId) + '</span><br>' +
      '<a href="' + escapeHtml(d.waLink) + '" style="display:inline-block;margin-top:6px;background:#25D366;color:#fff;' +
      'padding:10px 18px;border-radius:22px;text-decoration:none;font-weight:bold">WhatsApp reminder</a></p>'
  })
  body.push('Sheet: ' + ss.getUrl())
  html += '<p style="font-size:12px;color:#777">Sheet: ' + escapeHtml(ss.getUrl()) + '</p></div>'
  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: '⏰ ' + list.length + ' unpaid order' + (list.length > 1 ? 's' : '') + ' — WhatsApp reminder', body: body.join('\n'), htmlBody: html, name: 'Ze Home Finds orders' })
}

// --- Opt-out (POPIA): signed one-click link handled by doGet ---------------

function optOutSig(id) {
  var secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET') || ''
  var raw = Utilities.computeHmacSha256Signature('optout|' + id, secret)
  return raw.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2) }).join('').slice(0, 24)
}

function optOutLink(id) {
  var base = PropertiesService.getScriptProperties().getProperty('WEBAPP_URL')
  if (!base) return ''
  id = String(id).toLowerCase().trim()
  return base + '?optout=' + encodeURIComponent(id) + '&sig=' + optOutSig(id)
}

function optOutList() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('OPTED_OUT') || '{}') } catch (e) { return {} }
}

function doGet(e) {
  var id = String((e && e.parameter && e.parameter.optout) || '').toLowerCase().trim()
  var ok = id && e.parameter.sig === optOutSig(id)
  if (ok) {
    var lock = LockService.getScriptLock()
    lock.waitLock(10000)
    try {
      var list = optOutList()
      list[id] = new Date().toISOString().slice(0, 10)
      PropertiesService.getScriptProperties().setProperty('OPTED_OUT', JSON.stringify(list))
    } finally {
      lock.releaseLock()
    }
  }
  return HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;max-width:480px;margin:40px auto;font-size:16px">' +
    (ok ? '<h2>You\'re unsubscribed</h2><p>Ze Home Finds will not send you order reminders again.</p>'
        : '<h2>Link not valid</h2><p>This opt-out link is incomplete. Reply to our email or WhatsApp us and we\'ll remove you.</p>') +
    '<p><a href="' + STORE_URL + '">Back to the shop</a></p></div>'
  ).setTitle('Ze Home Finds')
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
