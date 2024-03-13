import xlsx from 'xlsx'
import { Columns, InvoicesData, RowData, Status } from '../types'

export function processWorkbook(workbook: xlsx.WorkBook, _date: string) {
  // Extracting data from the first sheet
  // TODO: handle multiple sheets
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const { invoicesData, currencyRates, invoicingMonth } =
    processInvoicesData(sheet)

  return { invoicingMonth, currencyRates, invoicesData }
}

function processInvoicesData(sheet: xlsx.WorkSheet) {
  const currencyRates = getCurrencyRates(sheet)
  const columns = Object.values(Columns)

  const rawData: Array<RowData> = xlsx.utils.sheet_to_json(sheet, {
    header: columns,
    blankrows: false,
  })
  // Filter relevant lines
  const relevantLines = rawData.filter((row: RowData) => {
    if (columns.every((column) => row[column] === column)) {
      return false
    }
    return row[Columns.Status] === Status.Ready || row[Columns.InvoiceNo]
  })

  // TODO: Extract invoicing month from the file and validate with input
  const invoicingMonth = new Date().toISOString().slice(0, 7)

  const invoicesData: Array<InvoicesData> = []
  const mandatoryFields = columns.slice(0, -2)
  const numberFields = [
    Columns.Quantity,
    Columns.PricePerItem,
    Columns.TotalPrice,
  ]
  const validationFields = [...mandatoryFields, ...numberFields]

  // Iterate through relevant lines
  relevantLines.forEach((row: RowData) => {
    // Perform additional validations
    const validationErrors: Array<string> = []
    validationFields.forEach((field) => {
      if (row[field] === undefined || row[field] === '') {
        validationErrors.push(`${field} is required.`)
      } else if (Number.isNaN(Number(row[field]))) {
        validationErrors.push(`${field} must be numeric.`)
      }
    })

    const data = columns.map((key) => ({
      [key]: row[key] || null,
    }))

    // Append the record to invoicesData
    invoicesData.push({
      ...Object.assign({}, ...data),
      validationErrors,
    })
  })

  calculateInvoiceTotal(invoicesData, currencyRates)

  return { invoicesData, invoicingMonth, currencyRates }
}

function getCurrencyRates(sheet: Record<string, any>) {
  const rawData: Array<{ Currency: string; Rate?: number }> =
    xlsx.utils.sheet_to_json(sheet, {
      header: ['Currency', 'Rate'],
      blankrows: false,
    })

  const currencyRates: Record<string, number> = {}

  rawData.forEach((row) => {
    if (row?.['Currency']?.includes('Rate')) {
      const [key] = row['Currency'].split(' ')
      currencyRates[key] = Number(row['Rate'])
    }
  })

  return currencyRates
}

// TODO: refactor this to make it more safe
function calculateInvoiceTotal(
  invoicesData: Array<InvoicesData>,
  currencyRates: Record<string, any>,
) {
  invoicesData.forEach((invoice) => {
    const totalPrice = Number(invoice[Columns.TotalPrice])
    const itemCurrency = invoice[Columns.ItemPriceCurrency] || ''
    const invoiceCurrency = invoice[Columns.InvoiceCurrency] || ''

    // If the currencies are different, convert the Total Price to the Invoice Currency
    if (itemCurrency !== invoiceCurrency) {
      const conversionRate = currencyRates[itemCurrency]

      if (!conversionRate || !currencyRates[invoiceCurrency]) {
        invoice.validationErrors.push('Currency rate not found')
      }

      const invoiceTotal =
        (totalPrice / conversionRate) * currencyRates[invoiceCurrency]

      invoice['Invoice Total'] = Number.isNaN(invoiceTotal)
        ? null
        : invoiceTotal.toFixed(2)
    } else {
      invoice['Invoice Total'] = Number.isNaN(totalPrice)
        ? null
        : totalPrice.toFixed(2)
    }
  })
}
