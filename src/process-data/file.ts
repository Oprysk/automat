import xlsx from 'xlsx'
import { Columns, InvoicesData, RowData, Status } from '../types'
import { getOrValidateSheetDate } from './date'
import { FileStructureError } from '../errors/FileStructureError'
import { compareArray } from '../utils/array'

export function processWorkbook(workbook: xlsx.WorkBook, date: string) {
  // Extracting data from the first sheet
  // TODO: handle multiple sheets
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  validateFileStructure(sheet)

  const invoicingMonth = getOrValidateSheetDate(sheet, date)

  const { invoicesData, currencyRates } = processInvoicesData(sheet)

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

  const invoicesData: Array<InvoicesData> = []
  const mandatoryFields = columns.slice(0, -2)
  const numericFields = [
    Columns.Quantity,
    Columns.PricePerItem,
    Columns.TotalPrice,
  ]

  // Iterate through relevant lines
  relevantLines.forEach((row: RowData) => {
    // Perform additional validations
    const validationErrors: Array<string> = []
    mandatoryFields.forEach((field) => {
      if (row[field] === undefined || row[field] === '') {
        validationErrors.push(`${field} is required.`)
      }
    })
    numericFields.forEach((field) => {
      if (
        Number.isNaN(Number(row[field])) &&
        !validationErrors.some((error) => error.includes(field))
      ) {
        validationErrors.push(`${field} must be numeric.`)
      }
    })

    const data = columns.map((key) => ({
      [key]: row[key] || null,
    }))

    const { invoiceTotal, errors } = calculateInvoiceTotal(row, currencyRates)

    // Append the record to invoicesData
    invoicesData.push({
      ...Object.assign({}, ...data),
      invoiceTotal,
      validationErrors: [...validationErrors, ...errors],
    })
  })

  return { invoicesData, currencyRates }
}

function getCurrencyRates(sheet: Record<string, number>) {
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

function calculateInvoiceTotal(
  data: RowData,
  currencyRates: Record<string, number>,
): {
  invoiceTotal: number | null
  errors: Array<string>
} {
  let totalPrice = data[Columns.TotalPrice]
  const invoiceCurrency = data[Columns.InvoiceCurrency]
  const itemPriceCurrency = data[Columns.ItemPriceCurrency] || ''
  const quantity = data[Columns.Quantity]
  const pricePerItem = data[Columns.PricePerItem]
  let invoiceTotal = null
  const errors: Array<string> = []

  if (!totalPrice && quantity && pricePerItem) {
    totalPrice = quantity * pricePerItem
  }

  if (!totalPrice) {
    return { invoiceTotal, errors }
  }

  if (!invoiceCurrency) {
    return { invoiceTotal, errors }
  }

  if (itemPriceCurrency === invoiceCurrency) {
    return { invoiceTotal: totalPrice, errors }
  }

  if (invoiceCurrency in currencyRates) {
    if (!currencyRates[itemPriceCurrency] || !currencyRates[invoiceCurrency]) {
      errors.push('Exchange rates not available for the provided currencies.')
    }
    const exchangeRate =
      currencyRates[itemPriceCurrency] / currencyRates[invoiceCurrency]
    invoiceTotal = +(totalPrice * exchangeRate).toFixed(4)
  } else {
    errors.push(`Conversion rate not found for currency: ${invoiceCurrency}`)
  }

  return { invoiceTotal, errors }
}

function validateFileStructure(sheet: xlsx.WorkSheet) {
  const columns = Object.values(Columns)
  const [firstRow, ...restRows] = xlsx.utils.sheet_to_json<Array<string>>(
    sheet,
    {
      header: 1,
    },
  )

  if (!firstRow.length) {
    throw new FileStructureError(
      'File structure is invalid: First row is empty but should contain invoicing date.',
    )
  }

  const filteredRows = restRows.filter((row) => row.length)

  let currencyRateRows = 0
  let invoiceDataRows = false

  for (let i = 0; i < filteredRows.length; i++) {
    if (filteredRows[i].some((value) => value?.toString()?.includes('Rate'))) {
      currencyRateRows += 1
      continue
    }

    if (compareArray(filteredRows[i], columns)) {
      invoiceDataRows = true
      break
    }
  }

  if (!currencyRateRows || !invoiceDataRows) {
    throw new FileStructureError(
      `File structure is invalid: ${
        !currencyRateRows
          ? 'Currency rate rows are missing.'
          : 'Invoice data rows are missing.'
      }`,
    )
  }
}
