import xlsx from 'xlsx'
import dayjs from 'dayjs'
import { InvoicingMonthMismatchError } from '../errors/InvoicingMonthMistmatchError'

const DATE_FORMAT = 'YYYY-MM'

export function getOrValidateSheetDate(
  sheet: xlsx.WorkSheet,
  date: string,
): string {
  const [sheetDate] = xlsx.utils.sheet_to_json<Array<string>>(sheet, {
    header: 1,
  })[0]

  const formattedDateFromSheet = dayjs(sheetDate).format(DATE_FORMAT)

  if (dayjs(date).format(DATE_FORMAT) !== formattedDateFromSheet) {
    throw new InvoicingMonthMismatchError()
  } else {
    return formattedDateFromSheet
  }
}
