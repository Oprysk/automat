import express from 'express'
import xlsx from 'xlsx'
import multer from 'multer'
import type { Request, Response } from 'express'

import { processWorkbook } from './process-data/file'
import { InvoicingMonthMismatchError } from './errors/InvoicingMonthMistmatchError'
import { FileStructureError } from './errors/FileStructureError'

export const router = express.Router()

// Multer configuration for file upload
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    // Validate file structure
    const workbook = xlsx.read(req.file?.buffer, { type: 'buffer' })
    // Extract relevant data from the workbook
    const { invoicingMonth, currencyRates, invoicesData } = processWorkbook(
      workbook,
      req.body.invoicingMonth,
    )
    // Send the processed data as the response
    res.json({
      invoicingMonth,
      currencyRates,
      invoicesData,
    })
  } catch (error) {
    if (
      error instanceof InvoicingMonthMismatchError ||
      error instanceof FileStructureError
    ) {
      return res.status(422).send(error.message)
    }

    res.status(500).send('Internal Server Error')
  }
})
